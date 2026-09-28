import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { createDeliveryZone, fetchDeliveryZones, updateDeliveryZone } from '../api/delivery-zones'
import { AdminNav } from '../components/AdminNav'
import { DeliveryZoneFormModal } from '../components/DeliveryZoneFormModal'
import { ErrorState } from '../components/ErrorState'
import type { DeliveryZone } from '../types/delivery-zone'
import { formatCurrency } from '../utils/currency'

export default function AdminDeliveryZonesPage() {
  const queryClient = useQueryClient()
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const zonesQuery = useQuery({ queryKey: ['delivery-zones'], queryFn: fetchDeliveryZones })

  const save = useMutation({
    mutationFn: (input: { label: string; zipPrefix: string; fee: number }) =>
      editingZone ? updateDeliveryZone(editingZone.id, input) : createDeliveryZone(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['delivery-zones'] })
      setModalOpen(false)
      setEditingZone(null)
      toast.success(editingZone ? 'Zone updated.' : 'Zone added.')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const toggle = useMutation({
    mutationFn: (zone: DeliveryZone) => updateDeliveryZone(zone.id, { isActive: !zone.isActive }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['delivery-zones'] })
      toast.success('Zone status updated.')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const zones = zonesQuery.data?.data ?? []

  return (
    <div className="admin-meals min-h-screen bg-[#FBF6EC] text-stone-900">
      <header className="border-b border-stone-200 bg-[#fbf8f2]">
        <div className="mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-7xl px-5 py-5 lg:px-8">
          <div>
            <p className="eyebrow">Operations / Delivery</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Delivery zones</h1>
          </div>
          <div className="flex items-center gap-3">
            <AdminNav />
            <button className="button-primary" onClick={() => { setEditingZone(null); setModalOpen(true) }}>+ Add zone</button>
          </div>
        </div>
      </header>

      <main className="admin-meals-main mx-auto max-w-7xl space-y-6 px-5 py-8 lg:px-8">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Zip-based delivery pricing</h2>
          <p className="mt-1 text-sm text-stone-500">
            Orders are matched to a zone by the longest matching zip prefix. Deactivate a zone instead of deleting it to preserve order history.
          </p>
        </section>

        {zonesQuery.isLoading && <div className="state-panel">Loading zones...</div>}
        {zonesQuery.isError && (
          <ErrorState message="Could not load delivery zones." onRetry={() => zonesQuery.refetch()} />
        )}
        {!zonesQuery.isLoading && !zonesQuery.isError && zones.length === 0 && (
          <div className="state-panel">No delivery zones configured yet.</div>
        )}

        {zones.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.14em] text-stone-500">
                <tr>{['Label', 'Zip prefix', 'Fee', 'Status', 'Actions'].map((h) => <th className="px-5 py-4 font-semibold" key={h}>{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-amber-50/40">
                    <td className="px-5 py-4 font-semibold">{zone.label}</td>
                    <td className="px-5 py-4 text-stone-600">{zone.zipPrefix ?? <em className="text-stone-400">Default (all others)</em>}</td>
                    <td className="px-5 py-4 font-semibold">{formatCurrency(zone.fee)}</td>
                    <td className="px-5 py-4">
                      <span className={`status-pill ${zone.isActive ? 'status-available' : 'status-archived'}`}>
                        {zone.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button className="table-action" onClick={() => { setEditingZone(zone); setModalOpen(true) }}>Edit</button>
                        <button className="table-action" onClick={() => toggle.mutate(zone)}>
                          {zone.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {modalOpen && (
        <DeliveryZoneFormModal
          zone={editingZone}
          isSaving={save.isPending}
          onClose={() => setModalOpen(false)}
          onSubmit={(values) => save.mutate(values)}
        />
      )}
    </div>
  )
}