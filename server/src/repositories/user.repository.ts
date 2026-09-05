import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}
