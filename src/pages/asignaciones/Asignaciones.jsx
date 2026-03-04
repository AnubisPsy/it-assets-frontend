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
import Collapse from "@mui/material/Collapse";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import AddIcon from "@mui/icons-material/Add";
import UndoIcon from "@mui/icons-material/Undo";
import UploadIcon from "@mui/icons-material/Upload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VisibilityIcon from "@mui/icons-material/Visibility";
import FilterListIcon from "@mui/icons-material/FilterList";
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [filtrosOpen, setFiltrosOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    persona: "",
    departamento: "",
    equipo: "",
    fecha_desde: "",
    fecha_hasta: "",
    usuario: "",
  });
  const [asignacionesFiltradas, setAsignacionesFiltradas] = useState([]);
  const [busquedaActiva, setBusquedaActiva] = useState(false);

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

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

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

  const limpiarNombre = (texto) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "_");

  const generarPDF = async (asignacion) => {
    try {
      const res = await api.get(`/pdf/constancia/${asignacion.id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `constancia_${limpiarNombre(asignacion.persona_nombre)}_${new Date(asignacion.fecha_asignacion).toLocaleDateString("es-HN").replace(/\//g, "-")}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Error al generar el PDF");
    }
  };

  const subirDocumento = async (asignacion, archivo) => {
    try {
      const formData = new FormData();
      formData.append("documento", archivo);
      await api.post(`/asignaciones/${asignacion.id}/documento`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      cargarDatos();
    } catch {
      setError("Error al subir el documento");
    }
  };

  const previsualizarDocumento = async (asignacion) => {
    try {
      const res = await api.get(
        `/asignaciones/${asignacion.id}/documento/verificar`,
      );
      if (!res.data.existe) {
        setError(
          "El documento no se encontró en el servidor. Por favor sube el documento firmado nuevamente.",
        );
        return;
      }
      setPreviewUrl(res.data.url);
      setPreviewOpen(true);
    } catch {
      setError("No se pudo verificar el documento.");
    }
  };

  const buscar = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.persona) params.append("persona", filtros.persona);
      if (filtros.departamento)
        params.append("departamento", filtros.departamento);
      if (filtros.equipo) params.append("equipo", filtros.equipo);
      if (filtros.fecha_desde)
        params.append("fecha_desde", filtros.fecha_desde);
      if (filtros.fecha_hasta)
        params.append("fecha_hasta", filtros.fecha_hasta);
      if (filtros.usuario) params.append("usuario", filtros.usuario);
      const res = await api.get(
        `/asignaciones/buscar/resultados?${params.toString()}`,
      );
      setAsignacionesFiltradas(res.data);
      setBusquedaActiva(true);
    } catch {
      setError("Error al buscar");
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      persona: "",
      departamento: "",
      equipo: "",
      fecha_desde: "",
      fecha_hasta: "",
      usuario: "",
    });
    setAsignacionesFiltradas([]);
    setBusquedaActiva(false);
  };

  const datosMostrados = busquedaActiva ? asignacionesFiltradas : asignaciones;

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
          mb: 2,
        }}
      >
        <Typography variant="h4">Asignaciones</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant={filtrosOpen ? "contained" : "outlined"}
            startIcon={<FilterListIcon />}
            onClick={() => setFiltrosOpen(!filtrosOpen)}
          >
            Filtros {busquedaActiva && `(${asignacionesFiltradas.length})`}
          </Button>
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
      </Box>

      <Collapse in={filtrosOpen}>
        <Card elevation={0} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <TextField
                label="Persona"
                size="small"
                value={filtros.persona}
                onChange={(e) =>
                  setFiltros({ ...filtros, persona: e.target.value })
                }
                sx={{ flex: 1, minWidth: 150 }}
              />
              <TextField
                label="Departamento"
                size="small"
                value={filtros.departamento}
                onChange={(e) =>
                  setFiltros({ ...filtros, departamento: e.target.value })
                }
                sx={{ flex: 1, minWidth: 150 }}
              />
              <TextField
                label="Equipo o serie"
                size="small"
                value={filtros.equipo}
                onChange={(e) =>
                  setFiltros({ ...filtros, equipo: e.target.value })
                }
                sx={{ flex: 1, minWidth: 150 }}
              />
              <TextField
                label="Asignado por"
                size="small"
                value={filtros.usuario}
                onChange={(e) =>
                  setFiltros({ ...filtros, usuario: e.target.value })
                }
                sx={{ flex: 1, minWidth: 150 }}
              />
              <TextField
                label="Fecha desde"
                type="date"
                size="small"
                value={filtros.fecha_desde}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_desde: e.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: 1, minWidth: 150 }}
              />
              <TextField
                label="Fecha hasta"
                type="date"
                size="small"
                value={filtros.fecha_hasta}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_hasta: e.target.value })
                }
                slotProps={{ inputLabel: { shrink: true } }}
                sx={{ flex: 1, minWidth: 150 }}
              />
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 2,
                justifyContent: "flex-end",
              }}
            >
              <Button size="small" onClick={limpiarFiltros}>
                Limpiar
              </Button>
              <Button size="small" variant="contained" onClick={buscar}>
                Buscar
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Collapse>

      <Card elevation={0}>
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
                  <Typography variant="subtitle1">Asignado por</Typography>
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
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      Cargando...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : datosMostrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {busquedaActiva
                        ? "No se encontraron resultados"
                        : "No hay asignaciones registradas"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                datosMostrados.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        color="text.primary"
                      >
                        {a.persona_nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {a.departamento}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {a.marca} {a.modelo}
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
                        {a.serie}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(a.fecha_asignacion).toLocaleDateString(
                          "es-HN",
                        )}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {a.asignado_por || "—"}
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
                      <Tooltip title="Generar constancia PDF">
                        <IconButton size="small" onClick={() => generarPDF(a)}>
                          <PictureAsPdfIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          a.documento_firmado
                            ? "Reemplazar documento firmado"
                            : "Subir documento firmado"
                        }
                      >
                        <IconButton
                          size="small"
                          color={a.documento_firmado ? "success" : "default"}
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = ".pdf,.jpg,.jpeg,.png";
                            input.onchange = (e) => {
                              if (e.target.files[0])
                                subirDocumento(a, e.target.files[0]);
                            };
                            input.click();
                          }}
                        >
                          <UploadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {a.documento_firmado && (
                        <Tooltip title="Ver documento firmado">
                          <IconButton
                            size="small"
                            onClick={() => previsualizarDocumento(a)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

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

      {/* Dialog previsualización */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Documento firmado</DialogTitle>
        <DialogContent sx={{ p: 0, height: "70vh" }}>
          <iframe
            src={previewUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="Documento firmado"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
          <Button variant="contained" href={previewUrl} target="_blank">
            Abrir en nueva pestaña
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
