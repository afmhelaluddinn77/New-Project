import { LockOutlined } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HRLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email,
          password,
          portalType: "ADMIN",
        }
      );

      if (response.data.accessToken || response.data.access_token) {
        const token = response.data.accessToken || response.data.access_token;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(255, 255, 255, 0.95)",
            borderRadius: 3,
          }}
        >
          <Avatar
            sx={{
              m: 1,
              bgcolor: "#764ba2",
              width: 56,
              height: 56,
            }}
          >
            <LockOutlined fontSize="large" />
          </Avatar>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 600, color: "#2D3748" }}
          >
            HR Portal
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 3, color: "#718096" }}>
            Human Resources Management
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!error}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#764ba2",
                  },
                },
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!error}
              helperText={error}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": {
                    borderColor: "#764ba2",
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                bgcolor: "#764ba2",
                "&:hover": {
                  bgcolor: "#667eea",
                },
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Box>
          <Typography
            variant="body2"
            sx={{ mt: 2, color: "#718096", textAlign: "center" }}
          >
            Secure access for HR professionals
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
