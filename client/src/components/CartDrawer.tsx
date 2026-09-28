import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatCurrency } from '../utils/currency'
import { MIN_ORDER_KOBO } from '../utils/order'

const FOREST = '#1F2E22'
const PARCHMENT = '#FBF6EC'

export function CartDrawer() {
  const navigate = useNavigate()
  const { items, subtotal, isDrawerOpen, closeDrawer, setQuantity, removeItem } = useCart()

  useEffect(() => {
    if (!isDrawerOpen) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isDrawerOpen, closeDrawer])

  const meetsMinimum = subtotal >= MIN_ORDER_KOBO
  const shortfall = MIN_ORDER_KOBO - subtotal

  const handleCheckout = () => {
    closeDrawer()
    navigate('/checkout')
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-stone-950/40 transition-opacity duration-200 ${
          isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onMouseDown={closeDrawer}
        aria-hidden="true"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        aria-hidden={!isDrawerOpen}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
          <h2 className="text-xl font-bold" style={{ color: FOREST }}>Your cart</h2>
          <button onClick={closeDrawer} aria-label="Close cart" className="text-2xl leading-none text-stone-500 hover:text-stone-800">
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-stone-500">Your cart is empty.</p>
              <button onClick={closeDrawer} className="mt-3 text-sm font-semibold" style={{ color: '#4B6B4F' }}>
                Browse the menu
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {items.map((item) => (
                <li key={item.mealId} className="flex gap-3 py-4">
                  <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">🍽️</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate" style={{ color: FOREST }}>{item.name}</p>
                    <p className="text-sm text-stone-500">{formatCurrency(item.unitPrice)} each</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-stone-300 rounded-lg">
                        <button
                          onClick={() => setQuantity(item.mealId, item.quantity - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="w-8 h-8 text-lg leading-none hover:bg-stone-50"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => setQuantity(item.mealId, item.quantity + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="w-8 h-8 text-lg leading-none hover:bg-stone-50"
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.mealId)} className="text-xs font-semibold text-red-700 hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold whitespace-nowrap" style={{ color: FOREST }}>
                    {formatCurrency(item.unitPrice * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-stone-200 px-5 py-4 space-y-3" style={{ background: PARCHMENT }}>
            <div className="flex items-center justify-between">
              <span className="text-stone-600">Subtotal</span>
              <span className="text-lg font-bold" style={{ color: FOREST }}>{formatCurrency(subtotal)}</span>
            </div>
            <p className="text-xs text-stone-500">Delivery fee is calculated at checkout based on your area.</p>

            {!meetsMinimum && (
              <p className="text-sm rounded-lg px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800">
                Add {formatCurrency(shortfall)} more to reach the {formatCurrency(MIN_ORDER_KOBO)} minimum order.
              </p>
            )}

            <button
              onClick={handleCheckout}
              disabled={!meetsMinimum}
              className="w-full rounded-lg px-4 py-3 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: FOREST, color: PARCHMENT }}
            >
              Proceed to checkout
            </button>
          </div>
        )}
      </aside>
    </>
  )
}