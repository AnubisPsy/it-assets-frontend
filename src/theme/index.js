import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1a1a2e",
      light: "#2d2d4e",
      dark: "#0f0f1e",
      contrastText: "#fff",
    },
    secondary: {
      main: "#e8a838",
      light: "#f0c060",
      dark: "#c48820",
      contrastText: "#fff",
    },
    info: {
      main: "#4d8ef5",
      light: "#7aabf7",
      dark: "#2563eb",
      contrastText: "#fff",
    },
    success: {
      main: "#22c55e",
      light: "#4ade80",
      dark: "#16a34a",
      contrastText: "#fff",
    },
    warning: {
      main: "#e8a838",
      light: "#f0c060",
      dark: "#c48820",
      contrastText: "#fff",
    },
    error: {
      main: "#f87171",
      light: "#fca5a5",
      dark: "#dc2626",
      contrastText: "#fff",
    },
    background: {
      default: "#f7f5f2",
      paper: "#ffffff",
    },
    text: {
      primary: "#1a1a2e",
      secondary: "#9ca3af",
    },
    divider: "#edeae5",
  },
  typography: {
    fontFamily: `'DM Sans', sans-serif`,
    h1: {
      fontFamily: `'Outfit', sans-serif`,
      fontWeight: 700,
      fontSize: "2rem",
    },
    h2: {
      fontFamily: `'Outfit', sans-serif`,
      fontWeight: 700,
      fontSize: "1.75rem",
    },
    h3: {
      fontFamily: `'Outfit', sans-serif`,
      fontWeight: 700,
      fontSize: "1.5rem",
    },
    h4: {
      fontFamily: `'Outfit', sans-serif`,
      fontWeight: 600,
      fontSize: "1.25rem",
    },
    h5: {
      fontFamily: `'Outfit', sans-serif`,
      fontWeight: 600,
      fontSize: "1rem",
    },
    h6: {
      fontFamily: `'Outfit', sans-serif`,
      fontWeight: 600,
      fontSize: "0.875rem",
    },
    subtitle1: { fontWeight: 500, fontSize: "0.875rem" },
    body1: { fontSize: "0.875rem" },
    body2: { fontSize: "0.75rem" },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    "none",
    "0px 1px 4px rgba(0,0,0,0.06)",
    "0px 2px 8px rgba(0,0,0,0.08)",
    "0px 4px 16px rgba(0,0,0,0.10)",
    ...Array(21).fill("none"),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
          fontSize: "0.8125rem",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: "0.7rem" },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: "#f2efe9" },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0px 1px 4px rgba(0,0,0,0.06)",
          border: "1px solid #edeae5",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 16 },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
  },
});

export default theme;
