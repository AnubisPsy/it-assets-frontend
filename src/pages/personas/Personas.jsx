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
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import LaptopIcon from "@mui/icons-material/Laptop";
import api from "../../services/api";

const formVacio = { nombre: "", numero_identidad: "", departamento_id: "" };

export default function Personas() {
  const [personas, setPersonas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");
  const [historialOpen, setHistorialOpen] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [personaActual, setPersonaActual] = useState(null);
  const [nuevoDpto, setNuevoDpto] = useState(false);
  const [nombreDpto, setNombreDpto] = useState("");
  const [errorDpto, setErrorDpto] = useState("");

  const cargarPersonas = async () => {
    try {
      const res = await api.get("/personas");
      setPersonas(res.data);
    } catch {
      setError("Error al cargar personas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPersonas();
    api
      .get("/personas/departamentos")
      .then((res) => setDepartamentos(res.data));
  }, []);

  const handleAbrir = (persona = null) => {
    setEditando(persona);
    setForm(
      persona
        ? {
            nombre: persona.nombre,
            numero_identidad: persona.numero_identidad,
            departamento_id: persona.departamento_id,
            activo: persona.activo,
          }
        : formVacio,
    );
    setError("");
    setDialogOpen(true);
  };

  const handleGuardar = async () => {
    try {
      if (editando) {
        await api.put(`/personas/${editando.id}`, form);
      } else {
        await api.post("/personas", form);
      }
      setDialogOpen(false);
      cargarPersonas();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    }
  };

  const verHistorial = async (persona) => {
    try {
      const res = await api.get(
        `/asignaciones/historial/persona/${persona.id}`,
      );
      setHistorial(res.data);
      setPersonaActual(persona);
      setHistorialOpen(true);
    } catch {
      setError("Error al cargar el historial");
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
        <Typography variant="h4">Personas</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAbrir()}
        >
          Nueva persona
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
                  <Typography variant="subtitle1">Identidad</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Departamento</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Estado</Typography>
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
              ) : personas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay personas registradas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                personas.map((persona) => (
                  <TableRow key={persona.id} hover>
                    <TableCell>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        color="text.primary"
                      >
                        {persona.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.75rem",
                        }}
                      >
                        {persona.numero_identidad}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {persona.departamento}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={persona.activo ? "Activo" : "Inactivo"}
                        color={persona.activo ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleAbrir(persona)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Ver equipos">
                        <IconButton
                          size="small"
                          onClick={() => verHistorial(persona)}
                        >
                          <LaptopIcon fontSize="small" />
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
          {editando ? "Editar persona" : "Nueva persona"}
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
              label="Número de identidad"
              value={form.numero_identidad}
              onChange={(e) =>
                setForm({ ...form, numero_identidad: e.target.value })
              }
            />
            {!nuevoDpto ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  select
                  fullWidth
                  label="Departamento"
                  value={form.departamento_id}
                  onChange={(e) =>
                    setForm({ ...form, departamento_id: e.target.value })
                  }
                >
                  {departamentos.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.nombre}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setNuevoDpto(true);
                    setNombreDpto("");
                    setErrorDpto("");
                  }}
                  sx={{ whiteSpace: "nowrap", minWidth: "auto", px: 1.5 }}
                >
                  Nuevo
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {errorDpto && <Alert severity="error">{errorDpto}</Alert>}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Nombre del departamento"
                    value={nombreDpto}
                    onChange={(e) => setNombreDpto(e.target.value)}
                  />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={async () => {
                      if (!nombreDpto) {
                        setErrorDpto("El nombre es requerido");
                        return;
                      }
                      try {
                        const res = await api.post("/personas/departamentos", {
                          nombre: nombreDpto,
                        });
                        const nuevos = [...departamentos, res.data];
                        setDepartamentos(nuevos);
                        setForm({ ...form, departamento_id: res.data.id });
                        setNuevoDpto(false);
                      } catch (err) {
                        setErrorDpto(
                          err.response?.data?.error ||
                            "Error al crear departamento",
                        );
                      }
                    }}
                    sx={{ whiteSpace: "nowrap", minWidth: "auto", px: 1.5 }}
                  >
                    Guardar
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setNuevoDpto(false)}
                    sx={{ whiteSpace: "nowrap", minWidth: "auto", px: 1.5 }}
                  >
                    Cancelar
                  </Button>
                </Box>
              </Box>
            )}
            {editando && (
              <TextField
                fullWidth
                select
                label="Estado"
                value={form.activo ? "true" : "false"}
                onChange={(e) =>
                  setForm({ ...form, activo: e.target.value === "true" })
                }
              >
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
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

      {/* Dialog historial */}
      <Dialog
        open={historialOpen}
        onClose={() => setHistorialOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Historial — {personaActual?.nombre}</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {historial.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Esta persona no tiene asignaciones registradas.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "background.default" }}>
                  <TableCell>
                    <Typography variant="subtitle1">Equipo</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">Serie</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">
                      Fecha asignación
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">
                      Fecha devolución
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">Estado</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historial.map((h) => (
                  <TableRow key={h.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {h.marca} {h.modelo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "0.75rem",
                        }}
                      >
                        {h.serie}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(h.fecha_asignacion).toLocaleDateString(
                          "es-HN",
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {h.fecha_devolucion
                          ? new Date(h.fecha_devolucion).toLocaleDateString(
                              "es-HN",
                            )
                          : "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={h.activa ? "Activa" : "Cerrada"}
                        color={h.activa ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistorialOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
