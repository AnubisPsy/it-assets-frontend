import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1890ff",
      light: "#69c0ff",
      dark: "#096dd9",
      contrastText: "#fff",
    },
    secondary: {
      main: "#f0f0f0",
      dark: "#d9d9d9",
      contrastText: "#000",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
    text: {
      primary: "#262626",
      secondary: "#8c8c8c",
    },
  },
  typography: {
    fontFamily: `'Inter', sans-serif`,
    h1: { fontWeight: 700, fontSize: "2rem" },
    h2: { fontWeight: 700, fontSize: "1.75rem" },
    h3: { fontWeight: 700, fontSize: "1.5rem" },
    h4: { fontWeight: 600, fontSize: "1.25rem" },
    h5: { fontWeight: 600, fontSize: "1rem" },
    h6: { fontWeight: 400, fontSize: "0.875rem" },
    subtitle1: { fontWeight: 500, fontSize: "0.875rem" },
    body1: { fontSize: "0.875rem" },
    body2: { fontSize: "0.75rem" },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    "none",
    "0px 1px 4px rgba(0,0,0,0.08)",
    "0px 2px 8px rgba(0,0,0,0.10)",
    "0px 4px 16px rgba(0,0,0,0.12)",
    ...Array(21).fill("none"),
  ],
});

export default theme;
