import { Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from './components/ProtectedRoute'
import AdminMealsPage from './pages/AdminMealsPage'
import AdminTablesPage from './pages/AdminTablesPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import OrderPage from './pages/OrderPage'
import ReservePage from './pages/ReservePage'
import ManageReservationPage from './pages/ManageReservationPage'
import './App.css'

function HealthPage() {
  return (
    <main>
      <p className="eyebrow">System status</p>
      <h1>API health</h1>
      <p className="intro">Use the backend endpoint directly to verify server connectivity.</p>
      <a className="link" href="http://localhost:3000/api/health" target="_blank" rel="noreferrer">
        Open GET /api/health
      </a>
    </main>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/order" element={<OrderPage />} />
      <Route path="/health" element={<HealthPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/reserve" element={<ReservePage />} />
      <Route path="/manage-reservation" element={<ManageReservationPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin/meals" element={<AdminMealsPage />} />
        <Route path="/admin/tables" element={<AdminTablesPage />} />
      </Route>
    </Routes>
  )
}
