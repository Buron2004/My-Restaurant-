import type { Request, Response } from 'express'
import { createOrderSchema } from '../schemas/order.schema.js'
import { placeOrder } from '../services/order.service.js'
import { sendSuccess } from '../utils/api-response.js'
import { lookupOrderSchema } from '../schemas/order.schema.js'
import { cancelOrderByLookup, lookupOrder } from '../services/order.service.js'

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