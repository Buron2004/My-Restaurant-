import { Router } from 'express'
import { createReservationController, getAvailabilityController } from '../controllers/reservation.controller.js'


export const reservationRouter = Router()

// Public — guests check availability without being logged in.
reservationRouter.get('/availability', getAvailabilityController)
// Public — guests book without logging in.
reservationRouter.post('/', createReservationController) 