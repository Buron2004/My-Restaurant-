import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchReservationsForDate, updateReservationStatus } from '../api/reservations'
import { AdminNav } from '../components/AdminNav'
import type { ReservationStatus } from '../types/reservation'

const statusLabels: Record<ReservationStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SEATED: 'Seated',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
}

const ACTIONS: { label: string; target: ReservationStatus; from: ReservationStatus[] }[] = [
  { label: 'Confirm', target: 'CONFIRMED', from: ['PENDING'] },
  { label: 'Mark seated', target: 'SEATED', from: ['CONFIRMED'] },
  { label: 'Mark completed', target: 'COMPLETED', from: ['SEATED'] },
  { label: 'Mark no-show', target: 'NO_SHOW', from: ['CONFIRMED'] },
  { label: 'Cancel', target: 'CANCELLED', from: ['PENDING', 'CONFIRMED'] },
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10)
}

export default function StaffReservationsPage() {
  const queryClient = useQueryClient()
  const [date, setDate] = useState(todayDateString())
  const [statusFilter, setStatusFilter] = useState<ReservationStatus | ''>('')
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const reservationsQuery = useQuery({
    queryKey: ['staff-reservations', date],
    queryFn: () => fetchReservationsForDate(date),
  })

  const transitionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) => updateReservationStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff-reservations', date] })
      setNotice({ type: 'success', message: 'Reservation updated.' })
    },
    onError: (error: Error) => setNotice({ type: 'error', message: error.message }),
  })

  const data = reservationsQuery.data?.data
  const filteredReservations = data
    ? statusFilter
      ? data.reservations.filter((reservation) => reservation.status === statusFilter)
      : data.reservations
    : []

  return (
    <div className="admin-meals min-h-screen bg-[#FBF6EC] text-stone-900">
      <header className="border-b border-stone-200 bg-[#fbf8f2]">
        <div className="mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-7xl px-5 py-5 lg:px-8">
          <div>
            <p className="eyebrow">Operations / Reservations</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Reservation dashboard</h1>
          </div>
          <AdminNav />
        </div>
      </header>

      <main className="admin-meals-main mx-auto max-w-7xl space-y-6 px-5 py-8 lg:px-8">
        {notice && (
          <div className={`notice ${notice.type === 'success' ? 'notice-success' : 'notice-error'}`} role="status">
            {notice.message}
            <button onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button>
          </div>
        )}

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <label className="field-label">
              Date
              <input
                type="date"
                className="field-control"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            <label className="field-label">
              Filter by status
              <select
                className="field-control"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as ReservationStatus | '')}
              >
                <option value="">All statuses</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>
        </section>

        {data && (
          <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {[
              { label: 'Total', value: data.summary.total },
              { label: 'Covers', value: data.summary.totalCovers },
              { label: 'Pending', value: data.summary.pending },
              { label: 'Confirmed', value: data.summary.confirmed },
              { label: 'Seated', value: data.summary.seated },
              { label: 'Completed', value: data.summary.completed },
              { label: 'Cancelled', value: data.summary.cancelled },
              { label: 'No-show', value: data.summary.noShow },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-stone-200 bg-white p-3 text-center shadow-sm">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-stone-500 uppercase tracking-wide mt-1">{stat.label}</p>
              </div>
            ))}
          </section>
        )}

        {reservationsQuery.isLoading && <div className="state-panel">Loading reservations…</div>}
        {reservationsQuery.isError && (
          <div className="state-panel state-error">
            Could not load reservations. {(reservationsQuery.error as Error).message}
          </div>
        )}
        {data && filteredReservations.length === 0 && !reservationsQuery.isLoading && (
          <div className="state-panel">
            <h2 className="text-lg font-semibold">No reservations found</h2>
            <p className="mt-1 text-sm text-stone-500">Try a different date or status filter.</p>
          </div>
        )}

        {data && filteredReservations.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-[0.14em] text-stone-500">
                <tr>
                  {['Time', 'Guest', 'Phone', 'Party', 'Table', 'Status', 'Actions'].map((heading) => (
                    <th className="px-5 py-4 font-semibold" key={heading}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredReservations.map((reservation) => {
                  const status = reservation.status as ReservationStatus
                  const availableActions = ACTIONS.filter((action) => action.from.includes(status))

                  return (
                    <tr key={reservation.id} className="hover:bg-amber-50/40">
                      <td className="px-5 py-4 whitespace-nowrap font-semibold">{formatTime(reservation.startTime)}</td>
                      <td className="px-5 py-4">{reservation.guestName}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-stone-600">{reservation.guestPhone}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-stone-600">{reservation.partySize}</td>
                      <td className="px-5 py-4 whitespace-nowrap text-stone-600">{reservation.table.name}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`status-pill status-${status.toLowerCase()}`}>{statusLabels[status]}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          {availableActions.length === 0 && <span className="text-xs text-stone-400">—</span>}
                          {availableActions.map((action) => (
                            <button
                              key={action.target}
                              className={`table-action ${action.target === 'CANCELLED' || action.target === 'NO_SHOW' ? 'table-action-danger' : ''}`}
                              disabled={transitionMutation.isPending}
                              onClick={() => transitionMutation.mutate({ id: reservation.id, status: action.target })}
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}