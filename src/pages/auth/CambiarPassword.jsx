import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
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

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      bgcolor: "#ffffff06",
      borderRadius: 2.5,
      color: "white",
      "& fieldset": { borderColor: "#ffffff12" },
      "&:hover fieldset": { borderColor: "#ffffff22" },
      "&.Mui-focused fieldset": { borderColor: "#e8a838" },
      "& .MuiOutlinedInput-input": { py: 1.8 },
    },
    "& .MuiInputLabel-root": { color: "#ffffff35" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#e8a838" },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#1a1a2e",
        px: 3,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          bgcolor: "#13131a",
          border: "1px solid #ffffff0f",
          borderRadius: 4,
          p: 5,
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "1.5rem",
              color: "white",
              letterSpacing: "-0.3px",
            }}
          >
            IT Assets
          </Typography>
          <Typography
            sx={{
              fontSize: "0.65rem",
              color: "#e8a838",
              letterSpacing: "2.5px",
              textTransform: "uppercase",
              mt: 0.3,
            }}
          >
            Madeyso
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: "1.7rem",
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.3px",
            mb: 0.5,
          }}
        >
          Cambia tu contraseña
        </Typography>
        <Typography sx={{ fontSize: "0.95rem", color: "#ffffff35", mb: 4 }}>
          Es tu primer inicio de sesión. Establece una contraseña nueva para
          continuar.
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              bgcolor: "#2a1010",
              color: "#f87171",
              border: "1px solid #f8717130",
              "& .MuiAlert-icon": { color: "#f87171" },
            }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth
            label="Nueva contraseña"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            sx={inputSx}
          />
          <TextField
            fullWidth
            label="Confirmar contraseña"
            type="password"
            value={form.confirmar}
            onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
            sx={inputSx}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleGuardar}
            disabled={loading}
            sx={{
              mt: 0.5,
              bgcolor: "#e8a838",
              color: "#1a1a2e",
              fontWeight: 700,
              fontSize: "1rem",
              borderRadius: 2.5,
              py: 1.6,
              "&:hover": { bgcolor: "#f0c060" },
              "&:disabled": { bgcolor: "#ffffff10", color: "#ffffff6a" },
            }}
          >
            {loading ? "Guardando..." : "Guardar contraseña"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
