import { Prisma, PrismaClient, ReservationStatus } from '@prisma/client'
export class SlotConflictError extends Error { }

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

export async function createReservationTransactionally(params: {
  tableId: string
  reservationDate: Date
  startTime: Date
  endTime: Date
  data: {
    referenceCode: string
    guestName: string
    guestPhone: string
    guestEmail?: string
    partySize: number
    specialRequests?: string
  }
}) {
  try {
    return await prisma.$transaction(
      async (tx) => {
        // Re-check for a conflicting reservation on THIS exact table, inside the transaction.
        // Combined with Serializable isolation below, this protects against two guests
        // booking the same table's overlapping slot at nearly the same instant.
        const conflict = await tx.reservation.findFirst({
          where: {
            tableId: params.tableId,
            reservationDate: params.reservationDate,
            status: { in: BLOCKING_STATUSES },
            startTime: { lt: params.endTime },
            endTime: { gt: params.startTime },
          },
          select: { id: true },
        })

        if (conflict) {
          throw new SlotConflictError()
        }

        return tx.reservation.create({
          data: {
            referenceCode: params.data.referenceCode,
            guestName: params.data.guestName,
            guestPhone: params.data.guestPhone,
            guestEmail: params.data.guestEmail,
            partySize: params.data.partySize,
            reservationDate: params.reservationDate,
            startTime: params.startTime,
            endTime: params.endTime,
            specialRequests: params.data.specialRequests,
            table: { connect: { id: params.tableId } },
          },
          include: { table: true },
        })
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    )
  } catch (error) {
    if (error instanceof SlotConflictError) throw error
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      throw new SlotConflictError()
    }
    throw error
  }
}