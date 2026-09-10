import type { RestaurantTable } from '../types/table'

type Props = { tables: RestaurantTable[]; onEdit: (table: RestaurantTable) => void; onToggle: (table: RestaurantTable) => void }
const locations = { INDOOR: 'Indoor', OUTDOOR: 'Outdoor', PRIVATE: 'Private' }

export function TableList({ tables, onEdit, onToggle }: Props) {
  return <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm"><table className="min-w-full text-left text-sm"><thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.14em] text-stone-500"><tr>{['Table', 'Capacity', 'Location', 'Status', 'Actions'].map((heading) => <th className="px-5 py-4 font-semibold" key={heading}>{heading}</th>)}</tr></thead><tbody className="divide-y divide-stone-100">{tables.map((table) => <tr key={table.id} className="hover:bg-amber-50/40"><td className="px-5 py-4 font-semibold text-stone-900">{table.name}</td><td className="px-5 py-4 text-stone-600">{table.capacity} guests</td><td className="px-5 py-4 text-stone-600">{locations[table.location]}</td><td className="px-5 py-4"><span className={`status-pill ${table.isActive ? 'status-available' : 'status-archived'}`}>{table.isActive ? 'Active' : 'Inactive'}</span></td><td className="px-5 py-4"><div className="flex gap-2"><button className="table-action" onClick={() => onEdit(table)}>Edit</button><button className="table-action" onClick={() => onToggle(table)}>{table.isActive ? 'Deactivate' : 'Activate'}</button></div></td></tr>)}</tbody></table></div>
}
