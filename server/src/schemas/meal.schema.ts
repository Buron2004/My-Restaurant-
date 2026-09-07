import { z } from 'zod'

const priceSchema = z.number().finite().positive().refine(
  (value) => Number.isInteger(value * 100),
  'Price must have no more than 2 decimal places.',
)

const dietaryTagsSchema = z.array(z.string().trim().min(1).max(40)).max(20)

export const createMealSchema = z.object({
  name: z.string().trim().min(1).max(150),
  description: z.string().trim().max(1000).nullable().optional(),
  price: priceSchema,
  cuisineId: z.string().cuid(),
  imageUrl: z.string().url().nullable().optional(),
  prepTimeMinutes: z.number().int().positive().max(1440),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'ARCHIVED']).default('AVAILABLE'),
  dietaryTags: dietaryTagsSchema.default([]),
  isFeatured: z.boolean().default(false),
})

export const updateMealSchema = z
  .object({
    name: createMealSchema.shape.name.optional(),
    description: createMealSchema.shape.description,
    price: priceSchema.optional(),
    cuisineId: createMealSchema.shape.cuisineId.optional(),
    imageUrl: createMealSchema.shape.imageUrl,
    prepTimeMinutes: createMealSchema.shape.prepTimeMinutes.optional(),
    status: createMealSchema.shape.status.optional(),
    dietaryTags: dietaryTagsSchema.optional(),
    isFeatured: createMealSchema.shape.isFeatured.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one meal field must be provided.',
  })

export const mealIdSchema = z.object({ id: z.string().cuid() })

export const mealListQuerySchema = z.object({
  cuisineId: z.string().cuid().optional(),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'ARCHIVED']).optional(),
  search: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  sort: z.enum(['name', 'price', '-name', '-price']).default('name'),
})

export type CreateMealInput = z.infer<typeof createMealSchema>
export type UpdateMealInput = z.infer<typeof updateMealSchema>
export type MealListQuery = z.infer<typeof mealListQuerySchema>
