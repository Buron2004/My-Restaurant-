export function MealTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.14em] text-stone-500">
          <tr>{['Meal', 'Cuisine', 'Price', 'Status', 'Featured', 'Actions'].map((heading) => <th className="px-5 py-4 font-semibold" key={heading}>{heading}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="animate-pulse">
              <td className="px-5 py-4">
                <div className="flex min-w-56 items-center gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-xl bg-stone-200" />
                  <div className="space-y-2">
                    <div className="h-3.5 w-32 rounded bg-stone-200" />
                    <div className="h-3 w-44 rounded bg-stone-100" />
                  </div>
                </div>
              </td>
              <td className="px-5 py-4"><div className="h-3.5 w-20 rounded bg-stone-200" /></td>
              <td className="px-5 py-4"><div className="h-3.5 w-14 rounded bg-stone-200" /></td>
              <td className="px-5 py-4"><div className="h-5 w-20 rounded-full bg-stone-200" /></td>
              <td className="px-5 py-4"><div className="h-3.5 w-8 rounded bg-stone-200" /></td>
              <td className="px-5 py-4"><div className="h-7 w-24 rounded bg-stone-200" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}