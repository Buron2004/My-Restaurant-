import { Router } from 'express'
import { createReservationController, getAvailabilityController } from '../controllers/reservation.controller.js'
import { cancelReservationController, lookupReservationController } from '../controllers/reservation.controller.js'

export const reservationRouter = Router()

// Public — guests check availability without being logged in.
reservationRouter.get('/availability', getAvailabilityController)
// Public — guests book without logging in.
reservationRouter.post('/', createReservationController) 

reservationRouter.get('/lookup', lookupReservationController) // Public — ref + phone acts as the credential.
reservationRouter.post('/cancel', cancelReservationController) // Public — same credential re-verified before cancelling.