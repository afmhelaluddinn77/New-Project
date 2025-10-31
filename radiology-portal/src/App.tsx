import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import RadiologyLoginPage from './components/RadiologyLoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import RadiologyDashboardLayout from './layouts/RadiologyDashboardLayout'
import RadiologyHomePage from './pages/dashboard/HomePage'
import RadiologyQueuePage from './pages/queue/QueuePage'
import ReportsPage from './pages/reports/ReportsPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<RadiologyLoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <RadiologyDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<RadiologyHomePage />} />
          <Route path="/queue" element={<RadiologyQueuePage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

