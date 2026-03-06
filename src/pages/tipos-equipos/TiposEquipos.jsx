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
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "../../services/api";

const CAMPOS_DISPONIBLES = [
  { key: "mac", label: "MAC" },
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "serie", label: "Serie" },
  { key: "procesador", label: "Procesador" },
  { key: "ram", label: "RAM" },
  { key: "descripcion", label: "Descripción" },
];

const formVacio = { nombre: "", campos: [] };

export default function TiposEquipo() {
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [tipoAEliminar, setTipoAEliminar] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");

  const cargarTipos = async () => {
    try {
      const res = await api.get("/tipos-equipo");
      setTipos(res.data);
    } catch {
      setError("Error al cargar tipos de equipo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTipos();
  }, []);

  const handleAbrir = (tipo = null) => {
    setEditando(tipo);
    setForm(tipo ? { nombre: tipo.nombre, campos: tipo.campos } : formVacio);
    setError("");
    setDialogOpen(true);
  };

  const toggleCampo = (key) => {
    setForm((prev) => ({
      ...prev,
      campos: prev.campos.includes(key)
        ? prev.campos.filter((c) => c !== key)
        : [...prev.campos, key],
    }));
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      setError("El nombre es requerido");
      return;
    }
    if (form.campos.length === 0) {
      setError("Selecciona al menos un campo");
      return;
    }
    try {
      if (editando) {
        await api.put(`/tipos-equipo/${editando.id}`, form);
      } else {
        await api.post("/tipos-equipo", form);
      }
      setDialogOpen(false);
      cargarTipos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    }
  };

  const handleEliminar = async () => {
    try {
      await api.delete(`/tipos-equipo/${tipoAEliminar.id}`);
      setConfirmOpen(false);
      cargarTipos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al eliminar");
      setConfirmOpen(false);
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
        <Typography variant="h4">Tipos de equipos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAbrir()}
        >
          Nuevo tipo
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
                  <Typography variant="subtitle1">
                    Campos registrados
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle1">Acciones</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Cargando...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : tipos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay tipos registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tipos.map((tipo) => (
                  <TableRow key={tipo.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600}>
                        {tipo.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {tipo.campos.map((campo) => (
                          <Chip
                            key={campo}
                            label={
                              CAMPOS_DISPONIBLES.find((c) => c.key === campo)
                                ?.label || campo
                            }
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleAbrir(tipo)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Eliminar">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setTipoAEliminar(tipo);
                            setConfirmOpen(true);
                          }}
                        >
                          <DeleteIcon fontSize="small" />
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

      {/* Dialog nuevo/editar */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editando ? "Editar tipo" : "Nuevo tipo de equipo"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              fullWidth
              label="Nombre del tipo"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej: Laptop, Impresora, Dispositivo Móvil"
            />
            <Box>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                Selecciona los campos que aplican a este tipo de equipo
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {CAMPOS_DISPONIBLES.map((campo) => (
                  <Chip
                    key={campo.key}
                    label={campo.label}
                    onClick={() => toggleCampo(campo.key)}
                    color={
                      form.campos.includes(campo.key) ? "primary" : "default"
                    }
                    variant={
                      form.campos.includes(campo.key) ? "filled" : "outlined"
                    }
                    sx={{ cursor: "pointer" }}
                  />
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmar eliminación */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Eliminar tipo</DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            ¿Estás seguro de que quieres eliminar{" "}
            <strong>{tipoAEliminar?.nombre}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Solo se puede eliminar si no tiene equipos registrados.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleEliminar}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
