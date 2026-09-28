import type { Request, Response } from 'express'
import {
  createDeliveryZoneSchema,
  deliveryZoneIdSchema,
  updateDeliveryZoneSchema,deliveryQuoteQuerySchema,
} from '../schemas/delivery-zone.schema.js'
import { addDeliveryZone, editDeliveryZone, getDeliveryZones,getDeliveryQuote } from '../services/delivery-zone.service.js'
import { sendSuccess } from '../utils/api-response.js'

export async function listDeliveryZonesController(request: Request, response: Response) {
  const zones = await getDeliveryZones()
  return sendSuccess(response, zones)
}

export async function createDeliveryZoneController(request: Request, response: Response) {
  const input = createDeliveryZoneSchema.parse(request.body)
  const zone = await addDeliveryZone(input)
  return sendSuccess(response, zone, {}, 201)
}

export async function updateDeliveryZoneController(request: Request, response: Response) {
  const { id } = deliveryZoneIdSchema.parse(request.params)
  const input = updateDeliveryZoneSchema.parse(request.body)
  const zone = await editDeliveryZone(id, input)
  return sendSuccess(response, zone)
}

export async function getDeliveryQuoteController(request: Request, response: Response) {
  const { zip } = deliveryQuoteQuerySchema.parse(request.query)
  const quote = await getDeliveryQuote(zip)
  return sendSuccess(response, quote)
}