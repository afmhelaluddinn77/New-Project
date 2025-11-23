import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import PatientDashboardClarity from "./components/PatientDashboardClarity";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientLoginPage from "./pages/LoginPage";

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
              <PatientDashboardClarity />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
