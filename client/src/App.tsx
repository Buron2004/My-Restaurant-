import { Link, Route, Routes } from 'react-router-dom'
import './App.css'

function HomePage() {
  return (
    <main>
      <p className="eyebrow">Day 1 setup</p>
      <h1>Restaurant Management</h1>
      <p className="intro">
        The client foundation is ready for the assessment features.
      </p>
      <Link className="link" to="/health">
        Check API health
      </Link>
    </main>
  )
}

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
      <Route path="/" element={<HomePage />} />
      <Route path="/health" element={<HealthPage />} />
    </Routes>
  )
}
