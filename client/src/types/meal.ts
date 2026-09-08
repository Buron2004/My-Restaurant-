export type MealStatus = 'AVAILABLE' | 'OUT_OF_STOCK' | 'ARCHIVED'

export type Cuisine = {
  id: string
  name: string
}

export type Meal = {
  id: string
  name: string
  description: string | null
  price: number
  cuisineId: string
  imageUrl: string | null
  prepTimeMinutes: number
  status: MealStatus
  dietaryTags: string[]
  isFeatured: boolean
  cuisine: Cuisine
}

export type MealListResponse = {
  success: true
  data: Meal[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type CuisineListResponse = {
  success: true
  data: Cuisine[]
  meta: { count: number }
}
