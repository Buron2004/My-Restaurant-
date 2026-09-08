import type { Meal } from '../types/meal'

type MealTableProps = {
  meals: Meal[]
  onEdit: (meal: Meal) => void
  onDelete: (meal: Meal) => void
}

const statusLabels = { AVAILABLE: 'Available', OUT_OF_STOCK: 'Out of stock', ARCHIVED: 'Archived' }

export function MealTable({ meals, onEdit, onDelete }: MealTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.14em] text-stone-500">
          <tr>{['Meal', 'Cuisine', 'Price', 'Status', 'Featured', 'Actions'].map((heading) => <th className="px-5 py-4 font-semibold" key={heading}>{heading}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {meals.map((meal) => (
            <tr key={meal.id} className="transition hover:bg-amber-50/40">
              <td className="px-5 py-4"><div className="flex min-w-56 items-center gap-3"><div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-amber-100">{meal.imageUrl ? <img src={meal.imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-lg">🍽</span>}</div><div><p className="font-semibold text-stone-900">{meal.name}</p><p className="line-clamp-1 max-w-64 text-xs text-stone-500">{meal.description || 'No description'}</p></div></div></td>
              <td className="whitespace-nowrap px-5 py-4 text-stone-600">{meal.cuisine.name}</td>
              <td className="whitespace-nowrap px-5 py-4 font-semibold text-stone-900">{(meal.price / 100).toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</td>
              <td className="whitespace-nowrap px-5 py-4"><span className={`status-pill status-${meal.status.toLowerCase()}`}>{statusLabels[meal.status]}</span></td>
              <td className="whitespace-nowrap px-5 py-4 text-stone-600">{meal.isFeatured ? 'Yes' : 'No'}</td>
              <td className="whitespace-nowrap px-5 py-4"><div className="flex gap-2"><button className="table-action" onClick={() => onEdit(meal)}>Edit</button><button className="table-action table-action-danger" onClick={() => onDelete(meal)}>Delete</button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
