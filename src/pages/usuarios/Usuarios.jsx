import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import api from "../../services/api";

const formVacio = { nombre: "", usuario: "", password: "" };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");

  const cargarUsuarios = async () => {
    try {
      const res = await api.get("/auth/usuarios");
      setUsuarios(res.data);
    } catch {
      setError("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleAbrir = (usuario = null) => {
    setEditando(usuario);
    setForm(
      usuario
        ? {
            nombre: usuario.nombre,
            usuario: usuario.usuario,
            password: "",
            activo: usuario.activo,
          }
        : formVacio,
    );
    setError("");
    setDialogOpen(true);
  };

  const handleGuardar = async () => {
    try {
      if (editando) {
        await api.put(`/auth/usuarios/${editando.id}`, form);
      } else {
        await api.post("/auth/registro", form);
      }
      setDialogOpen(false);
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Usuarios</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAbrir()}
        >
          Nuevo usuario
        </Button>
      </Box>

      <Card elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "background.default" }}>
                <TableCell>
                  <Typography variant="subtitle1">Nombre</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Usuario</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Estado</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Fecha registro</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1">Acciones</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Cargando...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay usuarios registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 2,
                            background:
                              "linear-gradient(135deg, #4d8ef5, #7c3aed)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            color: "white",
                            flexShrink: 0,
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {u.nombre
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </Box>
                        <Typography
                          variant="body1"
                          fontWeight={600}
                          color="text.primary"
                        >
                          {u.nombre}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.75rem",
                        }}
                      >
                        {u.usuario}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={u.activo ? "Activo" : "Inactivo"}
                        color={u.activo ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(u.fecha_registro).toLocaleDateString("es-HN")}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton size="small" onClick={() => handleAbrir(u)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editando ? "Editar usuario" : "Nuevo usuario"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              fullWidth
              label="Nombre completo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            <TextField
              fullWidth
              label="Usuario"
              value={form.usuario}
              onChange={(e) => setForm({ ...form, usuario: e.target.value })}
            />
            <TextField
              fullWidth
              label={
                editando
                  ? "Nueva contraseña (dejar vacío para no cambiar)"
                  : "Contraseña"
              }
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {editando && (
              <TextField
                fullWidth
                select
                label="Estado"
                value={form.activo ? "true" : "false"}
                onChange={(e) =>
                  setForm({ ...form, activo: e.target.value === "true" })
                }
                slotProps={{ select: { native: true } }}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
