import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import CambiarPassword from "./pages/auth/CambiarPassword";
import Equipos from "./pages/equipos/Equipos";
import Personas from "./pages/personas/Personas";
import Asignaciones from "./pages/asignaciones/Asignaciones";
import Usuarios from "./pages/usuarios/Usuarios";
import Compras from "./pages/insumos/compras";
import Dashboard from "./pages/dashboard/Dashboard";
import Reportes from "./pages/reportes/Reportes";
import Perfil from "./pages/perfil/Perfil";
import TiposEquipo from "./pages/tipos-equipos/TiposEquipos";

const isAuthenticated = () => !!localStorage.getItem("token");

function PrivateRoute({ children }) {
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
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
