import { createTheme } from "@mui/material/styles";

// IT Portal Theme (mirrors itTheme from nurses-portal, scoped locally)
export const itTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6366f1", // Indigo for tech
      light: "#818cf8",
      dark: "#4f46e5",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#06b6d4", // Cyan for data
      light: "#22d3ee",
      dark: "#0891b2",
      contrastText: "#ffffff",
    },
    error: {
      main: "#f43f5e",
      light: "#fb7185",
      dark: "#e11d48",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    success: {
      main: "#10b981",
      light: "#34d399",
      dark: "#059669",
    },
    info: {
      main: "#3b82f6",
      light: "#60a5fa",
      dark: "#2563eb",
    },
    background: {
      default: "#0f172a",
      paper: "#1e293b",
    },
    text: {
      primary: "#f1f5f9",
      secondary: "#94a3b8",
    },
    divider: "#334155",
  },
  typography: {
    fontFamily: '"JetBrains Mono", "Fira Code", "Roboto Mono", monospace',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      letterSpacing: "-0.02em",
    },
    body1: {
      fontSize: "0.875rem",
      fontFamily: '"Inter", sans-serif',
    },
    body2: {
      fontSize: "0.75rem",
      fontFamily: '"Inter", sans-serif',
    },
    button: {
      textTransform: "uppercase",
      fontWeight: 600,
      letterSpacing: "0.05em",
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          border: "1px solid #334155",
        },
      },
    },
  },
});
