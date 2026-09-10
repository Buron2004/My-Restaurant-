import type { Request, Response } from 'express'
import { createTableSchema, tableIdSchema, updateTableSchema } from '../schemas/table.schema.js'
import { addTable, editTable, getTables } from '../services/table.service.js'
import { sendSuccess } from '../utils/api-response.js'

export async function listTablesController(_request: Request, response: Response) {
  return sendSuccess(response, await getTables())
}

export async function createTableController(request: Request, response: Response) {
  return sendSuccess(response, await addTable(createTableSchema.parse(request.body)), {}, 201)
}

export async function updateTableController(request: Request, response: Response) {
  const { id } = tableIdSchema.parse(request.params)
  return sendSuccess(response, await editTable(id, updateTableSchema.parse(request.body)))
}
