import { randomInt } from 'node:crypto'
import { Prisma } from '@prisma/client'
import type { PaymentMethod } from '@prisma/client'
import { MAX_QUANTITY_PER_ITEM, MIN_ORDER_KOBO, getBankDetails } from '../config/order.js'
import { AppError } from '../middleware/error-handler.js'
import { findActiveDefaultZone, findMatchingZoneForZip } from '../repositories/delivery-zone.repository.js'
import { createOrderRecord, findMealsByIds } from '../repositories/order.repository.js'
import type { CreateOrderInput } from '../schemas/order.schema.js'
import { cancelOrderById, findOrderByReferenceAndPhone } from '../repositories/order.repository.js'
import type { LookupOrderInput } from '../schemas/order.schema.js'
import {
  findOrderById,
  listOrders,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from '../repositories/order.repository.js'
import type { OrderListQuery, UpdateOrderPaymentStatusInput, UpdateOrderStatusInput } from '../schemas/order.schema.js'

const REFERENCE_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // no 0/O/1/I — easier to read aloud
const MAX_REFERENCE_ATTEMPTS = 5

function generateReferenceCode(): string {
  let code = ''
  for (let index = 0; index < 6; index++) {
    code += REFERENCE_CHARSET[randomInt(REFERENCE_CHARSET.length)]
  }
  return `ORD-${code}`
}

function formatNaira(kobo: number): string {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(kobo / 100)
}

function buildPaymentInstructions(method: PaymentMethod, referenceCode: string) {
  if (method !== 'BANK_TRANSFER') return null
  return { ...getBankDetails(), narration: referenceCode }
}

export async function placeOrder(input: CreateOrderInput) {
  // 1. Merge duplicate lines so one meal can't appear twice in an order.
  const quantities = new Map<string, number>()
  for (const line of input.items) {
    quantities.set(line.mealId, (quantities.get(line.mealId) ?? 0) + line.quantity)
  }
  for (const quantity of quantities.values()) {
    if (quantity > MAX_QUANTITY_PER_ITEM) {
      throw new AppError('INVALID_QUANTITY', `You can order at most ${MAX_QUANTITY_PER_ITEM} of any single item.`, 400)
    }
  }

  // 2. Load the REAL meals and prices from the database — never trust the client.
  const meals = await findMealsByIds([...quantities.keys()])
  const mealById = new Map(meals.map((meal) => [meal.id, meal]))

  const lines: { mealId: string; mealName: string; unitPrice: number; quantity: number }[] = []
  for (const [mealId, quantity] of quantities) {
    const meal = mealById.get(mealId)
    if (!meal) {
      throw new AppError('MEAL_NOT_FOUND', 'An item in your cart is no longer on the menu. Please refresh and try again.', 400)
    }
    if (meal.status !== 'AVAILABLE') {
      throw new AppError('MEAL_UNAVAILABLE', `${meal.name} is currently unavailable. Please remove it from your cart.`, 409)
    }
    lines.push({ mealId, mealName: meal.name, unitPrice: meal.price, quantity })
  }

  // 3. Enforce the minimum order on the server-computed subtotal.
  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0)
  if (subtotal < MIN_ORDER_KOBO) {
    throw new AppError('BELOW_MINIMUM_ORDER', `The minimum order is ${formatNaira(MIN_ORDER_KOBO)}.`, 400)
  }

  // 4. Delivery fee: match the zip to a zone; no zip means the default zone.
  const zip = input.deliveryZip?.trim()
  const zone = zip ? await findMatchingZoneForZip(zip) : await findActiveDefaultZone()
  if (!zone) {
    throw new AppError('DELIVERY_NOT_AVAILABLE', 'Sorry, we do not currently deliver to this area.', 422)
  }

  // 5. Create the order + items atomically. Prices and zone are snapshotted onto the order.
  for (let attempt = 1; attempt <= MAX_REFERENCE_ATTEMPTS; attempt++) {
    const referenceCode = generateReferenceCode()
    try {
      const order = await createOrderRecord({
        referenceCode,
        guestName: input.guestName,
        guestPhone: input.guestPhone,
        guestEmail: input.guestEmail || null,
        deliveryStreet: input.deliveryStreet,
        deliveryCity: input.deliveryCity,
        deliveryZip: zip || null,
        deliveryZoneLabel: zone.label,
        paymentMethod: input.paymentMethod,
        subtotal,
        deliveryFee: zone.fee,
        total: subtotal + zone.fee,
        specialInstructions: input.specialInstructions || null,
        items: {
          create: lines.map((line) => ({
            mealName: line.mealName,
            unitPrice: line.unitPrice,
            quantity: line.quantity,
            meal: { connect: { id: line.mealId } },
          })),
        },
      })
      return { ...order, paymentInstructions: buildPaymentInstructions(order.paymentMethod, order.referenceCode) }
    } catch (error) {
      const isReferenceCollision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002'
      if (!isReferenceCollision || attempt === MAX_REFERENCE_ATTEMPTS) throw error
      // Vanishingly unlikely code collision — loop and try a fresh code.
    }
  }

  throw new AppError('ORDER_CREATE_FAILED', 'Could not place your order. Please try again.', 500)
}

const CANCELLABLE_ORDER_STATUSES = ['PENDING', 'CONFIRMED']

// Same generic-error principle as reservation lookup: never reveal whether the
// reference or the phone was the part that didn't match.
async function findOrderOrThrow(input: LookupOrderInput) {
  const normalizedCode = input.referenceCode.trim().toUpperCase()
  const order = await findOrderByReferenceAndPhone(normalizedCode, input.guestPhone.trim())

  if (!order) {
    throw new AppError('ORDER_NOT_FOUND', 'No order was found matching that reference and phone number.', 404)
  }

  return order
}

export async function lookupOrder(input: LookupOrderInput) {
  return findOrderOrThrow(input)
}

export async function cancelOrderByLookup(input: LookupOrderInput) {
  const order = await findOrderOrThrow(input)

  if (!CANCELLABLE_ORDER_STATUSES.includes(order.status)) {
    throw new AppError(
      'ORDER_NOT_CANCELLABLE',
      'This order can no longer be cancelled online. Please contact the restaurant directly.',
      409,
    )
  }

  return cancelOrderById(order.id)
}

const ALLOWED_ORDER_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

export async function getOrders(query: OrderListQuery) {
  return listOrders(query.status)
}

export async function transitionOrderStatus(id: string, input: UpdateOrderStatusInput) {
  const order = await findOrderById(id)
  if (!order) throw new AppError('ORDER_NOT_FOUND', 'Order not found.', 404)

  const allowedNext = ALLOWED_ORDER_TRANSITIONS[order.status] ?? []
  if (!allowedNext.includes(input.status)) {
    throw new AppError('INVALID_STATUS_TRANSITION', `Cannot move an order from ${order.status} to ${input.status}.`, 409)
  }

  return updateOrderStatus(id, input.status)
}

export async function markOrderPaymentStatus(id: string, input: UpdateOrderPaymentStatusInput) {
  const order = await findOrderById(id)
  if (!order) throw new AppError('ORDER_NOT_FOUND', 'Order not found.', 404)

  return updateOrderPaymentStatus(id, input.paymentStatus)
}