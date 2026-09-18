export interface AvailabilitySlot {
  time: string
  available: boolean
}

export interface AvailabilityResponse {
  success: true
  data: {
    date: string
    partySize: number
    slots: AvailabilitySlot[]
  }
}

export interface ReservationTable {
  id: string
  name: string
  capacity: number
  location: string
  isActive: boolean
}

export interface Reservation {
  id: string
  referenceCode: string
  guestName: string
  guestPhone: string
  guestEmail?: string
  partySize: number
  reservationDate: string
  startTime: string
  endTime: string
  tableId: string
  specialRequests?: string
  status: string
  table: ReservationTable
}

export interface ReservationResponse {
  success: true
  data: Reservation
}

export interface CreateReservationInput {
  guestName: string
  guestPhone: string
  guestEmail?: string
  partySize: number
  reservationDate: string
  startTime: string
  specialRequests?: string
}

export interface LookupReservationInput {
  referenceCode: string
  guestPhone: string
}

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

export interface ReservationSummary {
  total: number
  totalCovers: number
  pending: number
  confirmed: number
  seated: number
  completed: number
  cancelled: number
  noShow: number
}

export interface DailyReservationsResponse {
  success: true
  data: {
    date: string
    reservations: Reservation[]
    summary: ReservationSummary
  }
}