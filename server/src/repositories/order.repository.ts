import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function findMealsByIds(ids: string[]) {
  return prisma.meal.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, price: true, status: true },
  })
}

export function createOrderRecord(data: Prisma.OrderCreateInput) {
  return prisma.order.create({ data, include: { items: true } })
}