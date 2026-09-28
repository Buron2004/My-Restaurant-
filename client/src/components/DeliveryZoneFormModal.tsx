import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import type { DeliveryZone } from '../types/delivery-zone'
import { Modal } from './Modal'

const schema = z.object({
    label: z.string().trim().min(1, 'Label is required.'),
    zipPrefix: z.string().trim(),
    fee: z.coerce.number().nonnegative('Fee cannot be negative.'),
})

type FormInput = z.input<typeof schema>
type FormValues = z.output<typeof schema>

interface Props {
    zone: DeliveryZone | null
    isSaving: boolean
    onClose: () => void
    onSubmit: (values: { label: string; zipPrefix: string; fee: number }) => void
}

export function DeliveryZoneFormModal({ zone, isSaving, onClose, onSubmit }: Props) {
    const { register, reset, handleSubmit, formState: { errors } } = useForm<FormInput, undefined, FormValues>({
        resolver: zodResolver(schema),
        defaultValues: { label: '', zipPrefix: '', fee: 0 },
    })

    useEffect(() => {
        reset(zone ? { label: zone.label, zipPrefix: zone.zipPrefix ?? '', fee: zone.fee / 100 } : { label: '', zipPrefix: '', fee: 0 })
    }, [zone, reset])

    const submit = (values: FormValues) => onSubmit({ ...values, fee: Math.round(values.fee * 100) })

    return (
        <Modal onClose={onClose} labelledBy="zone-form-title" maxWidthClassName="max-w-lg">
            <div className="p-6">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <p className="eyebrow">Delivery</p>
                        <h2 id="zone-form-title" className="mt-1 text-2xl font-semibold">{zone ? 'Edit zone' : 'Add zone'}</h2>
                    </div>
                    <button className="icon-button" onClick={onClose} aria-label="Close">×</button>
                </div>
                <form className="grid gap-4" onSubmit={handleSubmit(submit)}>
                    <label className="field-label">
                        Zone label
                        <input className="field-control" placeholder="e.g. Lagos Island" {...register('label')} />
                        {errors.label && <span className="field-error">{errors.label.message}</span>}
                    </label>
                    <label className="field-label">
                        Zip prefix <span className="font-normal normal-case text-stone-400">optional \u2014 leave blank for a default/fallback zone</span>
                        <input className="field-control" placeholder="e.g. 100" {...register('zipPrefix')} />
                        {errors.zipPrefix && <span className="field-error">{errors.zipPrefix.message}</span>}
                    </label>
                    <label className="field-label">
                        Delivery fee (₦)
                        <input className="field-control" type="number" step="0.01" {...register('fee')} />
                        {errors.fee && <span className="field-error">{errors.fee.message}</span>}
                    </label>
                    <div className="flex justify-end gap-3 border-t border-stone-100 pt-5">
                        <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
                        <button className="button-primary" disabled={isSaving}>{isSaving ? 'Saving...' : zone ? 'Save changes' : 'Add zone'}</button>
                    </div>
                </form>
            </div>
        </Modal>
    )
}