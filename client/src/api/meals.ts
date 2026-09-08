import type { CuisineListResponse, Meal, MealListResponse, MealStatus } from '../types/meal'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

type MealInput = {
  name: string
  description?: string
  price: number
  cuisineId: string
  imageUrl?: string
  prepTimeMinutes: number
  status: MealStatus
  dietaryTags: string[]
  isFeatured: boolean
}

type ApiError = { success: false; error: { code: string; message: string } }
type RequestOptions = { method?: string; headers?: Record<string, string>; body?: string }

async function request<T extends object>(path: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('authToken')
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const body = (await response.json()) as T | ApiError
  if (!response.ok) {
    throw new Error('error' in body ? body.error.message : 'Request failed')
  }
  return body as T
}

export async function fetchMeals(params: URLSearchParams) {
  return request<MealListResponse>(`/meals?${params.toString()}`)
}

export async function fetchCuisines() {
  return request<CuisineListResponse>('/cuisines')
}

export async function createMeal(input: MealInput) {
  return request<{ success: true; data: Meal }>('/meals', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateMeal(id: string, input: Partial<MealInput>) {
  return request<{ success: true; data: Meal }>(`/meals/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}

export async function deleteMeal(id: string) {
  return request<{ success: true }>(`/meals/${id}`, { method: 'DELETE' })
}
