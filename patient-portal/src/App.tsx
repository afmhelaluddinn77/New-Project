import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PatientLoginPage from './components/PatientLoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './components/DashboardPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PatientLoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage title="Patient Dashboard" />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

