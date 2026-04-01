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
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import TuneIcon from "@mui/icons-material/Tune";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import HistoryIcon from "@mui/icons-material/History";
import api from "../../services/api";

const formVacio = { nombre: "", categoria: "", stock: 0, stock_minimo: 0 };
const ajusteVacio = { cantidad_nueva: "", motivo: "" };

const MOTIVOS = [
  "Inventario físico",
  "Corrección de error",
  "Merma",
  "Donación",
  "Otro",
];

export default function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ajusteOpen, setAjusteOpen] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [insumoActual, setInsumoActual] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [form, setForm] = useState(formVacio);
  const [ajusteForm, setAjusteForm] = useState(ajusteVacio);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");
  const [errorAjuste, setErrorAjuste] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [nuevaCategoria, setNuevaCategoria] = useState(false);

  const cargarDatos = async () => {
    try {
      const [resInsumos, resCategorias] = await Promise.all([
        api.get("/insumos"),
        api.get("/insumos/categorias"),
      ]);
      setInsumos(resInsumos.data);
      setCategorias(resCategorias.data);
    } catch {
      setError("Error al cargar insumos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrir = (insumo = null) => {
    setEditando(insumo);
    setForm(
      insumo
        ? {
            nombre: insumo.nombre,
            categoria: insumo.categoria || "",
            stock: insumo.stock,
            stock_minimo: insumo.stock_minimo,
          }
        : formVacio,
    );
    setNuevaCategoria(false);
    setError("");
    setDialogOpen(true);
  };

  const handleGuardar = async () => {
    if (!form.nombre) {
      setError("El nombre es requerido");
      return;
    }
    try {
      if (editando) {
        await api.put(`/insumos/${editando.id}`, form);
      } else {
        await api.post("/insumos", form);
      }
      setDialogOpen(false);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    }
  };

  const abrirAjuste = (insumo) => {
    setInsumoActual(insumo);
    setAjusteForm({ cantidad_nueva: String(insumo.stock), motivo: "" });
    setErrorAjuste("");
    setAjusteOpen(true);
  };

  const handleAjuste = async () => {
    if (ajusteForm.cantidad_nueva === "" || ajusteForm.cantidad_nueva < 0) {
      setErrorAjuste("La cantidad debe ser mayor o igual a cero");
      return;
    }
    if (!ajusteForm.motivo) {
      setErrorAjuste("El motivo es requerido");
      return;
    }
    try {
      await api.post("/ajustes", {
        insumo_id: insumoActual.id,
        cantidad_nueva: Number(ajusteForm.cantidad_nueva),
        motivo: ajusteForm.motivo,
      });
      setAjusteOpen(false);
      cargarDatos();
    } catch (err) {
      setErrorAjuste(err.response?.data?.error || "Error al ajustar");
    }
  };

  const verHistorial = async (insumo) => {
    try {
      const res = await api.get(`/ajustes/insumo/${insumo.id}`);
      setHistorial(res.data);
      setInsumoActual(insumo);
      setHistorialOpen(true);
    } catch {
      setError("Error al cargar historial");
    }
  };

  const insumosFiltrados = categoriaFiltro
    ? insumos.filter((i) => i.categoria === categoriaFiltro)
    : insumos;

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
        <Typography variant="h4">Insumos</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAbrir()}
        >
          Nuevo insumo
        </Button>
      </Box>

      <Card elevation={0}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "background.default" }}>
                <TableCell>
                  <TextField
                    select
                    size="small"
                    value={categoriaFiltro}
                    onChange={(e) => setCategoriaFiltro(e.target.value)}
                    variant="standard"
                    sx={{ minWidth: 130 }}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="">Categoría</MenuItem>
                    {categorias.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Nombre</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Stock</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Stock mínimo</Typography>
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
              ) : insumosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay insumos registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                insumosFiltrados.map((insumo) => {
                  const stockBajo = insumo.stock <= insumo.stock_minimo;
                  return (
                    <TableRow key={insumo.id} hover>
                      <TableCell>
                        <Chip
                          label={insumo.categoria || "Sin categoría"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600}>
                          {insumo.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={stockBajo ? "error.main" : "text.primary"}
                          >
                            {insumo.stock}
                          </Typography>
                          {stockBajo && (
                            <Tooltip title="Stock bajo">
                              <WarningAmberIcon
                                fontSize="small"
                                color="error"
                              />
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {insumo.stock_minimo}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Ajustar stock">
                          <IconButton
                            size="small"
                            onClick={() => abrirAjuste(insumo)}
                          >
                            <TuneIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Historial de ajustes">
                          <IconButton
                            size="small"
                            onClick={() => verHistorial(insumo)}
                          >
                            <HistoryIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrir(insumo)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog nuevo/editar insumo */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>{editando ? "Editar insumo" : "Nuevo insumo"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              label="Nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />

            {!nuevaCategoria ? (
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  select
                  fullWidth
                  label="Categoría"
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                >
                  <MenuItem value="">Sin categoría</MenuItem>
                  {categorias.map((c) => (
                    <MenuItem key={c} value={c}>
                      {c}
                    </MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setNuevaCategoria(true)}
                  sx={{ whiteSpace: "nowrap", minWidth: "auto", px: 1.5 }}
                >
                  Nueva
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  label="Nueva categoría"
                  value={form.categoria}
                  onChange={(e) =>
                    setForm({ ...form, categoria: e.target.value })
                  }
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setNuevaCategoria(false)}
                  sx={{ whiteSpace: "nowrap", minWidth: "auto", px: 1.5 }}
                >
                  Cancelar
                </Button>
              </Box>
            )}

            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Stock inicial"
                type="number"
                value={form.stock}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) })
                }
                inputProps={{ min: 0 }}
                disabled={!!editando}
                helperText={
                  editando
                    ? "Usa el ajuste de stock para modificar la cantidad"
                    : ""
                }
              />
              <TextField
                fullWidth
                label="Stock mínimo"
                type="number"
                value={form.stock_minimo}
                onChange={(e) =>
                  setForm({ ...form, stock_minimo: Number(e.target.value) })
                }
                inputProps={{ min: 0 }}
              />
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

      {/* Dialog ajuste de stock */}
      <Dialog
        open={ajusteOpen}
        onClose={() => setAjusteOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Ajustar stock — {insumoActual?.nombre}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {errorAjuste && <Alert severity="error">{errorAjuste}</Alert>}

            <Box
              sx={{ p: 1.5, bgcolor: "background.default", borderRadius: 2 }}
            >
              <Typography variant="caption" color="text.secondary">
                Stock actual
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {insumoActual?.stock}
              </Typography>
            </Box>

            <TextField
              fullWidth
              label="Cantidad real (inventario físico)"
              type="number"
              value={ajusteForm.cantidad_nueva}
              onChange={(e) =>
                setAjusteForm({ ...ajusteForm, cantidad_nueva: e.target.value })
              }
              inputProps={{ min: 0 }}
              helperText={
                ajusteForm.cantidad_nueva !== "" &&
                ajusteForm.cantidad_nueva !== String(insumoActual?.stock)
                  ? `Diferencia: ${Number(ajusteForm.cantidad_nueva) - (insumoActual?.stock || 0) > 0 ? "+" : ""}${Number(ajusteForm.cantidad_nueva) - (insumoActual?.stock || 0)}`
                  : ""
              }
            />

            <TextField
              select
              fullWidth
              label="Motivo"
              value={ajusteForm.motivo}
              onChange={(e) =>
                setAjusteForm({ ...ajusteForm, motivo: e.target.value })
              }
            >
              {MOTIVOS.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAjusteOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAjuste}>
            Confirmar ajuste
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog historial de ajustes */}
      <Dialog
        open={historialOpen}
        onClose={() => setHistorialOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Historial de ajustes — {insumoActual?.nombre}</DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {historial.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No hay ajustes registrados.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "background.default" }}>
                  <TableCell>
                    <Typography variant="subtitle1">Fecha</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">Antes</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">Después</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">Diferencia</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">Motivo</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">Ajustado por</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historial.map((h) => (
                  <TableRow key={h.id} hover>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(h.fecha_registro).toLocaleDateString("es-HN")}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {h.cantidad_antes}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {h.cantidad_nueva}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        color={
                          h.diferencia > 0
                            ? "success.main"
                            : h.diferencia < 0
                              ? "error.main"
                              : "text.secondary"
                        }
                      >
                        {h.diferencia > 0 ? `+${h.diferencia}` : h.diferencia}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{h.motivo}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{h.ajustado_por}</Typography>
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
