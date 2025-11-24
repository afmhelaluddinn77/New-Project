import { CssBaseline, ThemeProvider } from "@mui/material";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import EnhancedPatientPortal from "./pages/EnhancedPatientPortal";
import PatientLoginPage from "./pages/LoginPage";
import { patientTheme } from "./styles/theme";

function App() {
  return (
    <ThemeProvider theme={patientTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PatientLoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <EnhancedPatientPortal />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
