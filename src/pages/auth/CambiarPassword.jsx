import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import MainCard from "../../components/MainCard";
import api from "../../services/api";

export default function CambiarPassword() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: "", confirmar: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGuardar = async () => {
    if (!form.password || !form.confirmar) {
      setError("Completa todos los campos.");
      return;
    }
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirmar) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      await api.put(`/auth/usuarios/${usuario.id}/password`, {
        password: form.password,
      });
      localStorage.removeItem("debe_cambiar_password");
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Error al cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainCard>
      <Box sx={{ p: 1 }}>
        <Typography variant="h4" fontWeight={700} mb={0.5}>
          Cambiar contraseña
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Es tu primer inicio de sesión. Por favor establece una contraseña
          nueva.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Nueva contraseña"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Confirmar contraseña"
          type="password"
          value={form.confirmar}
          onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
          sx={{ mb: 3 }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleGuardar}
          disabled={loading}
        >
          {loading ? "Guardando..." : "Guardar contraseña"}
        </Button>
      </Box>
    </MainCard>
  );
}
