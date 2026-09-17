import type { Request, Response } from 'express'
import { availabilityQuerySchema } from '../schemas/reservation.schema.js'
import { getAvailability } from '../services/reservation.service.js'
import { sendSuccess } from '../utils/api-response.js'
import { createReservationSchema } from '../schemas/reservation.schema.js'
import { createReservation } from '../services/reservation.service.js'
import { lookupReservationSchema } from '../schemas/reservation.schema.js'
import { cancelReservationByLookup, lookupReservation } from '../services/reservation.service.js'

export async function lookupReservationController(request: Request, response: Response) {
  const input = lookupReservationSchema.parse({
    referenceCode: request.query.ref,
    guestPhone: request.query.phone,
  })
  const reservation = await lookupReservation(input)
  return sendSuccess(response, reservation)
}

export async function cancelReservationController(request: Request, response: Response) {
  const input = lookupReservationSchema.parse(request.body)
  const reservation = await cancelReservationByLookup(input)
  return sendSuccess(response, reservation)
}

export async function createReservationController(request: Request, response: Response) {
  const input = createReservationSchema.parse(request.body)
  const reservation = await createReservation(input)
  return sendSuccess(response, reservation, {}, 201)
}

export async function getAvailabilityController(request: Request, response: Response) {
  const query = availabilityQuerySchema.parse(request.query)
  const result = await getAvailability(query)
  return sendSuccess(response, result)
}