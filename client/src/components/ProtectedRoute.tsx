import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { hasValidAuthToken } from '../utils/auth'

export function ProtectedRoute() {
  const location = useLocation()

  if (!hasValidAuthToken()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
