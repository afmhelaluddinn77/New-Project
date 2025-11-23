import { createTheme } from "@mui/material/styles";

// Modern Healthcare UI Theme
export const nursesTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#10b981", // Emerald green for nursing
      light: "#34d399",
      dark: "#059669",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#8b5cf6", // Violet for accents
      light: "#a78bfa",
      dark: "#7c3aed",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444", // Red for critical alerts
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#f59e0b", // Amber for warnings
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
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#475569",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: {
      fontSize: "1.75rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: "1.5rem",
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: "1.25rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: "1rem",
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: "1rem",
      lineHeight: 1.6,
    },
    body2: {
      fontSize: "0.875rem",
      lineHeight: 1.5,
    },
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 16px",
          fontSize: "0.875rem",
          fontWeight: 500,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
          "&:hover": {
            boxShadow:
              "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            "&.Mui-focused fieldset": {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: "0.75rem",
        },
      },
    },
  },
});

// IT Portal Theme
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
