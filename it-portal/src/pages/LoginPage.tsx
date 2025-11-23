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
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ITLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
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
          background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
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
              bgcolor: "#3B82F6",
              width: 56,
              height: 56,
            }}
          >
            <LockOutlined fontSize="large" />
          </Avatar>
          <Typography
            component="h1"
            variant="h4"
            sx={{ fontWeight: 600, color: "#1E293B" }}
          >
            IT Portal
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 3, color: "#64748B" }}>
            System Administration & Support
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
                "& .MuiInputBase-input": {
                  color: "#1E293B",
                },
                "& .MuiInputLabel-root": {
                  color: "#64748B",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#CBD5E1",
                  },
                  "&:hover fieldset": {
                    borderColor: "#3B82F6",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3B82F6",
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
                "& .MuiInputBase-input": {
                  color: "#1E293B",
                },
                "& .MuiInputLabel-root": {
                  color: "#64748B",
                },
                "& .MuiFormHelperText-root": {
                  color: error ? "#EF4444" : "#64748B",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#CBD5E1",
                  },
                  "&:hover fieldset": {
                    borderColor: "#3B82F6",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3B82F6",
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
                bgcolor: "#3B82F6",
                "&:hover": {
                  bgcolor: "#2563EB",
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
            sx={{ mt: 2, color: "#64748B", textAlign: "center" }}
          >
            Secure access for IT administrators
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
