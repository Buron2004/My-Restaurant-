import type { Request, Response } from 'express'
import { cuisineIdSchema, createCuisineSchema, updateCuisineSchema } from '../schemas/cuisine.schema.js'
import { addCuisine, editCuisine, getCuisines, removeCuisine } from '../services/cuisine.service.js'
import { sendSuccess } from '../utils/api-response.js'

export async function listCuisinesController(_request: Request, response: Response) {
  const cuisines = await getCuisines()
  return sendSuccess(response, cuisines, { count: cuisines.length })
}

export async function createCuisineController(request: Request, response: Response) {
  const cuisine = await addCuisine(createCuisineSchema.parse(request.body))
  return sendSuccess(response, cuisine, {}, 201)
}

export async function updateCuisineController(request: Request, response: Response) {
  const { id } = cuisineIdSchema.parse(request.params)
  const cuisine = await editCuisine(id, updateCuisineSchema.parse(request.body))
  return sendSuccess(response, cuisine)
}

export async function deleteCuisineController(request: Request, response: Response) {
  const { id } = cuisineIdSchema.parse(request.params)
  await removeCuisine(id)
  return sendSuccess(response, { message: 'Cuisine deleted successfully.' })
}
