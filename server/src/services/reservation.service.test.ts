import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppError } from '../middleware/error-handler.js'
import * as repository from '../repositories/reservation.repository.js'
import {
  assertBookableDate,
  assertOnlinePartySize,
  findSmallestAvailableTable,
  getAvailability,
} from './reservation.service.js'

vi.mock('../repositories/reservation.repository.js')

function makeTable(id: string, capacity: number, isActive = true) {
  return { id, name: id, capacity, location: 'INDOOR', isActive } as never
}

function makeReservation(tableId: string, startTime: string, endTime: string) {
  return {
    tableId,
    startTime: new Date(`1970-01-01T${startTime}:00.000Z`),
    endTime: new Date(`1970-01-01T${endTime}:00.000Z`),
  }
}

function futureDateString(daysFromNow: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + daysFromNow)
  return date.toISOString().slice(0, 10)
}

describe('assertBookableDate', () => {
  it('rejects a date in the past', () => {
    expect(() => assertBookableDate(futureDateString(-1))).toThrow(AppError)
  })

  it('allows today', () => {
    expect(() => assertBookableDate(futureDateString(0))).not.toThrow()
  })

  it('allows exactly 60 days ahead', () => {
    expect(() => assertBookableDate(futureDateString(60))).not.toThrow()
  })

  it('rejects more than 60 days ahead', () => {
    expect(() => assertBookableDate(futureDateString(61))).toThrow(AppError)
  })
})

describe('assertOnlinePartySize', () => {
  it('allows exactly 12', () => {
    expect(() => assertOnlinePartySize(12)).not.toThrow()
  })

  it('rejects 13 or more', () => {
    expect(() => assertOnlinePartySize(13)).toThrow(AppError)
  })
})

describe('getAvailability', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('marks a slot available when a suitable table is free', async () => {
    vi.mocked(repository.findActiveTablesWithMinCapacity).mockResolvedValue([makeTable('t1', 4)])
    vi.mocked(repository.findReservationsForDateAndTables).mockResolvedValue([])

    const result = await getAvailability({ date: futureDateString(1), partySize: 4 })
    const noon = result.slots.find((slot) => slot.time === '12:00')

    expect(noon?.available).toBe(true)
  })

  it('marks every slot unavailable when no table fits the party', async () => {
    vi.mocked(repository.findActiveTablesWithMinCapacity).mockResolvedValue([])
    vi.mocked(repository.findReservationsForDateAndTables).mockResolvedValue([])

    const result = await getAvailability({ date: futureDateString(1), partySize: 12 })

    expect(result.slots.every((slot) => slot.available === false)).toBe(true)
  })

  it('blocks a slot that overlaps an existing reservation', async () => {
    vi.mocked(repository.findActiveTablesWithMinCapacity).mockResolvedValue([makeTable('t1', 4)])
    vi.mocked(repository.findReservationsForDateAndTables).mockResolvedValue([
      makeReservation('t1', '12:00', '13:30'),
    ])

    const result = await getAvailability({ date: futureDateString(1), partySize: 4 })
    const noon = result.slots.find((slot) => slot.time === '12:00')

    expect(noon?.available).toBe(false)
  })

  it('does not block a slot that does not overlap an existing reservation', async () => {
    vi.mocked(repository.findActiveTablesWithMinCapacity).mockResolvedValue([makeTable('t1', 4)])
    vi.mocked(repository.findReservationsForDateAndTables).mockResolvedValue([
      makeReservation('t1', '15:00', '16:30'),
    ])

    const result = await getAvailability({ date: futureDateString(1), partySize: 4 })
    const elevenAm = result.slots.find((slot) => slot.time === '11:00')
    const fourThirtyPm = result.slots.find((slot) => slot.time === '16:30')

    expect(elevenAm?.available).toBe(true)
    expect(fourThirtyPm?.available).toBe(true)
  })

  it('still shows a slot available if a different suitable table is free', async () => {
    vi.mocked(repository.findActiveTablesWithMinCapacity).mockResolvedValue([
      makeTable('t1', 4),
      makeTable('t2', 4),
    ])
    vi.mocked(repository.findReservationsForDateAndTables).mockResolvedValue([
      makeReservation('t1', '12:00', '13:30'),
    ])

    const result = await getAvailability({ date: futureDateString(1), partySize: 4 })
    const noon = result.slots.find((slot) => slot.time === '12:00')

    expect(noon?.available).toBe(true)
  })
})

describe('findSmallestAvailableTable', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('selects the smallest suitable table when multiple fit', async () => {
    vi.mocked(repository.findActiveTablesWithMinCapacity).mockResolvedValue([
      makeTable('small', 4),
      makeTable('large', 8),
    ])
    vi.mocked(repository.findReservationsForDateAndTables).mockResolvedValue([])

    const table = await findSmallestAvailableTable(futureDateString(1), '12:00', 4)

    expect(table?.id).toBe('small')
  })

  it('skips a smaller table that is already booked and picks the next suitable one', async () => {
    vi.mocked(repository.findActiveTablesWithMinCapacity).mockResolvedValue([
      makeTable('small', 4),
      makeTable('large', 8),
    ])
    vi.mocked(repository.findReservationsForDateAndTables).mockResolvedValue([
      makeReservation('small', '12:00', '13:30'),
    ])

    const table = await findSmallestAvailableTable(futureDateString(1), '12:00', 4)

    expect(table?.id).toBe('large')
  })

  it('returns null when no table is free', async () => {
    vi.mocked(repository.findActiveTablesWithMinCapacity).mockResolvedValue([makeTable('t1', 4)])
    vi.mocked(repository.findReservationsForDateAndTables).mockResolvedValue([
      makeReservation('t1', '12:00', '13:30'),
    ])

    const table = await findSmallestAvailableTable(futureDateString(1), '12:00', 4)

    expect(table).toBeNull()
  })

  it('rejects a time that is not a valid 30-minute operating slot', async () => {
    vi.mocked(repository.findActiveTablesWithMinCapacity).mockResolvedValue([makeTable('t1', 4)])

    await expect(findSmallestAvailableTable(futureDateString(1), '12:15', 4)).rejects.toThrow(AppError)
  })

  it('rejects a time outside operating hours', async () => {
    vi.mocked(repository.findActiveTablesWithMinCapacity).mockResolvedValue([makeTable('t1', 4)])

    await expect(findSmallestAvailableTable(futureDateString(1), '22:00', 4)).rejects.toThrow(AppError)
  })
})