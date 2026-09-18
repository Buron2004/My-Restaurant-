import { Router } from 'express'
import { createReservationController, getAvailabilityController } from '../controllers/reservation.controller.js'
import { cancelReservationController, lookupReservationController } from '../controllers/reservation.controller.js'
import { listReservationsController, updateReservationStatusController } from '../controllers/reservation.controller.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'


export const reservationRouter = Router()

// Public — guests check availability without being logged in.
reservationRouter.get('/availability', getAvailabilityController)
// Public — guests book without logging in.
reservationRouter.post('/', createReservationController) 

reservationRouter.get('/lookup', lookupReservationController) // Public — ref + phone acts as the credential.
reservationRouter.post('/cancel', cancelReservationController) // Public — same credential re-verified before cancelling.
reservationRouter.get('/', authenticate, authorizeRoles('ADMIN', 'STAFF'), listReservationsController)
reservationRouter.patch('/:id/status', authenticate, authorizeRoles('ADMIN', 'STAFF'), updateReservationStatusController)