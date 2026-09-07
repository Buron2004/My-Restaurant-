import { z } from 'zod'

const cuisineFields = {
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  displayOrder: z.number().int().nonnegative(),
}

export const createCuisineSchema = z.object(cuisineFields)

export const updateCuisineSchema = z
  .object(cuisineFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one cuisine field must be provided.',
  })

export const cuisineIdSchema = z.object({
  id: z.string().cuid(),
})

export type CreateCuisineInput = z.infer<typeof createCuisineSchema>
export type UpdateCuisineInput = z.infer<typeof updateCuisineSchema>
