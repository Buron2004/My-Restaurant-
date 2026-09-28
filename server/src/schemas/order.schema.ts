import { z } from 'zod'

const orderItemSchema = z.object({
  mealId: z.string().min(1, 'Meal id is required.'),
  quantity: z.coerce.number().int('Quantity must be a whole number.').min(1, 'Quantity must be at least 1.').max(20, 'Quantity is too high.'),
})

// Note: there is deliberately NO price field. Prices always come from the database.
export const createOrderSchema = z.object({
  guestName: z.string().trim().min(1, 'Name is required.').max(120),
  guestPhone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number.'),
  guestEmail: z.string().trim().email('Enter a valid email address.').optional().or(z.literal('')),
  deliveryStreet: z.string().trim().min(3, 'Enter your street address.').max(200),
  deliveryCity: z.string().trim().min(2, 'Enter your city.').max(100),
  deliveryZip: z.string().trim().max(20).optional(),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'BANK_TRANSFER']),
  specialInstructions: z.string().trim().max(500).optional(),
  items: z.array(orderItemSchema).min(1, 'Your cart is empty.').max(30, 'Too many different items in one order.'),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>