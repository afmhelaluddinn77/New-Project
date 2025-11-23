import { CssBaseline, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import NursesLayout from "./layouts/NursesLayout";
import CareCoordination from "./pages/CareCoordination";
import LoginPage from "./pages/LoginPage";
import MedicationAdministration from "./pages/MedicationAdministration";
import NursesDashboard from "./pages/NursesDashboard";
import NursingAssessment from "./pages/NursingAssessment";
import PatientAssignment from "./pages/PatientAssignment";
import QualitySafety from "./pages/QualitySafety";
import SepsisDetection from "./pages/SepsisDetection";
import ShiftHandoff from "./pages/ShiftHandoff";
import VitalsDocumentation from "./pages/VitalsDocumentation";
import WoundCare from "./pages/WoundCare";
import { nursesTheme } from "./styles/theme";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={nursesTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<NursesLayout />}>
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                  <Route path="/dashboard" element={<NursesDashboard />} />
                  <Route
                    path="/medication-administration"
                    element={<MedicationAdministration />}
                  />
                  <Route
                    path="/patient-assignment"
                    element={<PatientAssignment />}
                  />
                  <Route path="/vitals" element={<VitalsDocumentation />} />
                  <Route path="/assessment" element={<NursingAssessment />} />
                  <Route path="/shift-handoff" element={<ShiftHandoff />} />
                  <Route path="/wound-care" element={<WoundCare />} />
                  <Route path="/quality-safety" element={<QualitySafety />} />
                  <Route
                    path="/care-coordination"
                    element={<CareCoordination />}
                  />
                  <Route path="/sepsis" element={<SepsisDetection />} />
                </Route>
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
