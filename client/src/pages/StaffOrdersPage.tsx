import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { fetchOrders, updateOrderPaymentStatus, updateOrderStatus } from '../api/orders'
import { AdminNav } from '../components/AdminNav'
import { ErrorState } from '../components/ErrorState'
import type { Order } from '../types/order'
import { formatCurrency } from '../utils/currency'

type OrderStatus = Order['status']

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

const ACTIONS: { label: string; target: OrderStatus; from: OrderStatus[] }[] = [
  { label: 'Confirm', target: 'CONFIRMED', from: ['PENDING'] },
  { label: 'Start preparing', target: 'PREPARING', from: ['CONFIRMED'] },
  { label: 'Out for delivery', target: 'OUT_FOR_DELIVERY', from: ['PREPARING'] },
  { label: 'Mark delivered', target: 'DELIVERED', from: ['OUT_FOR_DELIVERY'] },
  { label: 'Cancel', target: 'CANCELLED', from: ['PENDING', 'CONFIRMED'] },
]

function formatTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function StaffOrdersPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')

  const ordersQuery = useQuery({
    queryKey: ['staff-orders', statusFilter],
    queryFn: () => fetchOrders(statusFilter || undefined),
  })

  const transitionMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => updateOrderStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff-orders'] })
      toast.success('Order updated.')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const paymentMutation = useMutation({
    mutationFn: (id: string) => updateOrderPaymentStatus(id, 'PAID'),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['staff-orders'] })
      toast.success('Marked as paid.')
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const orders = ordersQuery.data?.data ?? []

  return (
    <div className="admin-meals min-h-screen bg-[#FBF6EC] text-stone-900">
      <header className="border-b border-stone-200 bg-[#fbf8f2]">
        <div className="mx-auto flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between max-w-7xl px-5 py-5 lg:px-8">
          <div>
            <p className="eyebrow">Operations / Orders</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Order dashboard</h1>
          </div>
          <AdminNav />
        </div>
      </header>

      <main className="admin-meals-main mx-auto max-w-7xl space-y-6 px-5 py-8 lg:px-8">
        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <label className="field-label max-w-xs">
            Filter by status
            <select className="field-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as OrderStatus | '')}>
              <option value="">All statuses</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        </section>

        {ordersQuery.isLoading && <div className="state-panel">Loading orders...</div>}
        {ordersQuery.isError && (
          <ErrorState message="Could not load orders." onRetry={() => ordersQuery.refetch()} />
        )}
        {!ordersQuery.isLoading && !ordersQuery.isError && orders.length === 0 && (
          <div className="state-panel">No orders found.</div>
        )}

        <div className="space-y-4">
          {orders.map((order) => {
            const availableActions = ACTIONS.filter((action) => action.from.includes(order.status))
            return (
              <div key={order.id} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-bold">{order.referenceCode} — {order.guestName}</p>
                    <p className="text-sm text-stone-500">{order.guestPhone} · {formatTime(order.createdAt)}</p>
                    <p className="text-sm text-stone-500 mt-1">{order.deliveryStreet}, {order.deliveryCity}{order.deliveryZip ? ` (${order.deliveryZip})` : ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`status-pill status-${order.status.toLowerCase()}`}>{statusLabels[order.status]}</span>
                    <span className="text-xs font-semibold" style={{ color: order.paymentStatus === 'PAID' ? '#166534' : '#92400e' }}>
                      {order.paymentMethod === 'BANK_TRANSFER' ? 'Bank transfer' : 'Cash on delivery'} · {order.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                </div>

                <div className="mt-3 border-t border-stone-100 pt-3 space-y-1">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-stone-600">
                      <span>{item.quantity} × {item.mealName}</span>
                      <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-bold pt-1">
                    <span>Total</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {availableActions.map((action) => (
                    <button
                      key={action.target}
                      className={`table-action ${action.target === 'CANCELLED' ? 'table-action-danger' : ''}`}
                      disabled={transitionMutation.isPending}
                      onClick={() => transitionMutation.mutate({ id: order.id, status: action.target })}
                    >
                      {action.label}
                    </button>
                  ))}
                  {order.paymentMethod === 'BANK_TRANSFER' && order.paymentStatus === 'UNPAID' && (
                    <button
                      className="table-action"
                      disabled={paymentMutation.isPending}
                      onClick={() => paymentMutation.mutate(order.id)}
                    >
                      Mark payment received
                    </button>
                  )}
                  {availableActions.length === 0 && order.paymentStatus === 'PAID' && (
                    <span className="text-xs text-stone-400">No further actions</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}