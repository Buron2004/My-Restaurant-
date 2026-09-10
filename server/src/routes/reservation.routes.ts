import { Router } from 'express'
import { getAvailabilityController } from '../controllers/reservation.controller.js'

export const reservationRouter = Router()

// Public — guests check availability without being logged in.
reservationRouter.get('/availability', getAvailabilityController)