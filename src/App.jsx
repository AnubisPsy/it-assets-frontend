import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import Login from "./pages/auth/Login";
import Equipos from "./pages/equipos/Equipos";
import Personas from "./pages/personas/Personas";
import Asignaciones from './pages/asignaciones/Asignaciones';

const isAuthenticated = () => !!localStorage.getItem("token");

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
      </Route>

      <Route
        element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<div>Dashboard</div>} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/personas" element={<Personas />} />
        <Route path="/asignaciones" element={<Asignaciones />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
