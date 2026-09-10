import { Prisma } from '@prisma/client'
import { AppError } from '../middleware/error-handler.js'
import { createTable, findTableById, findTableByName, listTables, updateTable } from '../repositories/table.repository.js'
import type { CreateTableInput, UpdateTableInput } from '../schemas/table.schema.js'

export function getTables() {
  return listTables()
}

export async function addTable(input: CreateTableInput) {
  if (await findTableByName(input.name)) {
    throw new AppError('TABLE_NAME_EXISTS', 'A table with this name already exists.', 409)
  }

  try {
    return await createTable(input)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('TABLE_NAME_EXISTS', 'A table with this name already exists.', 409)
    }
    throw error
  }
}

export async function editTable(id: string, input: UpdateTableInput) {
  const table = await findTableById(id)
  if (!table) throw new AppError('TABLE_NOT_FOUND', 'Table not found.', 404)

  if (input.name && input.name !== table.name && await findTableByName(input.name)) {
    throw new AppError('TABLE_NAME_EXISTS', 'A table with this name already exists.', 409)
  }

  try {
    return await updateTable(id, input)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('TABLE_NAME_EXISTS', 'A table with this name already exists.', 409)
    }
    throw error
  }
}
