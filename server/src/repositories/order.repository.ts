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

export function findOrderByReferenceAndPhone(referenceCode: string, guestPhone: string) {
  return prisma.order.findFirst({
    where: { referenceCode, guestPhone },
    include: { items: true },
  })
}

export function cancelOrderById(id: string) {
  return prisma.order.update({
    where: { id },
    data: { status: 'CANCELLED' },
    include: { items: true },
  })
}

export function listOrders(status?: string) {
  return prisma.order.findMany({
    where: status ? { status: status as never } : {},
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })
}

export function findOrderById(id: string) {
  return prisma.order.findUnique({ where: { id }, include: { items: true } })
}

export function updateOrderStatus(id: string, status: string) {
  return prisma.order.update({ where: { id }, data: { status: status as never }, include: { items: true } })
}

export function updateOrderPaymentStatus(id: string, paymentStatus: string) {
  return prisma.order.update({ where: { id }, data: { paymentStatus: paymentStatus as never }, include: { items: true } })
}