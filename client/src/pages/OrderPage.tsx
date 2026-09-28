import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { fetchCuisines, fetchMeals } from '../api/meals'
import { BackButton } from '../components/BackButton'
import { CartDrawer } from '../components/CartDrawer'
import { CuisineFilterTabs } from '../components/CuisineFilterTabs'
import { ErrorState } from '../components/ErrorState'
import { MealCard } from '../components/MealCard'
import { MealCardSkeleton } from '../components/MealCardSkeleton'
import { MealDetailModal } from '../components/MealDetailModal'
import { useCart } from '../context/CartContext'
import type { Meal } from '../types/meal'

const FOREST = '#1F2E22'
const PARCHMENT = '#FBF6EC'
const HERB = '#4B6B4F'
const CHARCOAL = '#241C16'

export default function OrderPage() {
  const [selectedCuisineId, setSelectedCuisineId] = useState<string | null>(null)
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null)
  const { addItem, itemCount, openDrawer } = useCart()

  const cuisinesQuery = useQuery({ queryKey: ['order-cuisines'], queryFn: fetchCuisines })

  const mealsQuery = useQuery({
    queryKey: ['order-meals', selectedCuisineId],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '100', sort: 'name' })
      if (selectedCuisineId) params.set('cuisineId', selectedCuisineId)
      return fetchMeals(params)
    },
  })

  const visibleMeals = (mealsQuery.data?.data ?? []).filter((meal) => meal.status !== 'ARCHIVED')

  const handleAddToCart = (meal: Meal) => {
    addItem({ mealId: meal.id, name: meal.name, unitPrice: meal.price, imageUrl: meal.imageUrl })
    toast.success(`${meal.name} added to cart`, { id: `cart-${meal.id}`, duration: 1500 })
  }

  return (
    <div style={{ background: PARCHMENT, minHeight: '100vh' }}>
      <header style={{ background: FOREST }} className="text-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" style={{ fontFamily: "'Fraunces', serif" }} className="text-xl">
            Harvest &amp; Ember
          </Link>
          <button
            onClick={openDrawer}
            aria-label={`Open cart, ${itemCount} items`}
            className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: '#E3A008', color: CHARCOAL }}
              >
                {itemCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-6">
          <BackButton to="/" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: HERB }}>Order online</p>
        <h1 style={{ fontFamily: "'Fraunces', serif", color: CHARCOAL }} className="text-4xl font-bold mt-1 mb-8">
          Delivered to your door
        </h1>

        {cuisinesQuery.isLoading && (
          <div className="flex gap-2 mb-8 animate-pulse">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-9 w-20 rounded-full bg-stone-200" />
            ))}
          </div>
        )}
        {cuisinesQuery.isError && (
          <div className="mb-8">
            <ErrorState message="Could not load menu categories right now." onRetry={() => cuisinesQuery.refetch()} />
          </div>
        )}
        {cuisinesQuery.data && (
          <div className="mb-8">
            <CuisineFilterTabs
              cuisines={cuisinesQuery.data.data}
              selectedCuisineId={selectedCuisineId}
              onSelect={setSelectedCuisineId}
            />
          </div>
        )}

        {mealsQuery.isError && (
          <ErrorState message="Could not load the menu right now." onRetry={() => mealsQuery.refetch()} />
        )}

        {mealsQuery.isLoading && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <MealCardSkeleton key={index} />
            ))}
          </div>
        )}

        {!mealsQuery.isLoading && !mealsQuery.isError && visibleMeals.length === 0 && (
          <div className="text-center py-16">
            <p className="text-stone-500">No dishes are available in this category right now.</p>
          </div>
        )}

        {!mealsQuery.isLoading && visibleMeals.length > 0 && (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {visibleMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} onSelect={setSelectedMeal} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}

        {selectedMeal && <MealDetailModal meal={selectedMeal} onClose={() => setSelectedMeal(null)} />}
      </div>

      <CartDrawer />
    </div>
  )
}