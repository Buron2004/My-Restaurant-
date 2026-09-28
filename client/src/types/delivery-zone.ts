export interface DeliveryZone {
  id: string
  label: string
  zipPrefix: string | null
  fee: number
  isActive: boolean
}

export interface DeliveryZoneListResponse {
  success: true
  data: DeliveryZone[]
}