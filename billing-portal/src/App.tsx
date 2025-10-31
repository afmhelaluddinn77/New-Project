import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import BillingLoginPage from './components/BillingLoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './components/DashboardPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<BillingLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage title="Billing Dashboard" />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

