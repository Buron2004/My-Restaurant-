import { Prisma, PrismaClient, ReservationStatus } from '@prisma/client'

const prisma = new PrismaClient()

const BLOCKING_STATUSES: ReservationStatus[] = ['PENDING', 'CONFIRMED', 'SEATED', 'COMPLETED']

export function findActiveTablesWithMinCapacity(partySize: number) {
  return prisma.table.findMany({
    where: { isActive: true, capacity: { gte: partySize } },
    orderBy: { capacity: 'asc' },
  })
}

export function findReservationsForDateAndTables(date: Date, tableIds: string[]) {
  return prisma.reservation.findMany({
    where: {
      reservationDate: date,
      tableId: { in: tableIds },
      status: { in: BLOCKING_STATUSES },
    },
    select: { tableId: true, startTime: true, endTime: true },
  })
}

export function createReservation(data: Prisma.ReservationCreateInput) {
  return prisma.reservation.create({ data })
}