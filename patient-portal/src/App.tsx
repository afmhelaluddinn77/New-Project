import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PatientLoginPageClarity from './components/PatientLoginPageClarity'
import ProtectedRoute from './components/ProtectedRoute'
import PatientDashboardClarity from './components/PatientDashboardClarity'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PatientLoginPageClarity />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PatientDashboardClarity />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App

