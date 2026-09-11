import { z } from 'zod'

function isValidCalendarDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  )
}

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.')
  .refine(isValidCalendarDate, 'Date is not a valid calendar date.')



export const availabilityQuerySchema = z.object({
  date: dateStringSchema,
  partySize: z.coerce
    .number()
    .int('Party size must be a whole number.')
    .min(1, 'Party size must be at least 1.')
    .max(50, 'Party size is not a realistic value.'),
})

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>

export const createReservationSchema = z.object({
  guestName: z.string().trim().min(1, 'Guest name is required.').max(120),
  guestPhone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number.'),
  guestEmail: z.string().trim().email('Enter a valid email address.').optional(),
  partySize: z.coerce
    .number()
    .int('Party size must be a whole number.')
    .min(1, 'Party size must be at least 1.')
    .max(50, 'Party size is not a realistic value.'),
  reservationDate: dateStringSchema,
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format.'),
  specialRequests: z.string().trim().max(500).optional(),
})

export type CreateReservationInput = z.infer<typeof createReservationSchema>