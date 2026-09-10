import type { Request, Response } from 'express'
import { availabilityQuerySchema } from '../schemas/reservation.schema.js'
import { getAvailability } from '../services/reservation.service.js'
import { sendSuccess } from '../utils/api-response.js'

export async function getAvailabilityController(request: Request, response: Response) {
  const query = availabilityQuerySchema.parse(request.query)
  const result = await getAvailability(query)
  return sendSuccess(response, result)
}