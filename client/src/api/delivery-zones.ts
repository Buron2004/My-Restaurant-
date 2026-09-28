import type { DeliveryZone, DeliveryZoneListResponse } from '../types/delivery-zone'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

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

export async function fetchDeliveryZones() {
  return request<DeliveryZoneListResponse>('/delivery-zones')
}

export async function createDeliveryZone(input: { label: string; zipPrefix: string; fee: number }) {
  return request<{ success: true; data: DeliveryZone }>('/delivery-zones', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function updateDeliveryZone(id: string, input: Partial<{ label: string; zipPrefix: string; fee: number; isActive: boolean }>) {
  return request<{ success: true; data: DeliveryZone }>(`/delivery-zones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })
}