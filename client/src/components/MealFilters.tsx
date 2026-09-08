import type { Cuisine, MealStatus } from '../types/meal'

type MealFiltersProps = {
  search: string
  cuisineId: string
  status: MealStatus | ''
  sort: 'name' | '-name' | 'price' | '-price'
  cuisines: Cuisine[]
  onSearchChange: (value: string) => void
  onCuisineChange: (value: string) => void
  onStatusChange: (value: MealStatus | '') => void
  onSortChange: (value: MealFiltersProps['sort']) => void
}

export function MealFilters({ search, cuisineId, status, sort, cuisines, onSearchChange, onCuisineChange, onStatusChange, onSortChange }: MealFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-[minmax(14rem,1.5fr)_1fr_1fr_1fr]">
      <label className="field-label">
        Search meals
        <input className="field-control" value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search by name" />
      </label>
      <label className="field-label">
        Cuisine
        <select className="field-control" value={cuisineId} onChange={(event) => onCuisineChange(event.target.value)}>
          <option value="">All cuisines</option>
          {cuisines.map((cuisine) => <option key={cuisine.id} value={cuisine.id}>{cuisine.name}</option>)}
        </select>
      </label>
      <label className="field-label">
        Availability
        <select className="field-control" value={status} onChange={(event) => onStatusChange(event.target.value as MealStatus | '')}>
          <option value="">All statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </label>
      <label className="field-label">
        Sort by
        <select className="field-control" value={sort} onChange={(event) => onSortChange(event.target.value as MealFiltersProps['sort'])}>
          <option value="name">Name A-Z</option>
          <option value="-name">Name Z-A</option>
          <option value="price">Price low-high</option>
          <option value="-price">Price high-low</option>
        </select>
      </label>
    </div>
  )
}
