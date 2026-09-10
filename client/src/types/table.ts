export type TableLocation = 'INDOOR' | 'OUTDOOR' | 'PRIVATE'

export type RestaurantTable = {
  id: string
  name: string
  capacity: number
  location: TableLocation
  isActive: boolean
}

export type TableInput = {
  name: string
  capacity: number
  location: TableLocation
  isActive: boolean
}
