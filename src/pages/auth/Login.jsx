import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ usuario: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async () => {
    if (!form.usuario || !form.password) {
      setError("Por favor completa todos los campos.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Credenciales incorrectas.");
        return;
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));
      if (data.debe_cambiar_password) {
        localStorage.setItem("debe_cambiar_password", "true");
        navigate("/cambiar-password");
      } else {
        navigate("/");
      }
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      py: 1.8,
      bgcolor: "#ffffff06",
      borderRadius: 2.5,
      color: "white",
      "& fieldset": { borderColor: "#ffffff12" },
      "&:hover fieldset": { borderColor: "#ffffff22" },
      "&.Mui-focused fieldset": { borderColor: "#e8a838" },
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
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 520,
          p: 5,
          mx: 2,
          bgcolor: "#13131a",
          border: "1px solid #ffffff0f",
          borderRadius: 4,
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "1.2rem",
              color: "white",
              letterSpacing: "-0.3px",
            }}
          >
            IT Assets
          </Typography>
          <Typography
            sx={{
              fontSize: "1.5rem",
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
            fontSize: "1.4rem",
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.3px",
            mb: 0.5,
          }}
        >
          Iniciar sesión
        </Typography>
        <Typography sx={{ fontSize: "1rem", color: "#ffffff6a", mb: 3.5 }}>
          Ingresa tus credenciales para continuar.
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
            label="Usuario"
            name="usuario"
            value={form.usuario}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            sx={inputSx}
          />
          <TextField
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            sx={inputSx}
          />
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleLogin}
            disabled={loading}
            sx={{
              mt: 0.5,
              bgcolor: "#e8a838",
              color: "#1a1a2e",
              fontWeight: 700,
              fontSize: "0.95rem",
              mb: 4,
              borderRadius: 2.5,
              py: 1.3,
              "&:hover": { bgcolor: "#f0c060" },
              "&:disabled": { bgcolor: "#ffffff10", color: "#ffffff6a" },
            }}
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
