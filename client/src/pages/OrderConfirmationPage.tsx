import { Link, useLocation, useParams } from 'react-router-dom'
import { BackButton } from '../components/BackButton'
import type { Order } from '../types/order'
import { formatCurrency } from '../utils/currency'
import { CopyButton } from '../components/CopyButton'

const FOREST = '#1F2E22'
const PARCHMENT = '#FBF6EC'
const HERB = '#4B6B4F'

export default function OrderConfirmationPage() {
  const { referenceCode } = useParams()
  const location = useLocation()
  const order = (location.state as { order?: Order } | null)?.order

  if (!order) {
    return (
      <div style={{ background: PARCHMENT, minHeight: '100vh' }} className="flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <p className="text-stone-600">
            We don't have this order's details handy in this session, but your reference is:
          </p>
          <p className="text-2xl font-bold" style={{ color: FOREST }}>{referenceCode}</p>
          <p className="text-sm text-stone-500">Save this code — you'll be able to look up your order with it soon.</p>
          <Link to="/" className="font-semibold inline-block" style={{ color: HERB }}>Back to home</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: PARCHMENT, minHeight: '100vh' }} className="py-12 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        <BackButton to="/" />

        <div className="bg-[#fffdfa] border border-stone-200 rounded-xl shadow-[0_1.5rem_4rem_rgba(31,46,34,0.1)] p-6 space-y-5 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-2xl">✓</div>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: FOREST }}>Order placed</h1>
            <p className="text-stone-500 mt-1">Thanks, {order.guestName} — we're on it.</p>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between items-center"><span className="text-stone-500">Reference</span><span className="font-semibold flex items-center gap-1.5">{order.referenceCode}<CopyButton value={order.referenceCode} /></span></div>
            <div className="flex justify-between"><span className="text-stone-500">Delivering to</span><span className="font-semibold">{order.deliveryStreet}, {order.deliveryCity}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Subtotal</span><span className="font-semibold">{formatCurrency(order.subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">Delivery fee</span><span className="font-semibold">{formatCurrency(order.deliveryFee)}</span></div>
            <div className="flex justify-between text-base pt-1 border-t border-stone-200"><span className="font-bold" style={{ color: FOREST }}>Total</span><span className="font-bold" style={{ color: FOREST }}>{formatCurrency(order.total)}</span></div>
          </div>

          {order.paymentInstructions && (
            <div className="border rounded-lg p-4 text-left space-y-2 text-sm" style={{ borderColor: '#E3A008', background: '#fffbea' }}>
              <p className="font-semibold" style={{ color: FOREST }}>Bank transfer details</p>
              <div className="flex justify-between"><span className="text-stone-500">Bank</span><span>{order.paymentInstructions.bankName}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Account name</span><span>{order.paymentInstructions.accountName}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Account number</span><span>{order.paymentInstructions.accountNumber}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Narration</span><span className="font-semibold">{order.paymentInstructions.narration}</span></div>
              <p className="text-xs text-stone-500 pt-1">Please include the narration above so we can match your payment.</p>
            </div>
          )}

          <p className="text-sm text-stone-500">Save your reference code — you'll need it to track or cancel this order.</p>

          <Link to="/order" className="w-full border rounded-lg px-4 py-2.5 font-semibold inline-block" style={{ borderColor: FOREST, color: FOREST }}>
            Order more
          </Link>
        </div>
      </div>
    </div>
  )
}