import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { clearAuthToken } from '../utils/auth'

const links = [
  { to: '/staff/reservations', label: 'Reservations' },
  { to: '/admin/meals', label: 'Meals' },
  { to: '/admin/tables', label: 'Tables' },
  { to: '/', label: 'View public site' },
]

export function AdminNav() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const handleLogout = () => {
    clearAuthToken()
    window.location.assign('/')
  }

  return (
    <div className="relative">
      <button
        className="border border-stone-200 rounded-lg px-3 py-2 text-lg leading-none hover:bg-stone-50"
        onClick={() => setOpen((value) => !value)}
        aria-label="Toggle navigation menu"
        aria-expanded={open}
      >
        ☰
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" role="presentation" onMouseDown={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-stone-200 bg-white shadow-xl overflow-hidden z-40">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 text-sm font-medium hover:bg-stone-50 ${
                  location.pathname === link.to ? 'text-[#1F2E22] font-semibold' : 'text-stone-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-50 border-t border-stone-100"
            >
              Log out
            </button>
          </div>
        </>
      )}
    </div>
  )
}