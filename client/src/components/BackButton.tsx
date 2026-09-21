import { Link } from 'react-router-dom'

interface Props {
  to: string
  label?: string
}

export function BackButton({ to, label = 'Back' }: Props) {
  return (
    <Link
      to={to}
      aria-label={label}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-stone-200 shadow-sm text-stone-700 hover:bg-stone-50 hover:shadow-md transition-all"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
    </Link>
  )
}