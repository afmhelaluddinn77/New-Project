import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PharmacyLoginPage from './components/PharmacyLoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import PharmacyDashboardLayout from './layouts/PharmacyDashboardLayout'
import PharmacyHomePage from './pages/dashboard/HomePage'
import QueuePage from './pages/queue/QueuePage'
import LogsPage from './pages/logs/LogsPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PharmacyLoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <PharmacyDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<PharmacyHomePage />} />
          <Route path="/queue" element={<QueuePage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

