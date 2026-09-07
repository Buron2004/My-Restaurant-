import { Router } from 'express'
import {
  createMealController,
  deleteMealController,
  getMealController,
  listMealsController,
  updateMealController,
} from '../controllers/meal.controller.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'

export const mealRouter = Router()

mealRouter.get('/', listMealsController)
mealRouter.get('/:id', getMealController)
mealRouter.post('/', authenticate, authorizeRoles('ADMIN'), createMealController)
mealRouter.patch('/:id', authenticate, authorizeRoles('ADMIN'), updateMealController)
mealRouter.delete('/:id', authenticate, authorizeRoles('ADMIN'), deleteMealController)
