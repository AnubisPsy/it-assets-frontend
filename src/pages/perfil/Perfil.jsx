import { useState, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../services/api";

const BASE_URL = "http://localhost:3000";

export default function Perfil() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
  const [foto, setFoto] = useState(usuario.foto_perfil || null);
  const [form, setForm] = useState({ password: "", confirmar: "" });
  const [error, setError] = useState("");
  const [errorPass, setErrorPass] = useState("");
  const [successPass, setSuccessPass] = useState("");
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  const inputRef = useRef();

  const iniciales = usuario.nombre
    ? usuario.nombre
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "??";

  const handleSubirFoto = async (archivo) => {
    try {
      setLoadingFoto(true);
      setError("");
      const formData = new FormData();
      formData.append("foto", archivo);
      const res = await api.post(
        `/auth/usuarios/${usuario.id}/foto`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      const nuevaFoto = res.data.foto_perfil;
      setFoto(nuevaFoto);

      // Actualizar localStorage
      const usuarioActualizado = { ...usuario, foto_perfil: nuevaFoto };
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
    } catch {
      setError("Error al subir la foto.");
    } finally {
      setLoadingFoto(false);
    }
  };

  const handleEliminarFoto = async () => {
    try {
      setLoadingFoto(true);
      setError("");
      await api.delete(`/auth/usuarios/${usuario.id}/foto`);
      setFoto(null);
      const usuarioActualizado = { ...usuario, foto_perfil: null };
      localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
    } catch {
      setError("Error al eliminar la foto.");
    } finally {
      setLoadingFoto(false);
    }
  };

  const handleCambiarPassword = async () => {
    setErrorPass("");
    setSuccessPass("");
    if (!form.password || !form.confirmar) {
      setErrorPass("Completa todos los campos.");
      return;
    }
    if (form.password.length < 6) {
      setErrorPass("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (form.password !== form.confirmar) {
      setErrorPass("Las contraseñas no coinciden.");
      return;
    }
    setLoadingPass(true);
    try {
      await api.put(`/auth/usuarios/${usuario.id}/password`, {
        password: form.password,
      });
      setForm({ password: "", confirmar: "" });
      setSuccessPass("Contraseña actualizada correctamente.");
    } catch (err) {
      setErrorPass(
        err.response?.data?.error || "Error al cambiar la contraseña.",
      );
    } finally {
      setLoadingPass(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Mi perfil
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
        }}
      >
        {/* Foto de perfil */}
        <Card
          elevation={0}
          sx={{ width: { xs: "100%", md: 300 }, flexShrink: 0 }}
        >
          <CardContent
            sx={{
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={foto ? `${BASE_URL}/uploads/fotos/${foto}` : undefined}
                sx={{
                  width: 110,
                  height: 110,
                  fontSize: "2rem",
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #4d8ef5, #7c3aed)",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {!foto && iniciales}
              </Avatar>
              <Tooltip title="Cambiar foto">
                <IconButton
                  size="small"
                  onClick={() => inputRef.current.click()}
                  disabled={loadingFoto}
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    bgcolor: "#1a1a2e",
                    color: "white",
                    width: 32,
                    height: 32,
                    "&:hover": { bgcolor: "#2d2d4e" },
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  if (e.target.files[0]) handleSubirFoto(e.target.files[0]);
                }}
              />
            </Box>

            <Box sx={{ textAlign: "center" }}>
              <Typography fontWeight={600} color="text.primary">
                {usuario.nombre}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "0.75rem",
                }}
              >
                {usuario.usuario}
              </Typography>
            </Box>

            {error && (
              <Alert
                severity="error"
                sx={{ width: "100%" }}
                onClose={() => setError("")}
              >
                {error}
              </Alert>
            )}

            <Divider sx={{ width: "100%" }} />

            <Button
              fullWidth
              variant="outlined"
              size="small"
              startIcon={<PhotoCameraIcon />}
              onClick={() => inputRef.current.click()}
              disabled={loadingFoto}
            >
              {loadingFoto ? "Subiendo..." : "Cambiar foto"}
            </Button>

            {foto && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleEliminarFoto}
                disabled={loadingFoto}
              >
                Eliminar foto
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Cambiar contraseña */}
        <Card elevation={0} sx={{ flex: 1 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" mb={0.5}>
              Cambiar contraseña
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Deja los campos vacíos si no deseas cambiar tu contraseña.
            </Typography>

            {errorPass && (
              <Alert
                severity="error"
                sx={{ mb: 2 }}
                onClose={() => setErrorPass("")}
              >
                {errorPass}
              </Alert>
            )}
            {successPass && (
              <Alert
                severity="success"
                sx={{ mb: 2 }}
                onClose={() => setSuccessPass("")}
              >
                {successPass}
              </Alert>
            )}

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                maxWidth: 400,
              }}
            >
              <TextField
                fullWidth
                label="Nueva contraseña"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <TextField
                fullWidth
                label="Confirmar contraseña"
                type="password"
                value={form.confirmar}
                onChange={(e) =>
                  setForm({ ...form, confirmar: e.target.value })
                }
              />
              <Button
                variant="contained"
                onClick={handleCambiarPassword}
                disabled={loadingPass}
                sx={{ alignSelf: "flex-start" }}
              >
                {loadingPass ? "Guardando..." : "Guardar contraseña"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
