import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js'
import { authRouter } from './routes/auth.routes.js'
import { cuisineRouter } from './routes/cuisine.routes.js'
import { healthRouter } from './routes/health.routes.js'
import { mealRouter } from './routes/meal.routes.js'
import { reservationRouter } from './routes/reservation.routes.js'
import { tableRouter } from './routes/table.routes.js'


export const app = express()

app.use(cors({
	origin: (origin, callback) => {
		if (!origin || origin === env.CLIENT_URL || /^http:\/\/localhost:\d+$/.test(origin)) {
			callback(null, true)
			return
		}

		callback(new Error('Origin is not allowed by CORS.'))
	},
}))
app.use(express.json())
app.use('/api/health', healthRouter)
app.use('/api/auth', authRouter)
app.use('/api/cuisines', cuisineRouter)
app.use('/api/meals', mealRouter)
app.use('/api/tables', tableRouter)
app.use('/api/reservations', reservationRouter)
app.use(notFoundHandler)
app.use(errorHandler)
