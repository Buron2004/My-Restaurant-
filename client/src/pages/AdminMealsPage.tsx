import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createMeal, deleteMeal, fetchCuisines, fetchMeals, updateMeal } from '../api/meals'
import { MealFilters } from '../components/MealFilters'
import { MealFormModal } from '../components/MealFormModal'
import { MealTable } from '../components/MealTable'
import type { Meal, MealStatus } from '../types/meal'
import { clearAuthToken } from '../utils/auth'

const PAGE_SIZE = 8

type Sort = 'name' | '-name' | 'price' | '-price'

export default function AdminMealsPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [cuisineId, setCuisineId] = useState('')
  const [status, setStatus] = useState<MealStatus | ''>('')
  const [sort, setSort] = useState<Sort>('name')
  const [page, setPage] = useState(1)
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const mealsQuery = useQuery({ queryKey: ['admin-meals', search, cuisineId, status, sort, page], queryFn: () => { const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), sort }); if (search) params.set('search', search); if (cuisineId) params.set('cuisineId', cuisineId); if (status) params.set('status', status); return fetchMeals(params) } })
  const cuisinesQuery = useQuery({ queryKey: ['cuisines'], queryFn: fetchCuisines })
  const saveMutation = useMutation({ mutationFn: (input: Parameters<typeof createMeal>[0]) => editingMeal ? updateMeal(editingMeal.id, input) : createMeal(input), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['admin-meals'] }); setIsFormOpen(false); setEditingMeal(null); setNotice({ type: 'success', message: editingMeal ? 'Meal updated.' : 'Meal created.' }) }, onError: (error: Error) => setNotice({ type: 'error', message: error.message }) })
  const deleteMutation = useMutation({ mutationFn: deleteMeal, onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['admin-meals'] }); setNotice({ type: 'success', message: 'Meal deleted.' }) }, onError: (error: Error) => setNotice({ type: 'error', message: error.message }) })

  const openCreate = () => { setEditingMeal(null); setIsFormOpen(true) }
  const openEdit = (meal: Meal) => { setEditingMeal(meal); setIsFormOpen(true) }
  const handleDelete = (meal: Meal) => { if (window.confirm(`Delete ${meal.name}?`)) deleteMutation.mutate(meal.id) }
  const handleLogout = () => { clearAuthToken(); window.location.assign('/login') }
  const mealData = mealsQuery.data

  return <div className="admin-meals min-h-screen bg-[#f7f1e8] text-stone-900"><header className="border-b border-stone-200 bg-[#fbf8f2]"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><div><p className="eyebrow">Operations / Menu</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Meal management</h1></div><div className="flex items-center gap-3"><button className="button-secondary" onClick={handleLogout}>Log out</button><button className="button-primary" onClick={openCreate}>+ New meal</button></div></div></header><main className="admin-meals-main mx-auto max-w-7xl space-y-6 px-5 py-8 lg:px-8">
    {notice && <div className={`notice ${notice.type === 'success' ? 'notice-success' : 'notice-error'}`} role="status">{notice.message}<button onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button></div>}
    <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">Menu catalogue</h2><p className="mt-1 text-sm text-stone-500">Manage dishes, availability, and menu placement.</p></div>{mealsQuery.data && <p className="text-sm text-stone-500">{mealsQuery.data.meta.total} meals</p>}</div><MealFilters search={search} cuisineId={cuisineId} status={status} sort={sort} cuisines={cuisinesQuery.data?.data ?? []} onSearchChange={(value) => { setSearch(value); setPage(1) }} onCuisineChange={(value) => { setCuisineId(value); setPage(1) }} onStatusChange={(value) => { setStatus(value); setPage(1) }} onSortChange={(value) => { setSort(value); setPage(1) }} /></section>
    {mealsQuery.isLoading ? <div className="state-panel">Loading meals...</div> : mealsQuery.isError ? <div className="state-panel state-error">Could not load meals. {(mealsQuery.error as Error).message}</div> : !mealData || mealData.data.length === 0 ? <div className="state-panel"><h2 className="text-lg font-semibold">No meals found</h2><p className="mt-1 text-sm text-stone-500">Try changing the filters or create a new meal.</p></div> : <><MealTable meals={mealData.data} onEdit={openEdit} onDelete={handleDelete} /><div className="flex items-center justify-between"><p className="text-sm text-stone-500">Page {mealData.meta.page} of {mealData.meta.totalPages}</p><div className="flex gap-2"><button className="button-secondary" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="button-secondary" disabled={page >= mealData.meta.totalPages} onClick={() => setPage((value) => value + 1)}>Next</button></div></div></>}
  </main>{isFormOpen && <MealFormModal meal={editingMeal} cuisines={cuisinesQuery.data?.data ?? []} isSaving={saveMutation.isPending} onClose={() => setIsFormOpen(false)} onSubmit={(values) => saveMutation.mutate(values)} />}</div>
}
