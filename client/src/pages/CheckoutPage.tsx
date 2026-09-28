import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { createOrder, fetchDeliveryQuote } from '../api/orders'
import { BackButton } from '../components/BackButton'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'
import { MIN_ORDER_KOBO } from '../utils/order'

const FOREST = '#1F2E22'
const PARCHMENT = '#FBF6EC'
const HERB = '#4B6B4F'
const CHARCOAL = '#241C16'

const schema = z.object({
  guestName: z.string().trim().min(1, 'Name is required.'),
  guestPhone: z.string().trim().regex(/^[0-9+\-\s()]{7,20}$/, 'Enter a valid phone number.'),
  guestEmail: z.string().trim().email('Enter a valid email address.').optional().or(z.literal('')),
  deliveryStreet: z.string().trim().min(3, 'Enter your street address.'),
  deliveryCity: z.string().trim().min(2, 'Enter your city.'),
  deliveryZip: z.string().trim().optional(),
  paymentMethod: z.enum(['CASH_ON_DELIVERY', 'BANK_TRANSFER']),
  specialInstructions: z.string().trim().max(500).optional(),
})

type FormValues = z.infer<typeof schema>

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { items, subtotal, clearCart } = useCart()
  const [zipDraft, setZipDraft] = useState('')
  const [debouncedZip, setDebouncedZip] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedZip(zipDraft.trim()), 400)
    return () => clearTimeout(timer)
  }, [zipDraft])

  const quoteQuery = useQuery({
    queryKey: ['delivery-quote', debouncedZip],
    queryFn: () => fetchDeliveryQuote(debouncedZip),
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { paymentMethod: 'CASH_ON_DELIVERY' } })

  const paymentMethod = watch('paymentMethod')

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      createOrder({
        ...values,
        guestEmail: values.guestEmail || undefined,
        deliveryZip: values.deliveryZip || undefined,
        items: items.map((item) => ({ mealId: item.mealId, quantity: item.quantity })),
      }),
    onSuccess: (response) => {
      clearCart()
      navigate(`/order-confirmation/${response.data.referenceCode}`, { state: { order: response.data } })
    },
  })

  const quote = quoteQuery.data?.data
  const deliveryFee = quote?.available ? (quote.fee ?? 0) : undefined
  const total = deliveryFee !== undefined ? subtotal + deliveryFee : undefined
  const meetsMinimum = subtotal >= MIN_ORDER_KOBO

  if (items.length === 0) {
    return (
      <div style={{ background: PARCHMENT, minHeight: '100vh' }} className="flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-stone-600">Your cart is empty.</p>
          <Link to="/order" className="font-semibold" style={{ color: HERB }}>Back to the menu</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: PARCHMENT, minHeight: '100vh' }} className="py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <BackButton to="/order" />

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: HERB }}>Checkout</p>
          <h1 style={{ fontFamily: "'Fraunces', serif", color: CHARCOAL }} className="text-4xl font-bold mt-1">
            Almost there
          </h1>
        </div>

        {/* Order summary */}
        <div className="bg-[#fffdfa] border border-stone-200 rounded-xl shadow-[0_1.5rem_4rem_rgba(31,46,34,0.1)] p-6 space-y-3">
          <h2 className="font-bold" style={{ color: FOREST }}>Your order</h2>
          {items.map((item) => (
            <div key={item.mealId} className="flex justify-between text-sm">
              <span className="text-stone-600">{item.quantity} × {item.name}</span>
              <span className="font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-stone-200 pt-3 space-y-1">
            <div className="flex justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-stone-600">
              <span>Delivery fee</span>
              <span>
                {quoteQuery.isFetching
                  ? 'Calculating…'
                  : deliveryFee !== undefined
                    ? formatCurrency(deliveryFee)
                    : 'Enter your city/zip below'}
              </span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-1" style={{ color: FOREST }}>
              <span>Total</span>
              <span>{total !== undefined ? formatCurrency(total) : '—'}</span>
            </div>
          </div>
          {!meetsMinimum && (
            <p className="text-sm rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800">
              Your cart is below the {formatCurrency(MIN_ORDER_KOBO)} minimum order.
            </p>
          )}
        </div>

        {/* Delivery + payment form */}
        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="bg-[#fffdfa] border border-stone-200 rounded-xl shadow-[0_1.5rem_4rem_rgba(31,46,34,0.1)] p-6 space-y-5"
        >
          {mutation.isError && (
            <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              {mutation.error instanceof Error ? mutation.error.message : 'Something went wrong. Please try again.'}
            </p>
          )}

          <div>
            <label htmlFor="guestName" className="block text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: HERB }}>
              Full name
            </label>
            <input id="guestName" {...register('guestName')} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]" />
            {errors.guestName && <p className="text-sm text-red-700 mt-1">{errors.guestName.message}</p>}
          </div>

          <div>
            <label htmlFor="guestPhone" className="block text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: HERB }}>
              Phone number
            </label>
            <input id="guestPhone" {...register('guestPhone')} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]" />
            {errors.guestPhone && <p className="text-sm text-red-700 mt-1">{errors.guestPhone.message}</p>}
          </div>

          <div>
            <label htmlFor="guestEmail" className="block text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: HERB }}>
              Email <span className="text-stone-400 font-normal normal-case">(optional)</span>
            </label>
            <input id="guestEmail" type="email" {...register('guestEmail')} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]" />
            {errors.guestEmail && <p className="text-sm text-red-700 mt-1">{errors.guestEmail.message}</p>}
          </div>

          <div>
            <label htmlFor="deliveryStreet" className="block text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: HERB }}>
              Street address
            </label>
            <input id="deliveryStreet" {...register('deliveryStreet')} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]" />
            {errors.deliveryStreet && <p className="text-sm text-red-700 mt-1">{errors.deliveryStreet.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="deliveryCity" className="block text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: HERB }}>
                City
              </label>
              <input id="deliveryCity" {...register('deliveryCity')} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]" />
              {errors.deliveryCity && <p className="text-sm text-red-700 mt-1">{errors.deliveryCity.message}</p>}
            </div>
            <div>
              <label htmlFor="deliveryZip" className="block text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: HERB }}>
                Zip <span className="text-stone-400 font-normal normal-case">(optional)</span>
              </label>
              <input
                id="deliveryZip"
                {...register('deliveryZip')}
                onChange={(event) => setZipDraft(event.target.value)}
                placeholder="Not sure? Leave blank"
                className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]"
              />
            </div>
          </div>

          {quote && !quote.available && (
            <p className="text-sm rounded-lg px-3 py-2 bg-red-50 border border-red-200 text-red-800">
              Sorry, we don't currently deliver to this area.
            </p>
          )}
          {quote?.available && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ background: '#f0f4f0', color: HERB }}>
              Delivering to <strong>{quote.zoneLabel}</strong> — {formatCurrency(quote.fee ?? 0)} delivery fee
            </p>
          )}

          <div>
            <label className="block text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: HERB }}>
              Payment method
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className={`border rounded-lg px-4 py-3 cursor-pointer text-sm font-medium ${paymentMethod === 'CASH_ON_DELIVERY' ? 'border-[#1F2E22] bg-stone-50' : 'border-stone-300'}`}>
                <input type="radio" value="CASH_ON_DELIVERY" {...register('paymentMethod')} className="sr-only" />
                Pay on delivery
              </label>
              <label className={`border rounded-lg px-4 py-3 cursor-pointer text-sm font-medium ${paymentMethod === 'BANK_TRANSFER' ? 'border-[#1F2E22] bg-stone-50' : 'border-stone-300'}`}>
                <input type="radio" value="BANK_TRANSFER" {...register('paymentMethod')} className="sr-only" />
                Bank transfer
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="specialInstructions" className="block text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: HERB }}>
              Delivery notes <span className="text-stone-400 font-normal normal-case">(optional)</span>
            </label>
            <textarea id="specialInstructions" rows={3} {...register('specialInstructions')} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]" />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || !meetsMinimum || quote?.available === false}
            className="w-full rounded-lg px-4 py-3 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: FOREST, color: PARCHMENT }}
          >
            {mutation.isPending ? 'Placing order…' : `Place order${total !== undefined ? ` — ${formatCurrency(total)}` : ''}`}
          </button>
        </form>
      </div>
    </div>
  )
}