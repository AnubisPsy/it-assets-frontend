import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 420,
          px: 2,
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" fontWeight={700} color="primary">
            IT Assets
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            MADEYSO · Departamento de IT
          </Typography>
        </Box>
        <Outlet />
      </Box>
    </Box>
  );
}
