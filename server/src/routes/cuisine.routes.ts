import { Router } from 'express'
import {
  createCuisineController,
  deleteCuisineController,
  listCuisinesController,
  updateCuisineController,
} from '../controllers/cuisine.controller.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'

export const cuisineRouter = Router()

cuisineRouter.get('/', listCuisinesController)
cuisineRouter.post('/', authenticate, authorizeRoles('ADMIN'), createCuisineController)
cuisineRouter.patch('/:id', authenticate, authorizeRoles('ADMIN'), updateCuisineController)
cuisineRouter.delete('/:id', authenticate, authorizeRoles('ADMIN'), deleteCuisineController)
