import type { Request, Response } from 'express'
import { createOrderSchema } from '../schemas/order.schema.js'
import { placeOrder } from '../services/order.service.js'
import { sendSuccess } from '../utils/api-response.js'
import { lookupOrderSchema } from '../schemas/order.schema.js'
import { cancelOrderByLookup, lookupOrder } from '../services/order.service.js'
import {
  orderIdSchema,
  orderListQuerySchema,
  updateOrderPaymentStatusSchema,
  updateOrderStatusSchema,
} from '../schemas/order.schema.js'
import { getOrders, markOrderPaymentStatus, transitionOrderStatus } from '../services/order.service.js'

export async function listOrdersController(request: Request, response: Response) {
  const query = orderListQuerySchema.parse(request.query)
  const orders = await getOrders(query)
  return sendSuccess(response, orders)
}

export async function updateOrderStatusController(request: Request, response: Response) {
  const { id } = orderIdSchema.parse(request.params)
  const input = updateOrderStatusSchema.parse(request.body)
  const order = await transitionOrderStatus(id, input)
  return sendSuccess(response, order)
}

export async function updateOrderPaymentStatusController(request: Request, response: Response) {
  const { id } = orderIdSchema.parse(request.params)
  const input = updateOrderPaymentStatusSchema.parse(request.body)
  const order = await markOrderPaymentStatus(id, input)
  return sendSuccess(response, order)
}

export async function lookupOrderController(request: Request, response: Response) {
  const input = lookupOrderSchema.parse({
    referenceCode: request.query.ref,
    guestPhone: request.query.phone,
  })
  const order = await lookupOrder(input)
  return sendSuccess(response, order)
}

export async function cancelOrderController(request: Request, response: Response) {
  const input = lookupOrderSchema.parse(request.body)
  const order = await cancelOrderByLookup(input)
  return sendSuccess(response, order)
}

export async function createOrderController(request: Request, response: Response) {
  const input = createOrderSchema.parse(request.body)
  const order = await placeOrder(input)
  return sendSuccess(response, order, {}, 201)
}