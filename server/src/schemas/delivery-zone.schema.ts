import { z } from 'zod'

export const createDeliveryZoneSchema = z.object({
  label: z.string().trim().min(1, 'Zone label is required.'),
  zipPrefix: z.string().trim().optional(),
  fee: z.coerce.number().int('Fee must be a whole number.').nonnegative('Fee cannot be negative.'),
})

export const updateDeliveryZoneSchema = createDeliveryZoneSchema.partial().extend({
  isActive: z.boolean().optional(),
})

export const deliveryZoneIdSchema = z.object({
  id: z.string().min(1, 'Delivery zone id is required.'),
})

export const deliveryQuoteQuerySchema = z.object({
  zip: z.string().trim().max(20).optional(),
})

export type CreateDeliveryZoneInput = z.infer<typeof createDeliveryZoneSchema>
export type UpdateDeliveryZoneInput = z.infer<typeof updateDeliveryZoneSchema>