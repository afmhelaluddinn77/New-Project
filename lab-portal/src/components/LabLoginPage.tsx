import axios from "axios";
import { AlertCircle, FlaskConical, Lock, User } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuthToken } from "../services/httpClient";
import "./LabLoginPage.css";

// Helper function to read cookies
const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
};

function LabLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const authUrl = import.meta.env.VITE_AUTH_URL || "http://localhost:3001";

      // First, get CSRF token
      await axios.get(`${authUrl}/api/auth/csrf-token`, {
        withCredentials: true,
      });

      // Get CSRF token from cookie
      const csrfToken = getCookie("XSRF-TOKEN");

      // Then make login request with CSRF token
      const response = await axios.post(
        `${authUrl}/api/auth/login`,
        {
          email,
          password,
          portalType: "LAB",
        },
        {
          withCredentials: true,
          headers: csrfToken ? { "X-XSRF-TOKEN": csrfToken } : {},
        }
      );

      // Backend returns { accessToken, user, refreshToken }
      setAuthToken(response.data.accessToken);
      // Navigate to dashboard using React Router
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Side - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="branding-icon">
            <FlaskConical size={48} strokeWidth={2} />
          </div>
          <h1 className="branding-title">Lab Portal</h1>
          <p className="branding-subtitle">
            Laboratory information management and test result tracking system.
          </p>
          <div className="branding-features">
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Test Order Management</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Result Reporting</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Quality Control</span>
            </div>
            <div className="feature-item">
              <div className="feature-icon">✓</div>
              <span>Inventory Tracking</span>
            </div>
          </div>
        </div>
        <div className="branding-footer">
          <p>HIPAA Compliant • Secure • Available 24/7</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-form-section">
        <div className="login-form-container">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <User size={20} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="lab@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <div className="form-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Need help? <a href="#">Contact Support</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabLoginPage;
