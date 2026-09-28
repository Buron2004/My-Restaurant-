import { Router } from 'express'
import {
  createDeliveryZoneController,
  listDeliveryZonesController,
  updateDeliveryZoneController,
  getDeliveryQuoteController,
} from '../controllers/delivery-zone.controller.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'

export const deliveryZoneRouter = Router()

deliveryZoneRouter.get('/', authenticate, authorizeRoles('ADMIN', 'STAFF'), listDeliveryZonesController)
deliveryZoneRouter.post('/', authenticate, authorizeRoles('ADMIN'), createDeliveryZoneController)
deliveryZoneRouter.patch('/:id', authenticate, authorizeRoles('ADMIN'), updateDeliveryZoneController)
deliveryZoneRouter.get('/quote', getDeliveryQuoteController)