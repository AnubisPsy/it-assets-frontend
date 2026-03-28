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
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ClearIcon from "@mui/icons-material/Clear";
import LaptopIcon from "@mui/icons-material/Laptop";
import InventoryIcon from "@mui/icons-material/Inventory";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import api from "../../services/api";

const BASE_URL = "http://localhost:3000";

const getFileUrl = (p) => {
  if (!p) return null;
  if (p.startsWith("http")) return p;
  return `${BASE_URL}${p}`;
};

const estadoColor = {
  pendiente: "warning",
  entregado: "success",
  "entregado parcial": "info",
  cancelado: "error",
};

const formVacio = {
  descripcion: "",
  documento: "",
  archivoFile: null,
  fecha_compra: "",
  id_estado: "",
  items: [],
};

const itemVacio = { tipo: "equipo", descripcion: "", cantidad: 1 };

const recibirEquipoVacio = {
  tipo_id: "",
  marca: "",
  modelo: "",
  serie: "",
  procesador: "",
  ram: "",
  mac: "",
  descripcion: "",
};

export default function Compras() {
  const [compras, setCompras] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [estados, setEstados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [recibirOpen, setRecibirOpen] = useState(false);
  const [itemActual, setItemActual] = useState(null);
  const [compraActual, setCompraActual] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [itemForm, setItemForm] = useState(itemVacio);
  const [formRecibir, setFormRecibir] = useState({
    id_insumo: "",
    cantidad_recibida: "",
    equipo: recibirEquipoVacio,
  });
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");
  const [errorRecibir, setErrorRecibir] = useState("");
  const [expandidas, setExpandidas] = useState({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const cargarDatos = async () => {
    try {
      const [resCompras, resInsumos, resTipos, resEstados] = await Promise.all([
        api.get("/compras"),
        api.get("/insumos"),
        api.get("/tipos-equipo"),
        api.get("/compras/estados"),
      ]);
      setCompras(resCompras.data);
      setInsumos(resInsumos.data);
      setTipos(resTipos.data);
      setEstados(resEstados.data);
    } catch {
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
            id_estado: compra.id_estado ? String(compra.id_estado) : "",
            items: [],
          }
        : formVacio,
    );
    setItemForm(itemVacio);
    setError("");
    setDialogOpen(true);
  };

  const agregarItem = () => {
    if (!itemForm.descripcion) {
      setError("El ítem necesita una descripción");
      return;
    }
    setForm({ ...form, items: [...form.items, { ...itemForm }] });
    setItemForm(itemVacio);
    setError("");
  };

  const quitarItem = (idx) => {
    setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });
  };

  const handleGuardar = async () => {
    if (!form.id_estado) {
      setError("El estado es requerido");
      return;
    }
    if (!editando && form.items.length === 0) {
      setError("Agrega al menos un ítem");
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
        payload.append("id_estado", form.id_estado);
        payload.append("items", JSON.stringify(form.items));
        config = { headers: { "Content-Type": "multipart/form-data" } };
      } else {
        payload = {
          descripcion: form.descripcion || null,
          documento: form.documento || null,
          fecha_compra: form.fecha_compra || null,
          id_estado: Number(form.id_estado),
          items: form.items,
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

  const abrirRecibir = (compra, item) => {
    setCompraActual(compra);
    setItemActual(item);
    setFormRecibir({
      id_insumo: "",
      cantidad_recibida: String(item.cantidad || 1),
      equipo: recibirEquipoVacio,
    });
    setErrorRecibir("");
    setRecibirOpen(true);
  };

  const handleRecibir = async () => {
    try {
      const payload =
        itemActual.tipo === "insumo"
          ? {
              id_insumo: Number(formRecibir.id_insumo),
              cantidad_recibida: Number(formRecibir.cantidad_recibida),
            }
          : {
              equipo: {
                ...formRecibir.equipo,
                tipo_id: Number(formRecibir.equipo.tipo_id),
              },
            };

      await api.post(
        `/compras/${compraActual.id}/items/${itemActual.id}/recibir`,
        payload,
      );
      setRecibirOpen(false);
      cargarDatos();
    } catch (err) {
      setErrorRecibir(err.response?.data?.error || "Error al recibir");
    }
  };

  const tipoSeleccionado = tipos.find(
    (t) => t.id === Number(formRecibir.equipo?.tipo_id),
  );
  const camposActivos = tipoSeleccionado ? tipoSeleccionado.campos : [];

  const toggleExpandir = (id) =>
    setExpandidas((prev) => ({ ...prev, [id]: !prev[id] }));

  const formatFecha = (f) =>
    f ? new Date(f).toLocaleDateString("es-HN") : "—";

  <Dialog
    open={previewOpen}
    onClose={() => setPreviewOpen(false)}
    maxWidth="md"
    fullWidth
  >
    <DialogTitle>Documento</DialogTitle>
    <DialogContent sx={{ p: 0, height: "70vh" }}>
      <iframe
        src={previewUrl}
        width="100%"
        height="100%"
        style={{ border: "none" }}
        title="Documento de compra"
      />
    </DialogContent>
    <DialogActions>
      <Button onClick={() => setPreviewOpen(false)}>Cerrar</Button>
      <Button variant="contained" href={previewUrl} target="_blank">
        Abrir en nueva pestaña
      </Button>
    </DialogActions>
  </Dialog>;

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
                <TableCell sx={{ width: 40 }} />
                <TableCell>
                  <Typography variant="subtitle1">Descripción</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Documento</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Fecha compra</Typography>
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
              ) : compras.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay compras registradas
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                compras.map((c) => (
                  <>
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleExpandir(c.id)}
                        >
                          {expandidas[c.id] ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {c.descripcion || "—"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.items?.length || 0}{" "}
                          {c.items?.length === 1 ? "ítem" : "ítems"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {c.documento ? (
                          <Tooltip title="Ver documento">
                            <IconButton
                              size="small"
                              onClick={() => {
                                setPreviewUrl(getFileUrl(c.documento));
                                setPreviewOpen(true);
                              }}
                            >
                              <InsertDriveFileIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatFecha(c.fecha_compra)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={c.estado_descripcion || "—"}
                          color={
                            estadoColor[c.estado_descripcion?.toLowerCase()] ||
                            "default"
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleAbrir(c)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>

                    <TableRow key={`${c.id}-detalle`}>
                      <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expandidas[c.id]}>
                          <Box
                            sx={{
                              px: 4,
                              py: 1.5,
                              bgcolor: "background.default",
                            }}
                          >
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                    >
                                      Tipo
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                    >
                                      Descripción
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                    >
                                      Cantidad
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                    >
                                      Recepción
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                    >
                                      Estado
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                    >
                                      Acción
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {c.items?.map((item) => (
                                  <TableRow key={item.id}>
                                    <TableCell>
                                      <Chip
                                        size="small"
                                        icon={
                                          item.tipo === "equipo" ? (
                                            <LaptopIcon />
                                          ) : (
                                            <InventoryIcon />
                                          )
                                        }
                                        label={
                                          item.tipo === "equipo"
                                            ? "Equipo"
                                            : "Insumo"
                                        }
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {item.descripcion || "—"}
                                      </Typography>
                                      {item.insumo_nombre && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {item.insumo_nombre}
                                        </Typography>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {item.cantidad}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {item.fecha_recepcion
                                          ? new Date(
                                              item.fecha_recepcion,
                                            ).toLocaleDateString("es-HN")
                                          : "—"}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      {item.recibido ? (
                                        <Chip
                                          size="small"
                                          icon={<CheckCircleIcon />}
                                          label="Recibido"
                                          color="success"
                                        />
                                      ) : (
                                        <Chip
                                          size="small"
                                          label="Pendiente"
                                          color="warning"
                                        />
                                      )}
                                    </TableCell>
                                    <TableCell align="right">
                                      {!item.recibido && (
                                        <Tooltip title="Recibir ítem">
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() =>
                                              abrirRecibir(c, item)
                                            }
                                          >
                                            <MoveToInboxIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Dialog nueva/editar compra */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editando ? "Editar compra" : "Nueva compra"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              fullWidth
              label="Descripción"
              multiline
              rows={2}
              value={form.descripcion}
              onChange={(e) =>
                setForm({ ...form, descripcion: e.target.value })
              }
            />

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
                <Tooltip title="Reemplazar">
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
                <Tooltip title="Quitar">
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
                sx={{
                  justifyContent: "flex-start",
                  color: "text.secondary",
                  borderColor: "divider",
                }}
              >
                Adjuntar archivo
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      setForm({ ...form, archivoFile: file, documento: "" });
                  }}
                />
              </Button>
            )}

            <TextField
              fullWidth
              label="Fecha de compra"
              type="date"
              value={form.fecha_compra}
              onChange={(e) =>
                setForm({ ...form, fecha_compra: e.target.value })
              }
              slotProps={{ inputLabel: { shrink: true } }}
            />

            <TextField
              select
              fullWidth
              label="Estado"
              value={form.id_estado}
              onChange={(e) => setForm({ ...form, id_estado: e.target.value })}
            >
              {estados.map((est) => (
                <MenuItem key={est.id} value={String(est.id)}>
                  {est.descripcion}
                </MenuItem>
              ))}
            </TextField>

            {!editando && (
              <>
                <Divider />
                <Typography variant="subtitle2">Ítems de la compra</Typography>

                {form.items.map((item, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                    }}
                  >
                    <Chip
                      size="small"
                      icon={
                        item.tipo === "equipo" ? (
                          <LaptopIcon />
                        ) : (
                          <InventoryIcon />
                        )
                      }
                      label={item.tipo}
                      variant="outlined"
                    />
                    <Typography variant="body2" sx={{ flex: 1 }}>
                      {item.descripcion}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      x{item.cantidad}
                    </Typography>
                    <IconButton size="small" onClick={() => quitarItem(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <TextField
                    select
                    size="small"
                    label="Tipo"
                    value={itemForm.tipo}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, tipo: e.target.value })
                    }
                    sx={{ minWidth: 110 }}
                  >
                    <MenuItem value="equipo">Equipo</MenuItem>
                    <MenuItem value="insumo">Insumo</MenuItem>
                  </TextField>
                  <TextField
                    size="small"
                    label="Descripción"
                    value={itemForm.descripcion}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, descripcion: e.target.value })
                    }
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    label="Cant."
                    type="number"
                    value={itemForm.cantidad}
                    onChange={(e) =>
                      setItemForm({
                        ...itemForm,
                        cantidad: Number(e.target.value),
                      })
                    }
                    inputProps={{ min: 1 }}
                    sx={{ width: 70 }}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={agregarItem}
                    sx={{ height: 40 }}
                  >
                    Agregar
                  </Button>
                </Box>
              </>
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

      {/* Dialog recibir ítem */}
      <Dialog
        open={recibirOpen}
        onClose={() => setRecibirOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Recibir — {itemActual?.tipo === "equipo" ? "Equipo" : "Insumo"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {errorRecibir && <Alert severity="error">{errorRecibir}</Alert>}

            {itemActual?.descripcion && (
              <Typography variant="body2" color="text.secondary">
                {itemActual.descripcion}
              </Typography>
            )}

            {itemActual?.tipo === "insumo" ? (
              <>
                <TextField
                  select
                  fullWidth
                  label="Insumo"
                  value={formRecibir.id_insumo}
                  onChange={(e) =>
                    setFormRecibir({
                      ...formRecibir,
                      id_insumo: e.target.value,
                    })
                  }
                >
                  {insumos.map((i) => (
                    <MenuItem key={i.id} value={String(i.id)}>
                      {i.nombre} {i.categoria ? `(${i.categoria})` : ""}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label="Cantidad recibida"
                  type="number"
                  value={formRecibir.cantidad_recibida}
                  onChange={(e) =>
                    setFormRecibir({
                      ...formRecibir,
                      cantidad_recibida: e.target.value,
                    })
                  }
                  inputProps={{ min: 1 }}
                />
              </>
            ) : (
              <>
                <TextField
                  select
                  fullWidth
                  label="Tipo de equipo"
                  value={formRecibir.equipo.tipo_id}
                  onChange={(e) =>
                    setFormRecibir({
                      ...formRecibir,
                      equipo: {
                        ...recibirEquipoVacio,
                        tipo_id: e.target.value,
                      },
                    })
                  }
                >
                  {tipos.map((t) => (
                    <MenuItem key={t.id} value={String(t.id)}>
                      {t.nombre}
                    </MenuItem>
                  ))}
                </TextField>

                {formRecibir.equipo.tipo_id && (
                  <>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      {camposActivos.includes("marca") && (
                        <TextField
                          fullWidth
                          label="Marca"
                          value={formRecibir.equipo.marca}
                          onChange={(e) =>
                            setFormRecibir({
                              ...formRecibir,
                              equipo: {
                                ...formRecibir.equipo,
                                marca: e.target.value,
                              },
                            })
                          }
                        />
                      )}
                      {camposActivos.includes("modelo") && (
                        <TextField
                          fullWidth
                          label="Modelo"
                          value={formRecibir.equipo.modelo}
                          onChange={(e) =>
                            setFormRecibir({
                              ...formRecibir,
                              equipo: {
                                ...formRecibir.equipo,
                                modelo: e.target.value,
                              },
                            })
                          }
                        />
                      )}
                    </Box>
                    {camposActivos.includes("serie") && (
                      <TextField
                        fullWidth
                        label="Serie"
                        value={formRecibir.equipo.serie}
                        onChange={(e) =>
                          setFormRecibir({
                            ...formRecibir,
                            equipo: {
                              ...formRecibir.equipo,
                              serie: e.target.value,
                            },
                          })
                        }
                      />
                    )}
                    <Box sx={{ display: "flex", gap: 2 }}>
                      {camposActivos.includes("procesador") && (
                        <TextField
                          fullWidth
                          label="Procesador"
                          value={formRecibir.equipo.procesador}
                          onChange={(e) =>
                            setFormRecibir({
                              ...formRecibir,
                              equipo: {
                                ...formRecibir.equipo,
                                procesador: e.target.value,
                              },
                            })
                          }
                        />
                      )}
                      {camposActivos.includes("ram") && (
                        <TextField
                          fullWidth
                          label="RAM"
                          value={formRecibir.equipo.ram}
                          onChange={(e) =>
                            setFormRecibir({
                              ...formRecibir,
                              equipo: {
                                ...formRecibir.equipo,
                                ram: e.target.value,
                              },
                            })
                          }
                        />
                      )}
                    </Box>
                    {camposActivos.includes("mac") && (
                      <TextField
                        fullWidth
                        label="MAC"
                        value={formRecibir.equipo.mac}
                        onChange={(e) =>
                          setFormRecibir({
                            ...formRecibir,
                            equipo: {
                              ...formRecibir.equipo,
                              mac: e.target.value,
                            },
                          })
                        }
                      />
                    )}
                    {camposActivos.includes("descripcion") && (
                      <TextField
                        fullWidth
                        label="Descripción"
                        multiline
                        rows={2}
                        value={formRecibir.equipo.descripcion}
                        onChange={(e) =>
                          setFormRecibir({
                            ...formRecibir,
                            equipo: {
                              ...formRecibir.equipo,
                              descripcion: e.target.value,
                            },
                          })
                        }
                      />
                    )}
                  </>
                )}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRecibirOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleRecibir}>
            Confirmar recepción
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Documento</DialogTitle>
        <DialogContent sx={{ p: 0, height: "70vh" }}>
          <iframe
            src={previewUrl}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title="Documento de compra"
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
