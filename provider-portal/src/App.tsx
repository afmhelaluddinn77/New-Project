import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import React, { Suspense } from 'react'
import { useAuthStore } from './store/authStore'
import { LoadingState } from './components/shared/LoadingState'
import ProviderLoginPage from './components/ProviderLoginPage'
import ProtectedRoute from './components/ProtectedRoute'
import ProviderDashboardLayout from './layouts/ProviderDashboardLayout'
import DashboardHomePage from './pages/dashboard/HomePage'
import OrdersPage from './pages/orders/OrdersPage'
import ResultsPage from './pages/results/ResultsPage'
import PrescriptionPreviewPage from './pages/prescription/PrescriptionPreviewPage'
import EncounterEditorPage from './pages/encounter/EncounterEditorPage'
import LabResultDetailPage from './pages/LabResultDetailPage'

// SessionLoader checks existing refresh token & CSRF then sets auth state
const SessionLoader: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { setStatus, setUserAndToken, status } = useAuthStore()
  const [hasRun, setHasRun] = React.useState(false)

  React.useEffect(() => {
    // Only run ONCE on mount, never again
    if (hasRun) return

    const init = async () => {
      try {
        setHasRun(true)

        // Skip if already authenticated
        if (status === 'authenticated') return

        // Fetch CSRF token & attempt refresh via api client
        const { api } = await import('./lib/api')

        try {
          await api.get('/auth/csrf-token')
        } catch (csrfError: any) {
          // CSRF endpoint might fail due to routing issues, continue anyway
          console.warn('[SessionLoader] CSRF fetch failed, continuing...', csrfError.status)
        }

        const { data } = await api.post('/auth/refresh')
        setUserAndToken(data.user, data.accessToken)
      } catch (error: any) {
        console.warn('[SessionLoader] Session refresh failed:', error.message)
        setStatus('unauthenticated')
      }
    }
    init()
  }, []) // Empty deps = run ONCE on mount
  return children
}

function App() {
  return (
    <SessionLoader>
      <Router>
        <Suspense fallback={<LoadingState message="Loading…" />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<ProviderLoginPage />} />
        {/* Public demo route for prescription preview */}
        <Route path="/prescription/preview-demo" element={<PrescriptionPreviewPage />} />
        <Route path="/prescription/preview-demo/:prescriptionId" element={<PrescriptionPreviewPage />} />
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
          <Route path="/lab-results/:orderId" element={<LabResultDetailPage />} />
          <Route path="/prescription/preview" element={<PrescriptionPreviewPage />} />
          <Route path="/prescription/preview/:prescriptionId" element={<PrescriptionPreviewPage />} />
          <Route path="/encounter/editor" element={<EncounterEditorPage />} />
        </Route>
        </Routes>
        </Suspense>
      </Router>
    </SessionLoader>
  )
}

export default App


