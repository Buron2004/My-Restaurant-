import type { Meal } from '../types/meal'

const FOREST = '#1F2E22'
const HERB = '#4B6B4F'

function formatPrice(minorUnits: number) {
    return `$${(minorUnits / 100).toFixed(2)}`
}

interface Props {
    meal: Meal
    onSelect?: (meal: Meal) => void
}

export function MealCard({ meal, onSelect }: Props) {
    const isOutOfStock = meal.status === 'OUT_OF_STOCK'

    return (
        <div
            role={onSelect ? 'button' : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={() => onSelect?.(meal)}
            onKeyDown={(event) => {
                if (onSelect && (event.key === 'Enter' || event.key === ' ')) onSelect(meal)
            }}
            className={`rounded-xl overflow-hidden border border-stone-200 bg-white shadow-sm transition-opacity ${isOutOfStock ? 'opacity-60' : ''
                } ${onSelect ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
        >
            <div className="aspect-[4/3] relative bg-stone-50">
                {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.name} className={`w-full h-full object-cover ${isOutOfStock ? 'grayscale' : ''}`} />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">🍽️</div>
                )}
                {isOutOfStock && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="bg-stone-900/90 text-white text-sm font-extrabold uppercase tracking-widest px-5 py-2 -rotate-6 shadow-lg">
                            Sold out
                        </span>
                    </div>
                )}
                {meal.isFeatured && !isOutOfStock && (
                    <span className="absolute top-2 left-2 text-xs font-semibold rounded-full px-2.5 py-1" style={{ background: '#E3A008', color: '#241C16' }}>
                        Featured
                    </span>
                )}
            </div>
            <div className="p-4">
                <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: HERB }}>{meal.cuisine.name}</p>
                <h3 className="font-bold mt-1" style={{ color: FOREST }}>{meal.name}</h3>
                {meal.description && <p className="text-stone-500 text-sm mt-1 line-clamp-2">{meal.description}</p>}
                {meal.dietaryTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                        {meal.dietaryTags.map((tag) => (
                            <span key={tag} className="text-[0.65rem] font-medium uppercase tracking-wide rounded-full px-2 py-0.5 bg-stone-100 text-stone-600">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
                <p className="font-bold mt-2" style={{ color: FOREST }}>{formatPrice(meal.price)}</p>
            </div>
        </div>
    )
}