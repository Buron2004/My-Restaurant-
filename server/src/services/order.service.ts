import { randomInt } from 'node:crypto'
import { Prisma } from '@prisma/client'
import type { PaymentMethod } from '@prisma/client'
import { MAX_QUANTITY_PER_ITEM, MIN_ORDER_KOBO, getBankDetails } from '../config/order.js'
import { AppError } from '../middleware/error-handler.js'
import { findActiveDefaultZone, findMatchingZoneForZip } from '../repositories/delivery-zone.repository.js'
import { createOrderRecord, findMealsByIds } from '../repositories/order.repository.js'
import type { CreateOrderInput } from '../schemas/order.schema.js'

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