import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function listCuisines() {
  return prisma.cuisine.findMany({
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
  })
}

export function findCuisineById(id: string) {
  return prisma.cuisine.findUnique({ where: { id } })
}

export function findCuisineByName(name: string) {
  return prisma.cuisine.findUnique({ where: { name } })
}

export function createCuisine(data: {
  name: string
  description?: string | null
  imageUrl?: string | null
  displayOrder: number
}) {
  return prisma.cuisine.create({ data })
}

export function updateCuisine(
  id: string,
  data: {
    name?: string
    description?: string | null
    imageUrl?: string | null
    displayOrder?: number
  },
) {
  return prisma.cuisine.update({ where: { id }, data })
}

export function countMealsForCuisine(cuisineId: string) {
  return prisma.meal.count({ where: { cuisineId } })
}

export function deleteCuisine(id: string) {
  return prisma.cuisine.delete({ where: { id } })
}
