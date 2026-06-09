import { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import CambiarPassword from "./pages/auth/CambiarPassword";
import Equipos from "./pages/equipos/Equipos";
import Personas from "./pages/personas/Personas";
import Asignaciones from "./pages/asignaciones/Asignaciones";
import Usuarios from "./pages/usuarios/Usuarios";
import Compras from "./pages/compras/Compras";
import Dashboard from "./pages/dashboard/Dashboard";
import Reportes from "./pages/reportes/Reportes";
import Perfil from "./pages/perfil/Perfil";
import TiposEquipo from "./pages/tipos-equipos/TiposEquipos";
import Servidores from "./pages/servidores/Servidores";
import Insumos from "./pages/insumos/Insumos";
import Inventario from "./pages/inventario/Inventario";

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  localStorage.removeItem("debe_cambiar_password");
};

const getTokenPayload = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    // JWT usa base64url: reemplazar - y _ antes de decodificar
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const isAuthenticated = () => {
  const payload = getTokenPayload();
  if (!payload) {
    clearSession();
    return false;
  }
  if (payload.exp && Date.now() / 1000 > payload.exp) {
    clearSession();
    return false;
  }
  return true;
};

function PrivateRoute({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const payload = getTokenPayload();
    if (!payload?.exp) return;

    const msUntilExpiry = payload.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      clearSession();
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => {
      clearSession();
      navigate("/login");
    }, msUntilExpiry);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (!isAuthenticated()) return <Navigate to="/login" />;
  if (localStorage.getItem("debe_cambiar_password") === "true") {
    return <Navigate to="/cambiar-password" />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/cambiar-password" element={<CambiarPassword />} />
      </Route>

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/personas" element={<Personas />} />
        <Route path="/asignaciones" element={<Asignaciones />} />
        <Route path="/usuarios" element={<Usuarios />} />
        <Route path="/reportes" element={<Reportes />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/compras" element={<Compras />} />
        <Route path="/tipos-equipos" element={<TiposEquipo />} />
        <Route path="/servidores" element={<Servidores />} />
        <Route path="/insumos" element={<Insumos />} />
        <Route path="/inventario" element={<Inventario />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
