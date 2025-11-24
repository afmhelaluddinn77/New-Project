import { createTheme } from "@mui/material/styles";

// Patient Portal Theme - teal/blue, related to Nurses emerald/violet
export const patientTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e", // teal
      light: "#14b8a6",
      dark: "#115e59",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#3b82f6", // blue accents
      light: "#60a5fa",
      dark: "#2563eb",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ef4444",
      light: "#f87171",
      dark: "#dc2626",
    },
    warning: {
      main: "#f59e0b",
      light: "#fbbf24",
      dark: "#d97706",
    },
    success: {
      main: "#22c55e",
      light: "#4ade80",
      dark: "#16a34a",
    },
    info: {
      main: "#0ea5e9",
      light: "#38bdf8",
      dark: "#0284c7",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      // slightly darker secondary for better contrast on light backgrounds
      secondary: "#334155",
    },
    divider: "#e2e8f0",
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: "2.7rem",
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2.2rem",
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h3: { fontSize: "1.9rem", fontWeight: 600, lineHeight: 1.35 },
    h4: { fontSize: "1.6rem", fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: "1.35rem", fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.5 },
    // slightly larger body text for readability
    body1: { fontSize: "1.05rem", lineHeight: 1.7 },
    body2: { fontSize: "0.95rem", lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 500, fontSize: "0.98rem" },
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
          fontSize: "0.95rem",
          fontWeight: 500,
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 6px -1px rgb(15 118 110 / 0.25)",
          },
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
          "&:hover": {
            background: "linear-gradient(135deg, #0f766e 0%, #115e59 100%)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow:
            "0 1px 3px 0 rgb(15 23 42 / 0.08), 0 1px 2px -1px rgb(15 23 42 / 0.06)",
          "&:hover": {
            boxShadow:
              "0 10px 15px -3px rgb(15 23 42 / 0.12), 0 4px 6px -4px rgb(15 23 42 / 0.08)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 1px 3px 0 rgb(15 23 42 / 0.06)",
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
  },
});
