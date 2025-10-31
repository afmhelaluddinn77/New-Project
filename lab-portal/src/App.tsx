import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LabLoginPage from './components/LabLoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import LabDashboardLayout from './layouts/LabDashboardLayout'
import LabHomePage from './pages/dashboard/HomePage'
import WorklistPage from './pages/worklist/WorklistPage'
import HistoryPage from './pages/history/HistoryPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LabLoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <LabDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<LabHomePage />} />
          <Route path="/worklist" element={<WorklistPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

