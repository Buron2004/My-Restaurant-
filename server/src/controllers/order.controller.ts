import type { Request, Response } from 'express'
import { createOrderSchema } from '../schemas/order.schema.js'
import { placeOrder } from '../services/order.service.js'
import { sendSuccess } from '../utils/api-response.js'

export async function createOrderController(request: Request, response: Response) {
  const input = createOrderSchema.parse(request.body)
  const order = await placeOrder(input)
  return sendSuccess(response, order, {}, 201)
}