import { MealStatus, Prisma } from '@prisma/client'
import { AppError } from '../middleware/error-handler.js'
import {
  createMeal,
  deleteMeal,
  findCuisineById,
  findMealById,
  listMeals,
  updateMeal,
} from '../repositories/meal.repository.js'
import type { CreateMealInput, MealListQuery, UpdateMealInput } from '../schemas/meal.schema.js'

function toMinorUnits(price: number) {
  return Math.round(price * 100)
}

function buildOrderBy(sort: MealListQuery['sort']): Prisma.MealOrderByWithRelationInput {
  if (sort === 'price') return { price: 'asc' }
  if (sort === '-price') return { price: 'desc' }
  if (sort === '-name') return { name: 'desc' }
  return { name: 'asc' }
}

function buildWhere(query: MealListQuery): Prisma.MealWhereInput {
  return {
    ...(query.cuisineId ? { cuisineId: query.cuisineId } : {}),
    ...(query.status ? { status: query.status as MealStatus } : {}),
    ...(query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {}),
  }
}

async function ensureCuisineExists(cuisineId: string) {
  const cuisine = await findCuisineById(cuisineId)
  if (!cuisine) {
    throw new AppError('CUISINE_NOT_FOUND', 'Cuisine not found.', 404)
  }
}

export async function getMeals(query: MealListQuery) {
  const [meals, total] = await listMeals(
    buildWhere(query),
    buildOrderBy(query.sort),
    (query.page - 1) * query.limit,
    query.limit,
  )

  return {
    items: meals,
    meta: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit),
    },
  }
}

export async function getMeal(id: string) {
  const meal = await findMealById(id)
  if (!meal) throw new AppError('MEAL_NOT_FOUND', 'Meal not found.', 404)
  return meal
}

export async function addMeal(input: CreateMealInput) {
  await ensureCuisineExists(input.cuisineId)
  return createMeal({
    name: input.name,
    description: input.description,
    price: toMinorUnits(input.price),
    imageUrl: input.imageUrl,
    prepTimeMinutes: input.prepTimeMinutes,
    status: input.status as MealStatus,
    dietaryTags: input.dietaryTags,
    isFeatured: input.isFeatured,
    cuisine: { connect: { id: input.cuisineId } },
  })
}

export async function editMeal(id: string, input: UpdateMealInput) {
  await getMeal(id)
  if (input.cuisineId) await ensureCuisineExists(input.cuisineId)

  const data: Prisma.MealUpdateInput = {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.price !== undefined ? { price: toMinorUnits(input.price) } : {}),
    ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
    ...(input.prepTimeMinutes !== undefined ? { prepTimeMinutes: input.prepTimeMinutes } : {}),
    ...(input.status !== undefined ? { status: input.status as MealStatus } : {}),
    ...(input.dietaryTags !== undefined ? { dietaryTags: input.dietaryTags } : {}),
    ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
    ...(input.cuisineId ? { cuisine: { connect: { id: input.cuisineId } } } : {}),
  }

  return updateMeal(id, data)
}

export async function removeMeal(id: string) {
  await getMeal(id)
  await deleteMeal(id)
}
