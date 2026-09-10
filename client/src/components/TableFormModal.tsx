import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { RestaurantTable, TableInput } from '../types/table'

const tableSchema = z.object({
  name: z.string().trim().min(1, 'Table name is required.'),
  capacity: z.coerce.number().int('Capacity must be a whole number.').positive('Capacity must be positive.'),
  location: z.enum(['INDOOR', 'OUTDOOR', 'PRIVATE']),
  isActive: z.boolean(),
})
type FormInput = z.input<typeof tableSchema>
type FormValues = z.output<typeof tableSchema>

type Props = { table: RestaurantTable | null; isSaving: boolean; onClose: () => void; onSubmit: (values: TableInput) => void }

export function TableFormModal({ table, isSaving, onClose, onSubmit }: Props) {
  const { register, reset, handleSubmit, formState: { errors } } = useForm<FormInput, undefined, FormValues>({ resolver: zodResolver(tableSchema), defaultValues: { name: '', capacity: 2, location: 'INDOOR', isActive: true } })
  useEffect(() => { reset(table ?? { name: '', capacity: 2, location: 'INDOOR', isActive: true }) }, [reset, table])
  return <div className="fixed inset-0 z-20 flex items-center justify-center bg-stone-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true"><div className="mb-6 flex items-center justify-between"><div><p className="eyebrow">Floor plan</p><h2 className="mt-1 text-2xl font-semibold">{table ? 'Edit table' : 'Add table'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close">×</button></div><form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}><label className="field-label">Table name<input className="field-control" {...register('name')} />{errors.name && <span className="field-error">{errors.name.message}</span>}</label><label className="field-label">Capacity<input className="field-control" type="number" {...register('capacity')} />{errors.capacity && <span className="field-error">{errors.capacity.message}</span>}</label><label className="field-label">Location<select className="field-control" {...register('location')}><option value="INDOOR">Indoor</option><option value="OUTDOOR">Outdoor</option><option value="PRIVATE">Private</option></select></label><label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" {...register('isActive')} /> Active</label><div className="flex justify-end gap-3 border-t border-stone-100 pt-5"><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button className="button-primary" disabled={isSaving}>{isSaving ? 'Saving...' : table ? 'Save changes' : 'Add table'}</button></div></form></section></div>
}
