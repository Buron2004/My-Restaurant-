import type { CreateOrderInput, DeliveryQuoteResponse, OrderResponse,LookupOrderInput } from '../types/order'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

type ApiError = { success: false; error: { code: string; message: string } }
type RequestOptions = { method?: string; headers?: Record<string, string>; body?: string }

async function request<T extends object>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
  const body = (await response.json()) as T | ApiError
  if (!response.ok) {
    throw new Error('error' in body ? body.error.message : 'Request failed')
  }
  return body as T
}

export async function fetchDeliveryQuote(zip: string) {
  const params = new URLSearchParams(zip ? { zip } : {})
  return request<DeliveryQuoteResponse>(`/delivery-zones/quote?${params.toString()}`)
}

export async function createOrder(input: CreateOrderInput) {
  return request<OrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function lookupOrder(referenceCode: string, guestPhone: string) {
  const params = new URLSearchParams({ ref: referenceCode, phone: guestPhone })
  return request<OrderResponse>(`/orders/lookup?${params.toString()}`)
}

export async function cancelOrder(input: { referenceCode: string; guestPhone: string }) {
  return request<OrderResponse>('/orders/cancel', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

