import { AppError } from '../middleware/error-handler.js'
import {
  createDeliveryZone,
  findDefaultZoneExcludingId,
  findDeliveryZoneById,
  findDeliveryZoneByZipPrefixExcludingId,
  listDeliveryZones,
  updateDeliveryZone,
  findActiveDefaultZone,findMatchingZoneForZip,
} from '../repositories/delivery-zone.repository.js'
import type { CreateDeliveryZoneInput, UpdateDeliveryZoneInput } from '../schemas/delivery-zone.schema.js'

function normalizeZipPrefix(zipPrefix: string | undefined): string | null {
  const trimmed = zipPrefix?.trim()
  return trimmed ? trimmed : null
}

async function assertZoneIsUnique(zipPrefix: string | null, excludeId?: string) {
  if (zipPrefix === null) {
    const existingDefault = await findDefaultZoneExcludingId(excludeId)
    if (existingDefault) {
      throw new AppError('DEFAULT_ZONE_EXISTS', 'A default zone (with no zip prefix) already exists.', 409)
    }
    return
  }

  const existing = await findDeliveryZoneByZipPrefixExcludingId(zipPrefix, excludeId)
  if (existing) {
    throw new AppError('ZIP_PREFIX_EXISTS', 'A delivery zone with this zip prefix already exists.', 409)
  }
}

export async function getDeliveryZones() {
  return listDeliveryZones()
}

export async function addDeliveryZone(input: CreateDeliveryZoneInput) {
  const zipPrefix = normalizeZipPrefix(input.zipPrefix)
  await assertZoneIsUnique(zipPrefix)
  return createDeliveryZone({ label: input.label, zipPrefix, fee: input.fee })
}

export async function editDeliveryZone(id: string, input: UpdateDeliveryZoneInput) {
  const zone = await findDeliveryZoneById(id)
  if (!zone) throw new AppError('DELIVERY_ZONE_NOT_FOUND', 'Delivery zone not found.', 404)

  if (input.zipPrefix !== undefined) {
    const zipPrefix = normalizeZipPrefix(input.zipPrefix)
    await assertZoneIsUnique(zipPrefix, id)
    return updateDeliveryZone(id, { ...input, zipPrefix })
  }

  return updateDeliveryZone(id, input)
}

export async function getDeliveryQuote(zip: string | undefined) {
  const trimmed = zip?.trim()
  const zone = trimmed ? await findMatchingZoneForZip(trimmed) : await findActiveDefaultZone()
  if (!zone) return { available: false as const }
  return { available: true as const, zoneLabel: zone.label, fee: zone.fee }
}