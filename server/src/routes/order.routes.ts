import { Router } from 'express'
import { createOrderController } from '../controllers/order.controller.js'
import { cancelOrderController, lookupOrderController } from '../controllers/order.controller.js'


export const orderRouter = Router()

// Public — guests order without an account.
orderRouter.post('/', createOrderController)
orderRouter.get('/lookup', lookupOrderController)
orderRouter.post('/cancel', cancelOrderController)