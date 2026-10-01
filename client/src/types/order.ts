export interface OrderItemInput {
  mealId: string
  quantity: number
}

export interface CreateOrderInput {
  guestName: string
  guestPhone: string
  guestEmail?: string
  deliveryStreet: string
  deliveryCity: string
  deliveryZip?: string
  paymentMethod: 'CASH_ON_DELIVERY' | 'BANK_TRANSFER'
  specialInstructions?: string
  items: OrderItemInput[]
}

export interface OrderItem {
  id: string
  mealId: string | null
  mealName: string
  unitPrice: number
  quantity: number
}

export interface PaymentInstructions {
  bankName: string
  accountName: string
  accountNumber: string
  narration: string
}

export interface Order {
  id: string
  referenceCode: string
  guestName: string
  guestPhone: string
  guestEmail: string | null
  deliveryStreet: string
  deliveryCity: string
  deliveryZip: string | null
  deliveryZoneLabel: string | null
  paymentMethod: 'CASH_ON_DELIVERY' | 'BANK_TRANSFER'
  paymentStatus: 'UNPAID' | 'PAID'
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED'
  subtotal: number
  deliveryFee: number
  total: number
  specialInstructions: string | null
  items: OrderItem[]
  paymentInstructions: PaymentInstructions | null
}

export interface OrderResponse {
  success: true
  data: Order
}

export interface DeliveryQuote {
  available: boolean
  zoneLabel?: string
  fee?: number
}

export interface DeliveryQuoteResponse {
  success: true
  data: DeliveryQuote
}

export interface LookupOrderInput {
  referenceCode: string
  guestPhone: string
}