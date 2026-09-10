import type { RestaurantTable, TableInput } from '../types/table'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

type TableResponse = { success: true; data: RestaurantTable }
type ListResponse = { success: true; data: RestaurantTable[] }
type ApiError = { success: false; error: { message: string } }
type RequestOptions = { method?: string; headers?: Record<string, string>; body?: string }

async function request<T extends object>(path: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('authToken')
  const response = await fetch(`${apiBaseUrl}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
  const body = (await response.json()) as T | ApiError
  if (!response.ok) throw new Error('error' in body ? body.error.message : 'Table request failed.')
  return body as T
}

export function fetchTables() { return request<ListResponse>('/tables') }
export function createTable(input: TableInput) { return request<TableResponse>('/tables', { method: 'POST', body: JSON.stringify(input) }) }
export function updateTable(id: string, input: Partial<TableInput>) { return request<TableResponse>(`/tables/${id}`, { method: 'PATCH', body: JSON.stringify(input) }) }
