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

export const availabilityQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format.')
    .refine(isValidCalendarDate, 'Date is not a valid calendar date.'),
    partySize: z.coerce
    .number()
    .int('Party size must be a whole number.')
    .min(1, 'Party size must be at least 1.')
    .max(50, 'Party size is not a realistic value.'),
})

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>