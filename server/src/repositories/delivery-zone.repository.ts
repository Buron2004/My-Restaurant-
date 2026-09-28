import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function listDeliveryZones() {
  return prisma.deliveryZone.findMany({ orderBy: { label: 'asc' } })
}

export function findDeliveryZoneById(id: string) {
  return prisma.deliveryZone.findUnique({ where: { id } })
}

export function findDeliveryZoneByZipPrefixExcludingId(zipPrefix: string, excludeId?: string) {
  return prisma.deliveryZone.findFirst({
    where: { zipPrefix, ...(excludeId ? { id: { not: excludeId } } : {}) },
  })
}

export function findDefaultZoneExcludingId(excludeId?: string) {
  return prisma.deliveryZone.findFirst({
    where: { zipPrefix: null, ...(excludeId ? { id: { not: excludeId } } : {}) },
  })
}

export async function findMatchingZoneForZip(zip: string) {
  // Longest-matching prefix wins among zones that have one configured.
  const specific = await prisma.deliveryZone.findFirst({
    where: {
      isActive: true,
      zipPrefix: { in: Array.from({ length: zip.length }, (_, i) => zip.slice(0, zip.length - i)) },
    },
    orderBy: { zipPrefix: 'desc' },
  })
  if (specific) return specific

  // Fall back to the default zone (zipPrefix: null), if one is configured.
  return prisma.deliveryZone.findFirst({ where: { isActive: true, zipPrefix: null } })
}

export function createDeliveryZone(data: Prisma.DeliveryZoneCreateInput) {
  return prisma.deliveryZone.create({ data })
}

export function updateDeliveryZone(id: string, data: Prisma.DeliveryZoneUpdateInput) {
  return prisma.deliveryZone.update({ where: { id }, data })
}

export function findActiveDefaultZone() {
  return prisma.deliveryZone.findFirst({ where: { isActive: true, zipPrefix: null } })
}