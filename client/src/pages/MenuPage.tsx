import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCuisines, fetchMeals } from '../api/meals'
import { CuisineFilterTabs } from '../components/CuisineFilterTabs'
import { MealCard } from '../components/MealCard'

const FOREST = '#1F2E22'
const PARCHMENT = '#FBF6EC'
const HERB = '#4B6B4F'
const CHARCOAL = '#241C16'

function MealCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm animate-pulse">
      <div className="aspect-[4/3] bg-stone-200" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 rounded bg-stone-200" />
        <div className="h-4 w-32 rounded bg-stone-200" />
        <div className="h-3 w-full rounded bg-stone-100" />
        <div className="h-4 w-14 rounded bg-stone-200 mt-1" />
      </div>
    </div>
  )
}

export default function MenuPage() {
  const [selectedCuisineId, setSelectedCuisineId] = useState<string | null>(null)

  const cuisinesQuery = useQuery({ queryKey: ['menu-cuisines'], queryFn: fetchCuisines })

  const mealsQuery = useQuery({
    queryKey: ['menu-meals', selectedCuisineId],
    queryFn: () => {
      const params = new URLSearchParams({ limit: '100', sort: 'name' })
      if (selectedCuisineId) params.set('cuisineId', selectedCuisineId)
      return fetchMeals(params)
    },
  })

  // ARCHIVED meals must never appear — filtered here since the API doesn't
  // exclude them by default when no status filter is supplied.
  const visibleMeals = (mealsQuery.data?.data ?? []).filter((meal) => meal.status !== 'ARCHIVED')

  return (
    <div style={{ background: PARCHMENT, minHeight: '100vh' }}>
      <header style={{ background: FOREST }} className="text-white">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link to="/" style={{ fontFamily: "'Fraunces', serif" }} className="text-xl">
            Harvest &amp; Ember
          </Link>
          <Link to="/reserve" className="text-sm font-semibold hover:opacity-80">
            Reserve a table
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: HERB }}>Menu</p>
        <h1 style={{ fontFamily: "'Fraunces', serif", color: CHARCOAL }} className="text-4xl font-bold mt-1 mb-8">
          Our full menu
        </h1>

        {cuisinesQuery.isLoading && (
          <div className="flex gap-2 mb-8 animate-pulse">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-9 w-20 rounded-full bg-stone-200" />
            ))}
          </div>
        )}
        {cuisinesQuery.isError && (
          <p className="text-red-800 mb-8">Could not load menu categories right now.</p>
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
          <p className="text-red-800 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            Could not load the menu right now. Please try again shortly.
          </p>
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
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}