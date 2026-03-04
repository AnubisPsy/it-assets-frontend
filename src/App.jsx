import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import CambiarPassword from "./pages/auth/CambiarPassword";
import Equipos from "./pages/equipos/Equipos";
import Personas from "./pages/personas/Personas";
import Asignaciones from "./pages/asignaciones/Asignaciones";
import Usuarios from "./pages/usuarios/Usuarios";
import Dashboard from "./pages/dashboard/Dashboard";
import Reportes from "./pages/reportes/Reportes";

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
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
