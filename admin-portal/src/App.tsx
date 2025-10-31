import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import AdminLoginPage from './components/AdminLoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './components/DashboardPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<AdminLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage title="Admin Dashboard" />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

