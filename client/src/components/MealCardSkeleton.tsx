export function MealCardSkeleton() {
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