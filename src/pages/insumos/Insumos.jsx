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
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import api from "../../services/api";

const formVacio = {
  nombre: "",
  categoria: "",
  stock: 0,
  stock_minimo: 0,
};

export default function Insumos() {
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");
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
                  editando ? "El stock se ajusta por compras y entregas" : ""
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
    </Box>
  );
}
