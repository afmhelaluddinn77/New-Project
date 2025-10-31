import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProviderLoginPage from './components/ProviderLoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import ProviderDashboardLayout from './layouts/ProviderDashboardLayout'
import DashboardHomePage from './pages/dashboard/HomePage'
import OrdersPage from './pages/orders/OrdersPage'
import ResultsPage from './pages/results/ResultsPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<ProviderLoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <ProviderDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardHomePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

