import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function listTables() {
  return prisma.table.findMany({ orderBy: [{ name: 'asc' }] })
}

export function findTableById(id: string) {
  return prisma.table.findUnique({ where: { id } })
}

export function findTableByName(name: string) {
  return prisma.table.findUnique({ where: { name } })
}

export function createTable(data: { name: string; capacity: number; location: 'INDOOR' | 'OUTDOOR' | 'PRIVATE'; isActive: boolean }) {
  return prisma.table.create({ data })
}

export function updateTable(id: string, data: { name?: string; capacity?: number; location?: 'INDOOR' | 'OUTDOOR' | 'PRIVATE'; isActive?: boolean }) {
  return prisma.table.update({ where: { id }, data })
}
