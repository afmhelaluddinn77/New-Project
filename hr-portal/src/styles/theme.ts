import { createTheme } from "@mui/material/styles";

export const hrTheme = createTheme({
  palette: {
    primary: {
      main: "#764ba2",
      light: "#a67fc5",
      dark: "#4e2172",
    },
    secondary: {
      main: "#667eea",
      light: "#99a9ff",
      dark: "#3356b8",
    },
    background: {
      default: "#f7fafc",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});
