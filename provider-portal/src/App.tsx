import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import React, { Suspense } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import ProviderLoginPage from "./components/ProviderLoginPage";
import { LoadingState } from "./components/shared/LoadingState";
import ProviderDashboardLayout from "./layouts/ProviderDashboardLayout";
import { queryClient } from "./lib/queryClient";
import DashboardHomePage from "./pages/dashboard/HomePage";
import EncounterEditorPage from "./pages/encounter/EncounterEditorPage";
import OrdersPage from "./pages/orders/OrdersPage";
import PrescriptionPreviewPage from "./pages/prescription/PrescriptionPreviewPage";
import ResultsPage from "./pages/results/ResultsPage";
import { useAuthStore } from "./store/authStore";

// SessionLoader checks existing refresh token & CSRF then sets auth state
const SessionLoader: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { setStatus, setUserAndToken } = useAuthStore();
  React.useEffect(() => {
    const init = async () => {
      try {
        // Fetch CSRF token & attempt refresh via new api client
        const { api } = await import("./lib/api");
        await api.get("/auth/csrf-token");
        const { data } = await api.post("/auth/refresh");
        setUserAndToken(data.user, data.accessToken);
      } catch {
        setStatus("unauthenticated");
      }
    };
    init();
  }, [setStatus, setUserAndToken]);
  return children;
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SessionLoader>
          <Router>
            <Suspense fallback={<LoadingState message="Loading…" />}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/login" element={<ProviderLoginPage />} />
                {/* Public demo route for prescription preview */}
                <Route
                  path="/prescription/preview-demo"
                  element={<PrescriptionPreviewPage />}
                />
                <Route
                  path="/prescription/preview-demo/:prescriptionId"
                  element={<PrescriptionPreviewPage />}
                />
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
                  <Route
                    path="/prescription/preview"
                    element={<PrescriptionPreviewPage />}
                  />
                  <Route
                    path="/prescription/preview/:prescriptionId"
                    element={<PrescriptionPreviewPage />}
                  />
                  <Route
                    path="/encounter/editor"
                    element={<EncounterEditorPage />}
                  />
                </Route>
              </Routes>
            </Suspense>
          </Router>
        </SessionLoader>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
