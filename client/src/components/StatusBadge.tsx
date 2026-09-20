type Variant = 'available' | 'out_of_stock' | 'archived'

const labels: Record<Variant, string> = {
  available: 'Available',
  out_of_stock: 'Out of stock',
  archived: 'Archived',
}

export function StatusBadge({ status }: { status: Variant }) {
  return <span className={`status-pill status-${status}`}>{labels[status]}</span>
}