import type { Cuisine } from '../types/meal'

const HERB = '#4B6B4F'
const CHARCOAL = '#241C16'

interface Props {
  cuisines: Cuisine[]
  selectedCuisineId: string | null
  onSelect: (cuisineId: string | null) => void
}

export function CuisineFilterTabs({ cuisines, selectedCuisineId, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className="rounded-full px-4 py-2 text-sm font-medium border transition-colors"
        style={
          selectedCuisineId === null
            ? { background: HERB, color: '#fff', borderColor: HERB }
            : { background: '#fff', color: CHARCOAL, borderColor: '#d6d3d1' }
        }
      >
        All
      </button>
      {cuisines.map((cuisine) => (
        <button
          key={cuisine.id}
          onClick={() => onSelect(cuisine.id)}
          className="rounded-full px-4 py-2 text-sm font-medium border transition-colors"
          style={
            selectedCuisineId === cuisine.id
              ? { background: HERB, color: '#fff', borderColor: HERB }
              : { background: '#fff', color: CHARCOAL, borderColor: '#d6d3d1' }
          }
        >
          {cuisine.name}
        </button>
      ))}
    </div>
  )
}