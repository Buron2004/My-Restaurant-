import type { Request, Response } from 'express'
import { createMealSchema, mealIdSchema, mealListQuerySchema, updateMealSchema } from '../schemas/meal.schema.js'
import { addMeal, editMeal, getMeal, getMeals, removeMeal } from '../services/meal.service.js'
import { sendSuccess } from '../utils/api-response.js'

export async function listMealsController(request: Request, response: Response) {
  const result = await getMeals(mealListQuerySchema.parse(request.query))
  return sendSuccess(response, result.items, result.meta)
}

export async function getMealController(request: Request, response: Response) {
  const { id } = mealIdSchema.parse(request.params)
  return sendSuccess(response, await getMeal(id))
}

export async function createMealController(request: Request, response: Response) {
  const meal = await addMeal(createMealSchema.parse(request.body))
  return sendSuccess(response, meal, {}, 201)
}

export async function updateMealController(request: Request, response: Response) {
  const { id } = mealIdSchema.parse(request.params)
  const meal = await editMeal(id, updateMealSchema.parse(request.body))
  return sendSuccess(response, meal)
}

export async function deleteMealController(request: Request, response: Response) {
  const { id } = mealIdSchema.parse(request.params)
  await removeMeal(id)
  return sendSuccess(response, { message: 'Meal deleted successfully.' })
}
