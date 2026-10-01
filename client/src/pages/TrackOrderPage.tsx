import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import { cancelOrder, lookupOrder } from '../api/orders'
import { BackButton } from '../components/BackButton'
import type { Order } from '../types/order'
import { formatCurrency } from '../utils/currency'
import { CopyButton } from '../components/CopyButton'

const FOREST = '#1F2E22'
const PARCHMENT = '#FBF6EC'
const HERB = '#4B6B4F'
const CHARCOAL = '#241C16'

const statusLabels: Record<Order['status'], string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const schema = z.object({
  referenceCode: z.string().trim().min(1, 'Enter your order reference.'),
  guestPhone: z.string().trim().min(1, 'Enter the phone number used to order.'),
})

type FormValues = z.infer<typeof schema>

export default function TrackOrderPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [lastCredentials, setLastCredentials] = useState<FormValues | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const lookupMutation = useMutation({
    mutationFn: (values: FormValues) => lookupOrder(values.referenceCode, values.guestPhone),
    onSuccess: (response, values) => {
      setOrder(response.data)
      setLastCredentials(values)
    },
  })

  const cancelMutation = useMutation({
    mutationFn: () => {
      if (!lastCredentials) throw new Error('Missing lookup details.')
      return cancelOrder(lastCredentials)
    },
    onSuccess: (response) => {
      setOrder(response.data)
      setShowCancelConfirm(false)
      toast.success('Order cancelled.')
    },
  })

  const isCancellable = order && ['PENDING', 'CONFIRMED'].includes(order.status)

  return (
    <div style={{ background: PARCHMENT, minHeight: '100vh' }} className="py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <BackButton to="/" />

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: HERB }}>Track order</p>
          <h1 style={{ fontFamily: "'Fraunces', serif", color: CHARCOAL }} className="text-4xl font-bold mt-1">
            Find your order
          </h1>
        </div>

        {!order && (
          <form
            onSubmit={handleSubmit((values) => lookupMutation.mutate(values))}
            className="bg-[#fffdfa] border border-stone-200 rounded-xl shadow-[0_1.5rem_4rem_rgba(31,46,34,0.1)] p-6 space-y-5"
          >
            {lookupMutation.isError && (
              <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {lookupMutation.error instanceof Error ? lookupMutation.error.message : 'Something went wrong.'}
              </p>
            )}

            <div>
              <label htmlFor="referenceCode" className="block text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: HERB }}>
                Reference code
              </label>
              <input id="referenceCode" placeholder="ORD-XXXXXX" {...register('referenceCode')} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]" />
              {errors.referenceCode && <p className="text-sm text-red-700 mt-1">{errors.referenceCode.message}</p>}
            </div>

            <div>
              <label htmlFor="guestPhone" className="block text-sm font-semibold uppercase tracking-wide mb-1" style={{ color: HERB }}>
                Phone number
              </label>
              <input id="guestPhone" {...register('guestPhone')} className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#E3A008] focus:border-[#4B6B4F]" />
              {errors.guestPhone && <p className="text-sm text-red-700 mt-1">{errors.guestPhone.message}</p>}
            </div>

            <button
              type="submit"
              disabled={lookupMutation.isPending}
              className="w-full font-semibold rounded-lg px-4 py-2.5 transition-colors disabled:opacity-50"
              style={{ background: FOREST, color: PARCHMENT }}
            >
              {lookupMutation.isPending ? 'Looking up…' : 'Find order'}
            </button>
          </form>
        )}

        {order && (
          <div className="bg-[#fffdfa] border border-stone-200 rounded-xl shadow-[0_1.5rem_4rem_rgba(31,46,34,0.1)] p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold" style={{ color: CHARCOAL }}>{order.guestName}'s order</h2>
              <span
                className="text-xs font-semibold uppercase tracking-wide rounded-full px-3 py-1"
                style={{
                  background: order.status === 'CANCELLED' ? '#fee2e2' : '#dcfce7',
                  color: order.status === 'CANCELLED' ? '#991b1b' : '#166534',
                }}
              >
                {statusLabels[order.status]}
              </span>
            </div>

            <div className="space-y-2">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-stone-600">{item.quantity} × {item.mealName}</span>
                  <span className="font-semibold">{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Reference</span>
                <span className="font-semibold flex items-center gap-1.5">
                  {order.referenceCode}
                  <CopyButton value={order.referenceCode} />
                </span>
              </div>
              <div className="flex justify-between"><span className="text-stone-500">Delivering to</span><span className="font-semibold">{order.deliveryStreet}, {order.deliveryCity}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Payment</span><span className="font-semibold">{order.paymentMethod === 'BANK_TRANSFER' ? 'Bank transfer' : 'Pay on delivery'} · {order.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Delivery fee</span><span>{formatCurrency(order.deliveryFee)}</span></div>
              <div className="flex justify-between text-base pt-1 border-t border-stone-200"><span className="font-bold" style={{ color: FOREST }}>Total</span><span className="font-bold" style={{ color: FOREST }}>{formatCurrency(order.total)}</span></div>
            </div>

            {order.paymentInstructions && order.paymentStatus === 'UNPAID' && (
              <div className="border rounded-lg p-4 text-sm space-y-1" style={{ borderColor: '#E3A008', background: '#fffbea' }}>
                <p className="font-semibold" style={{ color: FOREST }}>Bank transfer details</p>
                <p>{order.paymentInstructions.bankName} — {order.paymentInstructions.accountName}</p>
                <p>{order.paymentInstructions.accountNumber}</p>
                <p>Narration: <strong>{order.paymentInstructions.narration}</strong></p>
              </div>
            )}

            {cancelMutation.isError && (
              <p className="text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm">
                {cancelMutation.error instanceof Error ? cancelMutation.error.message : 'Could not cancel this order.'}
              </p>
            )}

            {isCancellable && !showCancelConfirm && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="w-full border border-red-700 text-red-700 hover:bg-red-50 font-semibold rounded-lg px-4 py-2.5 transition-colors"
              >
                Cancel order
              </button>
            )}

            {showCancelConfirm && (
              <div className="space-y-3">
                <p className="text-sm text-stone-600">Are you sure you want to cancel this order?</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowCancelConfirm(false)} className="flex-1 border border-stone-300 rounded-lg px-4 py-2.5 font-semibold text-stone-700">
                    Keep it
                  </button>
                  <button
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    className="flex-1 bg-red-700 hover:bg-red-800 disabled:opacity-50 text-white rounded-lg px-4 py-2.5 font-semibold"
                  >
                    {cancelMutation.isPending ? 'Cancelling…' : 'Yes, cancel'}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={() => { setOrder(null); setLastCredentials(null); setShowCancelConfirm(false) }}
              className="text-sm font-semibold"
              style={{ color: HERB }}
            >
              Look up a different order
            </button>
          </div>
        )}
      </div>
    </div>
  )
}