import { Router } from 'express'
import { createOrderController } from '../controllers/order.controller.js'

export const orderRouter = Router()

// Public — guests order without an account.
orderRouter.post('/', createOrderController)