import { Router } from 'express'
import { createOrderController } from '../controllers/order.controller.js'
import { cancelOrderController, lookupOrderController } from '../controllers/order.controller.js'
import {
  listOrdersController,
  updateOrderPaymentStatusController,
  updateOrderStatusController,
} from '../controllers/order.controller.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'


export const orderRouter = Router()

// Public — guests order without an account.
orderRouter.post('/', createOrderController)
orderRouter.get('/lookup', lookupOrderController)
orderRouter.post('/cancel', cancelOrderController)

// Admin — manage orders.
orderRouter.get('/', authenticate, authorizeRoles('ADMIN', 'STAFF'), listOrdersController)
orderRouter.patch('/:id/status', authenticate, authorizeRoles('ADMIN', 'STAFF'), updateOrderStatusController)
orderRouter.patch('/:id/payment-status', authenticate, authorizeRoles('ADMIN', 'STAFF'), updateOrderPaymentStatusController)
