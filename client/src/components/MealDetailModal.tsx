import type { Meal } from '../types/meal'
import { Modal } from './Modal'
import { StatusBadge } from './StatusBadge'

const FOREST = '#1F2E22'
const HERB = '#4B6B4F'

function formatPrice(minorUnits: number) {
  return `$${(minorUnits / 100).toFixed(2)}`
}

interface Props {
  meal: Meal
  onClose: () => void
}

export function MealDetailModal({ meal, onClose }: Props) {
  return (
    <Modal onClose={onClose} labelledBy="meal-detail-title" maxWidthClassName="max-w-lg">
      <div className="aspect-[4/3] bg-stone-50 relative">
        {meal.imageUrl ? (
          <img
            src={meal.imageUrl}
            alt={meal.name}
            className={`w-full h-full object-cover ${meal.status === 'OUT_OF_STOCK' ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: HERB }}>
            {meal.cuisine.name}
          </p>
          <h2 id="meal-detail-title" className="text-2xl font-bold mt-1" style={{ color: FOREST }}>
            {meal.name}
          </h2>
        </div>

        {meal.description && <p className="text-stone-600 leading-relaxed">{meal.description}</p>}

        <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
          <span>⏱ {meal.prepTimeMinutes} min prep</span>
          <StatusBadge status={meal.status.toLowerCase() as 'available' | 'out_of_stock' | 'archived'} />
        </div>

        {meal.dietaryTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {meal.dietaryTags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium uppercase tracking-wide rounded-full px-2.5 py-1 bg-stone-100 text-stone-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-2xl font-bold" style={{ color: FOREST }}>
          {formatPrice(meal.price)}
        </p>
      </div>
    </Modal>
  )
}