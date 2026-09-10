import { Router } from 'express'
import { createTableController, listTablesController, updateTableController } from '../controllers/table.controller.js'
import { authenticate, authorizeRoles } from '../middleware/auth.js'

export const tableRouter = Router()

tableRouter.get('/', authenticate, authorizeRoles('ADMIN', 'STAFF'), listTablesController)
tableRouter.post('/', authenticate, authorizeRoles('ADMIN'), createTableController)
tableRouter.patch('/:id', authenticate, authorizeRoles('ADMIN'), updateTableController)
