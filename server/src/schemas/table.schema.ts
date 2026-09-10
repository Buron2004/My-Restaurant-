import { z } from 'zod'

const locationSchema = z.enum(['INDOOR', 'OUTDOOR', 'PRIVATE'])

export const createTableSchema = z.object({
  name: z.string().trim().min(1).max(80),
  capacity: z.number().int().positive().max(100),
  location: locationSchema,
  isActive: z.boolean().default(true),
})

export const updateTableSchema = z
  .object({
    name: createTableSchema.shape.name.optional(),
    capacity: createTableSchema.shape.capacity.optional(),
    location: locationSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one table field must be provided.',
  })

export const tableIdSchema = z.object({ id: z.string().cuid() })

export type CreateTableInput = z.infer<typeof createTableSchema>
export type UpdateTableInput = z.infer<typeof updateTableSchema>
