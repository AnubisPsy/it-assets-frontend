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
import Autocomplete from "@mui/material/Autocomplete";
import AddIcon from "@mui/icons-material/Add";
import UndoIcon from "@mui/icons-material/Undo";
import UploadIcon from "@mui/icons-material/Upload";
import MainCard from "../../components/MainCard";
import api from "../../services/api";

export default function Asignaciones() {
  const [asignaciones, setAsignaciones] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [devolucionOpen, setDevolucionOpen] = useState(false);
  const [asignacionActual, setAsignacionActual] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    equipo_id: null,
    persona_id: null,
    fecha_asignacion: new Date().toISOString().split("T")[0],
    notas: "",
  });
  const [fechaDevolucion, setFechaDevolucion] = useState("");

  const cargarDatos = async () => {
    try {
      const [asigRes, equipRes, perRes] = await Promise.all([
        api.get("/asignaciones"),
        api.get("/equipos"),
        api.get("/personas"),
      ]);
      setAsignaciones(asigRes.data);
      setEquipos(equipRes.data.filter((e) => e.estado === "disponible"));
      setPersonas(perRes.data.filter((p) => p.activo));
    } catch {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async () => {
    try {
      if (!form.equipo_id || !form.persona_id || !form.fecha_asignacion) {
        setError("Equipo, persona y fecha son requeridos");
        return;
      }
      await api.post("/asignaciones", {
        equipo_id: form.equipo_id.id,
        persona_id: form.persona_id.id,
        fecha_asignacion: form.fecha_asignacion,
        notas: form.notas,
      });
      setDialogOpen(false);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    }
  };

  const handleDevolucion = async () => {
    try {
      if (!fechaDevolucion) {
        setError("La fecha de devolución es requerida");
        return;
      }
      await api.put(`/asignaciones/${asignacionActual.id}/devolucion`, {
        fecha_devolucion: fechaDevolucion,
      });
      setDevolucionOpen(false);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrar devolución");
    }
  };

  const abrirDevolucion = (asignacion) => {
    setAsignacionActual(asignacion);
    setFechaDevolucion(new Date().toISOString().split("T")[0]);
    setError("");
    setDevolucionOpen(true);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Asignaciones</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setForm({
              equipo_id: null,
              persona_id: null,
              fecha_asignacion: new Date().toISOString().split("T")[0],
              notas: "",
            });
            setError("");
            setDialogOpen(true);
          }}
        >
          Nueva asignación
        </Button>
      </Box>

      <MainCard content={false}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "background.default" }}>
                <TableCell>
                  <Typography variant="subtitle1">Colaborador</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Equipo</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Serie</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Fecha asignación</Typography>
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
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Cargando...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : asignaciones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay asignaciones registradas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                asignaciones.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {a.persona_nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {a.departamento}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1">
                        {a.marca} {a.modelo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{a.serie}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(a.fecha_asignacion).toLocaleDateString(
                          "es-HN",
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={a.activa ? "Activa" : "Cerrada"}
                        color={a.activa ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      {a.activa && (
                        <Tooltip title="Registrar devolución">
                          <IconButton
                            size="small"
                            onClick={() => abrirDevolucion(a)}
                          >
                            <UndoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Subir documento firmado">
                        <IconButton size="small">
                          <UploadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {/* Dialog nueva asignación */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Nueva asignación</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}
            <Autocomplete
              options={equipos}
              getOptionLabel={(e) => `${e.marca} ${e.modelo} — ${e.serie}`}
              value={form.equipo_id}
              onChange={(_, val) => setForm({ ...form, equipo_id: val })}
              renderInput={(params) => <TextField {...params} label="Equipo" />}
            />
            <Autocomplete
              options={personas}
              getOptionLabel={(p) => `${p.nombre} — ${p.departamento}`}
              value={form.persona_id}
              onChange={(_, val) => setForm({ ...form, persona_id: val })}
              renderInput={(params) => (
                <TextField {...params} label="Colaborador" />
              )}
            />
            <TextField
              fullWidth
              type="date"
              label="Fecha de asignación"
              value={form.fecha_asignacion}
              onChange={(e) =>
                setForm({ ...form, fecha_asignacion: e.target.value })
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <TextField
              fullWidth
              label="Notas"
              multiline
              rows={2}
              value={form.notas}
              onChange={(e) => setForm({ ...form, notas: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleGuardar}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog devolución */}
      <Dialog
        open={devolucionOpen}
        onClose={() => setDevolucionOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Registrar devolución</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {asignacionActual && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                {asignacionActual.persona_nombre} — {asignacionActual.marca}{" "}
                {asignacionActual.modelo}
              </Typography>
            )}
            <TextField
              fullWidth
              type="date"
              label="Fecha de devolución"
              value={fechaDevolucion}
              onChange={(e) => setFechaDevolucion(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDevolucionOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleDevolucion}
          >
            Confirmar devolución
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
