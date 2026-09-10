import type { Table } from '@prisma/client'
import { AppError } from '../middleware/error-handler.js'
import {
  findActiveTablesWithMinCapacity,
  findReservationsForDateAndTables,
} from '../repositories/reservation.repository.js'
import type { AvailabilityQuery } from '../schemas/reservation.schema.js'

const OPENING_MINUTES = 11 * 60 // 11:00
const CLOSING_MINUTES = 22 * 60 // 22:00
const SLOT_INTERVAL_MINUTES = 30
const RESERVATION_DURATION_MINUTES = 90

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