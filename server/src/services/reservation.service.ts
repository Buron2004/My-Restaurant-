import type { Table } from '@prisma/client'
import { AppError } from '../middleware/error-handler.js'
import {
  findActiveTablesWithMinCapacity,
  findReservationsForDateAndTables,
} from '../repositories/reservation.repository.js'
import type { AvailabilityQuery } from '../schemas/reservation.schema.js'
import { createReservationTransactionally, SlotConflictError } from '../repositories/reservation.repository.js'
import type { CreateReservationInput } from '../schemas/reservation.schema.js'

const OPENING_MINUTES = 11 * 60 // 11:00
const CLOSING_MINUTES = 22 * 60 // 22:00
const SLOT_INTERVAL_MINUTES = 30
const RESERVATION_DURATION_MINUTES = 90
const MAX_ADVANCE_BOOKING_DAYS = 60
const MAX_ONLINE_PARTY_SIZE = 12

interface OccupiedWindow {
  start: number
  end: number
}

interface SlotAvailability {
  time: string
  available: boolean
}

function toMinutes(hours: number, minutes: number): number {
  return hours * 60 + minutes
}

function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function timeColumnToMinutes(time: Date): number {
  return toMinutes(time.getUTCHours(), time.getUTCMinutes())
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

function generateSlotStartTimes(): number[] {
  const slots: number[] = []
  const lastPossibleStart = CLOSING_MINUTES - RESERVATION_DURATION_MINUTES

  for (let start = OPENING_MINUTES; start <= lastPossibleStart; start += SLOT_INTERVAL_MINUTES) {
    slots.push(start)
  }

  return slots
}

function parseDateOnly(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`)
}

/**
 * Shared by availability checks and reservation creation (Day 11).
 * Throws AppError if the date is in the past or too far in the future.
 */
export function assertBookableDate(date: string): void {
  const requestedDate = parseDateOnly(date)
  const today = parseDateOnly(new Date().toISOString().slice(0, 10))

  if (requestedDate.getTime() < today.getTime()) {
    throw new AppError('DATE_IN_PAST', 'Reservations cannot be made for a date in the past.', 400)
  }

  const maxDate = new Date(today)
  maxDate.setUTCDate(maxDate.getUTCDate() + MAX_ADVANCE_BOOKING_DAYS)

  if (requestedDate.getTime() > maxDate.getTime()) {
    throw new AppError(
      'DATE_TOO_FAR_AHEAD',
      `Reservations can only be made up to ${MAX_ADVANCE_BOOKING_DAYS} days in advance.`,
      400,
    )
  }
}

/**
 * Shared by availability checks and reservation creation (Day 11).
 * The 1-50 shape check lives in Zod; this enforces the actual business cap.
 */
export function assertOnlinePartySize(partySize: number): void {
  if (partySize > MAX_ONLINE_PARTY_SIZE) {
    throw new AppError(
      'PARTY_TOO_LARGE_FOR_ONLINE_BOOKING',
      'We can only take online bookings for parties of 12 or fewer. Please contact the restaurant directly for larger groups.',
      400,
    )
  }
}

/**
 * Groups reservations by tableId, converting DB time columns into minute offsets,
 * so overlap checks are cheap integer comparisons.
 */
function buildOccupiedWindowsByTable(
  reservations: { tableId: string; startTime: Date; endTime: Date }[],
): Map<string, OccupiedWindow[]> {
  const map = new Map<string, OccupiedWindow[]>()

  for (const reservation of reservations) {
    const window: OccupiedWindow = {
      start: timeColumnToMinutes(reservation.startTime),
      end: timeColumnToMinutes(reservation.endTime),
    }
    const existing = map.get(reservation.tableId)
    if (existing) {
      existing.push(window)
    } else {
      map.set(reservation.tableId, [window])
    }
  }

  return map
}

function isTableFreeForWindow(
  tableId: string,
  slotStart: number,
  slotEnd: number,
  occupiedByTable: Map<string, OccupiedWindow[]>,
): boolean {
  const occupied = occupiedByTable.get(tableId)
  if (!occupied) return true
  return !occupied.some((window) => overlaps(slotStart, slotEnd, window.start, window.end))
}

export async function getAvailability(query: AvailabilityQuery): Promise<{
  date: string
  partySize: number
  slots: SlotAvailability[]
}> {
  assertBookableDate(query.date)
  assertOnlinePartySize(query.partySize)
  const candidateTables = await findActiveTablesWithMinCapacity(query.partySize)

  if (candidateTables.length === 0) {
    return {
      date: query.date,
      partySize: query.partySize,
      slots: generateSlotStartTimes().map((start) => ({
        time: minutesToTimeString(start),
        available: false,
      })),
    }
  }

  const reservationDate = parseDateOnly(query.date)
  const tableIds = candidateTables.map((table) => table.id)
  const reservations = await findReservationsForDateAndTables(reservationDate, tableIds)
  const occupiedByTable = buildOccupiedWindowsByTable(reservations)

  const slots = generateSlotStartTimes().map((slotStart) => {
    const slotEnd = slotStart + RESERVATION_DURATION_MINUTES
    const available = candidateTables.some((table) =>
      isTableFreeForWindow(table.id, slotStart, slotEnd, occupiedByTable),
    )
    return { time: minutesToTimeString(slotStart), available }
  })

  return { date: query.date, partySize: query.partySize, slots }
}

/**
 * Reused by the future booking endpoint (Day 11): finds the SMALLEST suitable
 * active table that is free for an exact requested slot, or null if none exist.
 * Throws AppError if the requested time isn't a valid operating slot.
 */
export async function findSmallestAvailableTable(
  date: string,
  time: string,
  partySize: number,
): Promise<Table | null> {
  const [hours, minutes] = time.split(':').map(Number)
  const slotStart = toMinutes(hours, minutes)
  const validSlots = generateSlotStartTimes()

  if (!validSlots.includes(slotStart)) {
    throw new AppError(
      'INVALID_TIME_SLOT',
      'The requested time is not a valid 30-minute reservation slot within operating hours (11:00-22:00).',
      400,
    )
  }

  const slotEnd = slotStart + RESERVATION_DURATION_MINUTES
  const candidateTables = await findActiveTablesWithMinCapacity(partySize)
  if (candidateTables.length === 0) return null

  const reservationDate = parseDateOnly(date)
  const tableIds = candidateTables.map((table) => table.id)
  const reservations = await findReservationsForDateAndTables(reservationDate, tableIds)
  const occupiedByTable = buildOccupiedWindowsByTable(reservations)

  // candidateTables is already sorted ascending by capacity (smallest-first),
  // matching the repository's orderBy — so the first free table IS the smallest suitable one.
  return (
    candidateTables.find((table) =>
      isTableFreeForWindow(table.id, slotStart, slotEnd, occupiedByTable),
    ) ?? null
  )
}

function minutesToTimeDate(totalMinutes: number): Date {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return new Date(`1970-01-01T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00.000Z`)
}

function generateReferenceCode(): string {
  // Excludes ambiguous characters (0/O, 1/I) for readability when guests read it back.
  const charset = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += charset[Math.floor(Math.random() * charset.length)]
  }
  return `RSV-${code}`
}

export async function createReservation(input: CreateReservationInput) {
  assertBookableDate(input.reservationDate)
  assertOnlinePartySize(input.partySize)

  // Server-side source of truth — never trusts whatever the frontend last showed as "available".
  const table = await findSmallestAvailableTable(input.reservationDate, input.startTime, input.partySize)

  if (!table) {
    throw new AppError(
      'NO_TABLE_AVAILABLE',
      'No table is available for that date, time, and party size. Please choose a different time.',
      409,
    )
  }

  const [hours, minutes] = input.startTime.split(':').map(Number)
  const slotStart = toMinutes(hours, minutes)
  const slotEnd = slotStart + RESERVATION_DURATION_MINUTES
  const reservationDate = parseDateOnly(input.reservationDate)
  const startTime = minutesToTimeDate(slotStart)
  const endTime = minutesToTimeDate(slotEnd)

  const MAX_REFERENCE_CODE_ATTEMPTS = 5

  for (let attempt = 1; attempt <= MAX_REFERENCE_CODE_ATTEMPTS; attempt++) {
    try {
      return await createReservationTransactionally({
        tableId: table.id,
        reservationDate,
        startTime,
        endTime,
        data: {
          referenceCode: generateReferenceCode(),
          guestName: input.guestName,
          guestPhone: input.guestPhone,
          guestEmail: input.guestEmail,
          partySize: input.partySize,
          specialRequests: input.specialRequests,
        },
      })
    } catch (error) {
      if (error instanceof SlotConflictError) {
        throw new AppError(
          'SLOT_CONFLICT',
          'This time slot was just booked by someone else. Please choose another time.',
          409,
        )
      }

      const isDuplicateReferenceCode =
        error instanceof Error &&
        'code' in error &&
        (error as { code?: string }).code === 'P2002' &&
        attempt < MAX_REFERENCE_CODE_ATTEMPTS

      if (!isDuplicateReferenceCode) throw error
      // Extremely unlikely collision — retry with a freshly generated code.
    }
  }

  throw new AppError('RESERVATION_CREATE_FAILED', 'Could not create the reservation. Please try again.', 500)
}