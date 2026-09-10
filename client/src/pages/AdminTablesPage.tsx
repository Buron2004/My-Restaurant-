import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { createTable, fetchTables, updateTable } from '../api/tables'
import { TableFormModal } from '../components/TableFormModal'
import { TableList } from '../components/TableList'
import type { RestaurantTable, TableInput } from '../types/table'
import { clearAuthToken } from '../utils/auth'

export default function AdminTablesPage() {
  const queryClient = useQueryClient()
  const [editingTable, setEditingTable] = useState<RestaurantTable | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const tablesQuery = useQuery({ queryKey: ['tables'], queryFn: fetchTables })
  const save = useMutation({ mutationFn: (input: TableInput) => editingTable ? updateTable(editingTable.id, input) : createTable(input), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['tables'] }); setModalOpen(false); setEditingTable(null); setNotice({ type: 'success', message: editingTable ? 'Table updated.' : 'Table added.' }) }, onError: (error: Error) => setNotice({ type: 'error', message: error.message }) })
  const toggle = useMutation({ mutationFn: (table: RestaurantTable) => updateTable(table.id, { isActive: !table.isActive }), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ['tables'] }); setNotice({ type: 'success', message: 'Table status updated.' }) }, onError: (error: Error) => setNotice({ type: 'error', message: error.message }) })
  const logout = () => { clearAuthToken(); window.location.assign('/login') }
  const tableData = tablesQuery.data

  return <div className="admin-meals min-h-screen bg-[#f7f1e8] text-stone-900"><header className="border-b border-stone-200 bg-[#fbf8f2]"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8"><div><p className="eyebrow">Operations / Floor plan</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Table management</h1></div><div className="flex gap-3"><button className="button-secondary" onClick={logout}>Log out</button><button className="button-primary" onClick={() => { setEditingTable(null); setModalOpen(true) }}>+ Add table</button></div></div></header><main className="admin-meals-main mx-auto max-w-7xl space-y-6 px-5 py-8 lg:px-8">{notice && <div className={`notice ${notice.type === 'success' ? 'notice-success' : 'notice-error'}`} role="status">{notice.message}<button onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button></div>}<section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><h2 className="text-lg font-semibold">Restaurant tables</h2><p className="mt-1 text-sm text-stone-500">Manage seating capacity and table availability.</p></section>{tablesQuery.isLoading ? <div className="state-panel">Loading tables...</div> : tablesQuery.isError ? <div className="state-panel state-error">Could not load tables. {(tablesQuery.error as Error).message}</div> : !tableData || tableData.data.length === 0 ? <div className="state-panel">No tables configured yet.</div> : <TableList tables={tableData.data} onEdit={(table) => { setEditingTable(table); setModalOpen(true) }} onToggle={(table) => toggle.mutate(table)} />}</main>{modalOpen && <TableFormModal table={editingTable} isSaving={save.isPending} onClose={() => setModalOpen(false)} onSubmit={(values) => save.mutate(values)} />}</div>
}
