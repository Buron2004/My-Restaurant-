import { createContext, useContext, useEffect, useMemo, useReducer, useState } from 'react'
import type { ReactNode } from 'react'

const STORAGE_KEY = 'restaurant-cart-v1'
const MAX_QUANTITY_PER_ITEM = 20

export interface CartItem {
  mealId: string
  name: string
  unitPrice: number
  imageUrl: string | null
  quantity: number
}

type NewCartItem = Omit<CartItem, 'quantity'>

type Action =
  | { type: 'ADD'; item: NewCartItem }
  | { type: 'SET_QUANTITY'; mealId: string; quantity: number }
  | { type: 'REMOVE'; mealId: string }
  | { type: 'CLEAR' }

function reducer(state: CartItem[], action: Action): CartItem[] {
  switch (action.type) {
    case 'ADD': {
      const existing = state.find((item) => item.mealId === action.item.mealId)
      if (existing) {
        return state.map((item) =>
          item.mealId === action.item.mealId
            ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY_PER_ITEM) }
            : item,
        )
      }
      return [...state, { ...action.item, quantity: 1 }]
    }
    case 'SET_QUANTITY': {
      if (action.quantity <= 0) return state.filter((item) => item.mealId !== action.mealId)
      return state.map((item) =>
        item.mealId === action.mealId
          ? { ...item, quantity: Math.min(action.quantity, MAX_QUANTITY_PER_ITEM) }
          : item,
      )
    }
    case 'REMOVE':
      return state.filter((item) => item.mealId !== action.mealId)
    case 'CLEAR':
      return []
  }
}

function loadInitialCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as CartItem[]) : []
  } catch {
    return []
  }
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  subtotal: number
  isDrawerOpen: boolean
  addItem: (item: NewCartItem) => void
  setQuantity: (mealId: string, quantity: number) => void
  removeItem: (mealId: string) => void
  clearCart: () => void
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(reducer, [] as CartItem[], () => loadInitialCart())
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // Storage can be unavailable (private mode, quota) — the cart still works in memory.
    }
  }, [items])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
      isDrawerOpen,
      addItem: (item) => dispatch({ type: 'ADD', item }),
      setQuantity: (mealId, quantity) => dispatch({ type: 'SET_QUANTITY', mealId, quantity }),
      removeItem: (mealId) => dispatch({ type: 'REMOVE', mealId }),
      clearCart: () => dispatch({ type: 'CLEAR' }),
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
    }),
    [items, isDrawerOpen],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used inside a CartProvider.')
  return context
}