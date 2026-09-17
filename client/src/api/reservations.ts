import type { AvailabilityResponse, CreateReservationInput, LookupReservationInput, ReservationResponse } from '../types/reservation'

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'

type ApiError = { success: false; error: { code: string; message: string } }
type RequestOptions = { method?: string; headers?: Record<string, string>; body?: string }

async function request<T extends object>(path: string, options: RequestOptions = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const body = (await response.json()) as T | ApiError
  if (!response.ok) {
    throw new Error('error' in body ? body.error.message : 'Request failed')
  }
  return body as T
}

export async function fetchAvailability(date: string, partySize: number) {
  const params = new URLSearchParams({ date, partySize: String(partySize) })
  return request<AvailabilityResponse>(`/reservations/availability?${params.toString()}`)
}

export async function createReservation(input: CreateReservationInput) {
  return request<ReservationResponse>('/reservations', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function lookupReservation(referenceCode: string, guestPhone: string) {
  const params = new URLSearchParams({ ref: referenceCode, phone: guestPhone })
  return request<ReservationResponse>(`/reservations/lookup?${params.toString()}`)
}

export async function cancelReservation(input: LookupReservationInput) {
  return request<ReservationResponse>('/reservations/cancel', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}