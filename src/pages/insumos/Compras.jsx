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
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ClearIcon from "@mui/icons-material/Clear";
import api from "../../services/api";

const BASE_URL = "http://localhost:3000";

const getFileUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
};

const formVacio = {
  descripcion: "",
  documento: "",
  archivoFile: null,
  fecha_compra: "",
  fecha_entrega: "",
  id_equipo: "",
  id_estado: "",
};

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");

  const cargarDatos = async () => {
    try {
      const [resCompras, resEquipos, resEstados] = await Promise.all([
        api.get("/compras"),
        api.get("/equipos"),
        api.get("/estados"),
      ]);
      setCompras(resCompras.data);
      // Defensive: handle both array and wrapped responses
      const equiposData = Array.isArray(resEquipos.data)
        ? resEquipos.data
        : resEquipos.data?.equipos || resEquipos.data?.data || [];
      const estadosData = Array.isArray(resEstados.data)
        ? resEstados.data
        : resEstados.data?.estados || resEstados.data?.data || [];
      // Solo equipos con estado "Disponible"
      setEquipos(equiposData.filter(eq => eq.estado?.toLowerCase() === "disponible"));
      setEstados(estadosData);
    } catch (err) {
      console.error("Error cargarDatos:", err);
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrir = (compra = null) => {
    setEditando(compra);
    setForm(
      compra
        ? {
            descripcion: compra.descripcion || "",
            documento: compra.documento || "",
            archivoFile: null,
            fecha_compra: compra.fecha_compra
              ? compra.fecha_compra.substring(0, 10)
              : "",
            fecha_entrega: compra.fecha_entrega
              ? compra.fecha_entrega.substring(0, 10)
              : "",
            id_equipo: compra.id_equipo ? String(compra.id_equipo) : "",
            id_estado: compra.id_estado ? String(compra.id_estado) : "",
          }
        : formVacio,
    );
    setError("");
    setDialogOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.id_equipo) {
      setError("Debes seleccionar un equipo");
      return;
    }
    try {
      let payload;
      let config = {};

      if (form.archivoFile) {
        payload = new FormData();
        payload.append("descripcion", form.descripcion || "");
        payload.append("documento", form.archivoFile);
        payload.append("fecha_compra", form.fecha_compra || "");
        payload.append("fecha_entrega", form.fecha_entrega || "");
        payload.append("id_equipo", form.id_equipo || "");
        payload.append("id_estado", form.id_estado || "");
        config = { headers: { "Content-Type": "multipart/form-data" } };
      } else {
        payload = {
          descripcion: form.descripcion || null,
          documento: form.documento || null,
          fecha_compra: form.fecha_compra || null,
          fecha_entrega: form.fecha_entrega || null,
          id_equipo: form.id_equipo ? Number(form.id_equipo) : null,
          id_estado: form.id_estado ? Number(form.id_estado) : null,
        };
      }

      if (editando) {
        await api.put(`/compras/${editando.id}`, payload, config);
      } else {
        await api.post("/compras", payload, config);
      }

      setDialogOpen(false);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    }
  };

  const comprasFiltradas = estadoFiltro
    ? compras.filter((c) => String(c.id_estado) === String(estadoFiltro))
    : compras;

  const getDescripcionEquipo = (id_equipo) => {
    const eq = equipos.find((e) => e.id === id_equipo);
    return eq?.modelo || "—";
  };

  const getDescripcionEstado = (id_estado) => {
    const est = estados.find((e) => e.id === id_estado);
    return est?.descripcion || "—";
  };

  const getColorEstado = (id_estado) => {
    const est = estados.find((e) => e.id === id_estado);
    return est?.color || "default";
  };

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleDateString("es-HN");
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
        <Typography variant="h4">Compras</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAbrir()}
        >
          Nueva compra
        </Button>
      </Box>

      <Card elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "background.default" }}>
                <TableCell>
                  <Typography variant="subtitle1">Descripción</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Documento</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Equipo</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Fecha compra</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Fecha entrega</Typography>
                </TableCell>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={estadoFiltro}
                    onChange={(e) => setEstadoFiltro(e.target.value)}
                    variant="standard"
                    sx={{ minWidth: 130 }}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="">Estado</MenuItem>
                    {estados.map((est) => (
                      <MenuItem key={est.id} value={est.id}>
                        <Chip
                          label={est.descripcion || `Estado #${est.id}`}
                          color={est.color || "default"}
                          size="small"
                        />
                      </MenuItem>
                    ))}
                  </TextField>
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
              ) : comprasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay compras registradas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                comprasFiltradas.map((compra) => (
                  <TableRow key={compra.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {compra.descripcion || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {compra.documento ? (
                        <Tooltip title="Abrir documento">
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<InsertDriveFileIcon fontSize="small" />}
                            endIcon={<OpenInNewIcon sx={{ fontSize: "0.75rem !important" }} />}
                            href={getFileUrl(compra.documento)}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                              fontSize: "0.75rem",
                              fontFamily: "'DM Mono', monospace",
                              textTransform: "none",
                              color: "text.secondary",
                              px: 0.5,
                              maxWidth: 180,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {compra.documento.split("/").pop() || "Ver archivo"}
                          </Button>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.disabled">—</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {compra.equipo_descripcion || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatFecha(compra.fecha_compra)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatFecha(compra.fecha_entrega)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getDescripcionEstado(compra.id_estado)}
                        color={getColorEstado(compra.id_estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleAbrir(compra)}
                        >
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

      {/* Dialog nuevo/editar */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editando ? "Editar compra" : "Nueva compra"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              label="Descripción"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              multiline
              rows={2}
            />

            {/* Campo de documento / archivo */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Documento
              </Typography>

              {editando && form.documento && !form.archivoFile && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: "background.default",
                  }}
                >
                  <InsertDriveFileIcon fontSize="small" color="action" />
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.75rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {form.documento.split("/").pop()}
                  </Typography>
                  <Tooltip title="Abrir archivo">
                    <IconButton
                      size="small"
                      component="a"
                      href={getFileUrl(form.documento)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Reemplazar archivo">
                    <IconButton
                      size="small"
                      onClick={() => setForm({ ...form, documento: "" })}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {form.archivoFile && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "primary.main",
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: "primary.50",
                  }}
                >
                  <InsertDriveFileIcon fontSize="small" color="primary" />
                  <Typography
                    variant="body2"
                    sx={{
                      flex: 1,
                      fontFamily: "'DM Mono', monospace",
                      fontSize: "0.75rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {form.archivoFile.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(form.archivoFile.size / 1024).toFixed(0)} KB
                  </Typography>
                  <Tooltip title="Quitar archivo">
                    <IconButton
                      size="small"
                      onClick={() => setForm({ ...form, archivoFile: null })}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              {!form.archivoFile && !(editando && form.documento) && (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  fullWidth
                  sx={{ justifyContent: "flex-start", color: "text.secondary", borderColor: "divider" }}
                >
                  Adjuntar archivo
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setForm({ ...form, archivoFile: file, documento: "" });
                    }}
                  />
                </Button>
              )}

              {!form.archivoFile && editando && !form.documento && (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<AttachFileIcon />}
                  fullWidth
                  sx={{ justifyContent: "flex-start", color: "text.secondary", borderColor: "divider" }}
                >
                  Seleccionar nuevo archivo
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setForm({ ...form, archivoFile: file });
                    }}
                  />
                </Button>
              )}
            </Box>

            <TextField
              select
              fullWidth
              label="Equipo"
              value={form.id_equipo}
              onChange={(e) => setForm({ ...form, id_equipo: e.target.value })}
              required
              helperText={!form.id_equipo ? "Selecciona un equipo" : ""}
            >
              {equipos.map((eq) => {
                console.log("Equipo objeto:", eq); // <-- ver campos reales
                const label = eq.marca && eq.modelo
                  ? `${eq.marca} ${eq.modelo}`
                  : eq.modelo || eq.marca || eq.descripcion || eq.nombre || eq.serie || `Equipo #${eq.id}`;
                return (
                  <MenuItem key={eq.id} value={String(eq.id)}>
                    {label}
                  </MenuItem>
                );
              })}
            </TextField>

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Fecha de compra"
                type="date"
                value={form.fecha_compra}
                onChange={(e) =>
                  setForm({ ...form, fecha_compra: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Fecha de entrega"
                type="date"
                value={form.fecha_entrega}
                onChange={(e) =>
                  setForm({ ...form, fecha_entrega: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* Estado con chips de colores */}
            <TextField
              select
              fullWidth
              label="Estado"
              value={form.id_estado}
              onChange={(e) => setForm({ ...form, id_estado: e.target.value })}
              SelectProps={{
                renderValue: (selected) => {
                  const est = estados.find((e) => String(e.id) === String(selected));
                  if (!est) return "";
                  return (
                    <Chip
                      label={est.descripcion || `Estado #${est.id}`}
                      color={est.color || "default"}
                      size="small"
                    />
                  );
                },
              }}
            >
              {estados.map((est) => (
                <MenuItem key={est.id} value={String(est.id)}>
                  <Chip
                    label={est.descripcion || `Estado #${est.id}`}
                    color={est.color || "default"}
                    size="small"
                  />
                </MenuItem>
              ))}
            </TextField>
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