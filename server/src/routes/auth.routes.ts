import { Router } from 'express'
import { loginController, meController } from '../controllers/auth.controller.js'
import { authenticate } from '../middleware/auth.js'

export const authRouter = Router()

authRouter.post('/login', loginController)
authRouter.get('/me', authenticate, meController)
