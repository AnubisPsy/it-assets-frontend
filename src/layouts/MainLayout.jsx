import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LaptopIcon from "@mui/icons-material/Laptop";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import SummarizeIcon from "@mui/icons-material/Summarize";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import Avatar from "@mui/material/Avatar";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DevicesIcon from "@mui/icons-material/Devices";

const BASE_URL = "http://localhost:3000";

const DRAWER_WIDTH = 240;

const menuItems = [
  {
    section: "General",
    items: [
      {
        label: "Dashboard",
        icon: <DashboardIcon fontSize="small" />,
        path: "/",
      },
      {
        label: "Equipos",
        icon: <LaptopIcon fontSize="small" />,
        path: "/equipos",
      },
      {
        label: "Personas",
        icon: <PeopleIcon fontSize="small" />,
        path: "/personas",
      },
    ],
  },
  {
    section: "Gestión",
    items: [
      {
        label: "Asignaciones",
        icon: <AssignmentIcon fontSize="small" />,
        path: "/asignaciones",
      },
      {
        label: "Reportes",
        icon: <SummarizeIcon fontSize="small" />,
        path: "/reportes",
      },
            {
        label: "Compras",
        icon: <ReceiptLongIcon fontSize="small" />,
        path: "/compras",
      },
    ],
  },
  {
    section: "Sistema",
    items: [
      {
        label: "Tipos de equipos",
        icon: <DevicesIcon fontSize="small" />,
        path: "/tipos-equipos",
      },
      {
        label: "Usuarios",
        icon: <ManageAccountsIcon fontSize="small" />,
        path: "/usuarios",
      },
      {
        label: "Mi perfil",
        icon: <AccountCircleIcon fontSize="small" />,
        path: "/perfil",
      },
    ],
  },
];

export default function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    localStorage.removeItem("debe_cambiar_password");
    window.location.href = "/login";
  };

  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const iniciales = usuario.nombre
    ? usuario.nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#1a1a2e",
        color: "white",
      }}
    >
      {/* Logo */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 3,
          py: 3,
          borderBottom: "1px solid #ffffff0f",
        }}
      >
        <img src="/it-assets.svg" alt="IT Assets" style={{ height: 50 }} />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "1.1rem",
              color: "white",
              letterSpacing: "-0.3px",
              lineHeight: 1,
            }}
          >
            IT Assets
          </Typography>
          <Typography
            sx={{
              fontSize: "0.65rem",
              color: "#e8a838",
              letterSpacing: "2px",
              textTransform: "uppercase",
              mt: 0.3,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Madeyso
          </Typography>
        </Box>
      </Box>

      {/* Nav */}
      <Box sx={{ flex: 1, py: 2, overflowY: "auto" }}>
        {menuItems.map((group) => (
          <Box key={group.section} sx={{ mb: 1 }}>
            <Typography
              sx={{
                fontSize: "0.6rem",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#ffffff6a",
                px: 3,
                py: 1,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {group.section}
            </Typography>
            <List disablePadding sx={{ px: 1.5 }}>
              {group.items.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    sx={{
                      borderRadius: 2.5,
                      mb: 0.25,
                      py: 1,
                      px: 1.5,
                      position: "relative",
                      color: active ? "white" : "#ffffff6a",
                      bgcolor: active ? "#ffffff12" : "transparent",
                      "&:hover": {
                        bgcolor: "#ffffff08",
                        color: "#ffffff70",
                      },
                      "&::before": active
                        ? {
                            content: '""',
                            position: "absolute",
                            left: -12,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: 3,
                            height: 18,
                            bgcolor: "#e8a838",
                            borderRadius: "0 3px 3px 0",
                          }
                        : {},
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 32,
                        color: active ? "#e8a838" : "#ffffff6a",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      slotProps={{
                        primary: {
                          fontSize: "0.8125rem",
                          fontWeight: active ? 600 : 400,
                          fontFamily: "'DM Sans', sans-serif",
                        },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 2.5, py: 2.5, borderTop: "1px solid #ffffff0f" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={
              usuario.foto_perfil
                ? `${BASE_URL}/uploads/fotos/${usuario.foto_perfil}`
                : undefined
            }
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2.5,
              background: "linear-gradient(135deg, #4d8ef5, #7c3aed)",
              fontSize: "0.75rem",
              fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {!usuario.foto_perfil && iniciales}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#ffffffcc",
                lineHeight: 1.2,
              }}
            >
              {usuario.usuario || "—"}
            </Typography>
            <Typography sx={{ fontSize: "0.65rem", color: "#ffffff6a" }}>
              Administrador
            </Typography>
          </Box>
          <Tooltip title="Cerrar sesión">
            <IconButton
              size="small"
              onClick={handleLogout}
              sx={{ color: "#ffffff6a", "&:hover": { color: "#ffffff70" } }}
            >
              <LogoutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      {/* Mobile toggle */}
      <IconButton
        onClick={() => setMobileOpen(true)}
        sx={{
          display: { md: "none" },
          position: "fixed",
          top: 16,
          left: 16,
          zIndex: 1200,
          bgcolor: "#1a1a2e",
          color: "white",
          "&:hover": { bgcolor: "#2d2d4e" },
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Drawer mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, border: "none" },
        }}
      >
        {drawer}
      </Drawer>

      {/* Drawer desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            border: "none",
            boxSizing: "border-box",
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Contenido */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          minHeight: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
