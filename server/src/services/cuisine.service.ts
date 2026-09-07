import { Prisma } from '@prisma/client'
import { AppError } from '../middleware/error-handler.js'
import {
  countMealsForCuisine,
  createCuisine,
  deleteCuisine,
  findCuisineById,
  findCuisineByName,
  listCuisines,
  updateCuisine,
} from '../repositories/cuisine.repository.js'
import type { CreateCuisineInput, UpdateCuisineInput } from '../schemas/cuisine.schema.js'

export function getCuisines() {
  return listCuisines()
}

export async function addCuisine(input: CreateCuisineInput) {
  const existingCuisine = await findCuisineByName(input.name)
  if (existingCuisine) {
    throw new AppError('CUISINE_NAME_EXISTS', 'A cuisine with this name already exists.', 409)
  }

  try {
    return await createCuisine(input)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('CUISINE_NAME_EXISTS', 'A cuisine with this name already exists.', 409)
    }
    throw error
  }
}

export async function editCuisine(id: string, input: UpdateCuisineInput) {
  const cuisine = await findCuisineById(id)
  if (!cuisine) {
    throw new AppError('CUISINE_NOT_FOUND', 'Cuisine not found.', 404)
  }

  if (input.name && input.name !== cuisine.name) {
    const existingCuisine = await findCuisineByName(input.name)
    if (existingCuisine) {
      throw new AppError('CUISINE_NAME_EXISTS', 'A cuisine with this name already exists.', 409)
    }
  }

  try {
    return await updateCuisine(id, input)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('CUISINE_NAME_EXISTS', 'A cuisine with this name already exists.', 409)
    }
    throw error
  }
}

export async function removeCuisine(id: string) {
  const cuisine = await findCuisineById(id)
  if (!cuisine) {
    throw new AppError('CUISINE_NOT_FOUND', 'Cuisine not found.', 404)
  }

  const mealCount = await countMealsForCuisine(id)
  if (mealCount > 0) {
    throw new AppError(
      'CUISINE_HAS_MEALS',
      'This cuisine cannot be deleted until its meals are reassigned or removed.',
      409,
    )
  }

  return deleteCuisine(id)
}
