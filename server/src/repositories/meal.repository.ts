import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const mealInclude = { cuisine: true } as const

export function listMeals(
  where: Prisma.MealWhereInput,
  orderBy: Prisma.MealOrderByWithRelationInput,
  skip: number,
  take: number,
) {
  return Promise.all([
    prisma.meal.findMany({ where, orderBy, skip, take, include: mealInclude }),
    prisma.meal.count({ where }),
  ])
}

export function findMealById(id: string) {
  return prisma.meal.findUnique({ where: { id }, include: mealInclude })
}

export function createMeal(data: Prisma.MealCreateInput) {
  return prisma.meal.create({ data, include: mealInclude })
}

export function updateMeal(id: string, data: Prisma.MealUpdateInput) {
  return prisma.meal.update({ where: { id }, data, include: mealInclude })
}

export function deleteMeal(id: string) {
  return prisma.meal.delete({ where: { id } })
}

export function findCuisineById(id: string) {
  return prisma.cuisine.findUnique({ where: { id }, select: { id: true } })
}

