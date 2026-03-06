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
import HistoryIcon from "@mui/icons-material/History";
import CodeIcon from "@mui/icons-material/Code";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import api from "../../services/api";

const estadoColor = {
  disponible: "success",
  asignado: "warning",
  baja: "error",
};

const CAMPOS_CONFIG = [
  { key: "marca", label: "Marca" },
  { key: "modelo", label: "Modelo" },
  { key: "serie", label: "Serie" },
  { key: "procesador", label: "Procesador" },
  { key: "ram", label: "RAM" },
  { key: "mac", label: "MAC" },
  { key: "descripcion", label: "Descripción" },
];

const formVacio = {
  tipo_id: "",
  marca: "",
  modelo: "",
  serie: "",
  procesador: "",
  ram: "",
  mac: "",
  descripcion: "",
};

const SCRIPT = `$cs   = Get-CimInstance Win32_ComputerSystem
$bios = Get-CimInstance Win32_BIOS
$ram  = [math]::Round((Get-CimInstance Win32_PhysicalMemory |
          Measure-Object Capacity -Sum).Sum / 1GB, 2)
$cpu  = Get-CimInstance Win32_Processor
@{
    serie      = $bios.SerialNumber
    marca      = $cs.Manufacturer
    procesador = $cpu.Name
    ram        = "$ram GB"
    modelo     = $cs.Model
} | ConvertTo-Json -Compress`;

const SCRIPT_RAW = `$cs   = Get-CimInstance Win32_ComputerSystem\n$bios = Get-CimInstance Win32_BIOS\n$ram  = [math]::Round((Get-CimInstance Win32_PhysicalMemory |\n          Measure-Object Capacity -Sum).Sum / 1GB, 2)\n$cpu  = Get-CimInstance Win32_Processor\n@{\n    serie      = $bios.SerialNumber\n    marca      = $cs.Manufacturer\n    procesador = $cpu.Name\n    ram        = "$ram GB"\n    modelo     = $cs.Model\n} | ConvertTo-Json -Compress`;

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");
  const [importTexto, setImportTexto] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [scriptOpen, setScriptOpen] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [equipoActual, setEquipoActual] = useState(null);
  const [tipoFiltro, setTipoFiltro] = useState("");

  const tipoSeleccionado = tipos.find((t) => t.id === Number(form.tipo_id));
  const camposActivos = tipoSeleccionado ? tipoSeleccionado.campos : [];

  const cargarDatos = async () => {
    try {
      const [resEquipos, resTipos] = await Promise.all([
        api.get("/equipos"),
        api.get("/tipos-equipo"),
      ]);
      setEquipos(resEquipos.data);
      setTipos(resTipos.data);
    } catch {
      setError("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleAbrir = (equipo = null) => {
    setEditando(equipo);
    setForm(
      equipo
        ? {
            tipo_id: equipo.tipo_id || "",
            marca: equipo.marca || "",
            modelo: equipo.modelo || "",
            serie: equipo.serie || "",
            procesador: equipo.procesador || "",
            ram: equipo.ram || "",
            descripcion: equipo.descripcion || "",
            estado: equipo.estado,
          }
        : formVacio,
    );
    setError("");
    setDialogOpen(true);
  };

  const handleGuardar = async () => {
    try {
      const tipo = tipos.find((t) => t.id === Number(form.tipo_id));
      const camposPermitidos = tipo ? tipo.campos : [];

      const payload = { tipo_id: form.tipo_id };
      camposPermitidos.forEach((campo) => {
        payload[campo] = form[campo] || null;
      });

      if (editando) {
        payload.estado = form.estado;
        await api.put(`/equipos/${editando.id}`, payload);
      } else {
        await api.post("/equipos", payload);
      }

      setDialogOpen(false);
      cargarDatos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    }
  };

  const handleImportar = () => {
    try {
      const datos = JSON.parse(importTexto);
      setForm((prev) => ({
        ...prev,
        mac: datos.mac || "",
        marca: datos.marca || "",
        modelo: datos.modelo || "",
        serie: datos.serie || "",
        procesador: datos.procesador || "",
        ram: datos.ram || "",
        descripcion: datos.descripcion || "",
      }));
      setImportOpen(false);
      setEditando(null);
      setError("");
      setDialogOpen(true);
    } catch {
      setError("El formato del script no es válido");
    }
  };

  const verHistorial = async (equipo) => {
    try {
      const res = await api.get(`/asignaciones/historial/equipo/${equipo.id}`);
      setHistorial(res.data);
      setEquipoActual(equipo);
      setHistorialOpen(true);
    } catch {
      setError("Error al cargar el historial");
    }
  };

  const copiarScript = () => {
    navigator.clipboard.writeText(SCRIPT_RAW);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const descargarScript = () => {
    const blob = new Blob([SCRIPT_RAW], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "equipo_info.ps1";
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderCampo = (key, label, opciones = {}) => {
    if (!camposActivos.includes(key)) return null;
    return (
      <TextField
        key={key}
        fullWidth
        label={label}
        value={form[key] || ""}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        multiline={key === "descripcion"}
        rows={key === "descripcion" ? 2 : undefined}
        {...opciones}
      />
    );
  };

  const equiposFiltrados = tipoFiltro
    ? equipos.filter((e) => String(e.tipo_id) === String(tipoFiltro))
    : equipos;

  const tipoActivo = tipos.find((t) => t.id === Number(tipoFiltro));
  const columnasDinamicas = tipoActivo ? tipoActivo.campos : [];

  console.log("tipoFiltro:", tipoFiltro, typeof tipoFiltro);
  console.log(
    "primer equipo tipo_id:",
    equipos[0]?.tipo_id,
    typeof equipos[0]?.tipo_id,
  );

  console.log(
    "equiposFiltrados:",
    equiposFiltrados.map((e) => e.tipo_id),
  );

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h4">Equipos</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<CodeIcon />}
            onClick={() => setScriptOpen(true)}
          >
            Ver script
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setImportOpen(true);
              setError("");
            }}
          >
            Importar desde script
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleAbrir()}
          >
            Nuevo equipo
          </Button>
        </Box>
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
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                    variant="standard"
                    sx={{ minWidth: 130 }}
                    SelectProps={{ displayEmpty: true }}
                  >
                    <MenuItem value="">Tipo</MenuItem>
                    {tipos.map((tipo) => (
                      <MenuItem key={tipo.id} value={tipo.id}>
                        {tipo.nombre}
                      </MenuItem>
                    ))}
                  </TextField>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Marca / Modelo</Typography>
                </TableCell>
                {tipoFiltro ? (
                  columnasDinamicas
                    .filter((c) => c !== "marca" && c !== "modelo")
                    .map((campo) => (
                      <TableCell key={campo}>
                        <Typography variant="subtitle1">
                          {CAMPOS_CONFIG.find((c) => c.key === campo)?.label ||
                            campo}
                        </Typography>
                      </TableCell>
                    ))
                ) : (
                  <TableCell>
                    <Typography variant="subtitle1">Serie</Typography>
                  </TableCell>
                )}
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
                  <TableCell
                    colSpan={tipoFiltro ? columnasDinamicas.length + 2 : 5}
                    align="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      Cargando...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : equiposFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={tipoFiltro ? columnasDinamicas.length + 2 : 5}
                    align="center"
                  >
                    <Typography variant="body2" color="text.secondary">
                      No hay equipos registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                equiposFiltrados.map((equipo) => (
                  <TableRow key={equipo.id} hover>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {tipos.find((t) => t.id === equipo.tipo_id)?.nombre ||
                          "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body1"
                        fontWeight={600}
                        color="text.primary"
                      >
                        {equipo.marca}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {equipo.modelo}
                      </Typography>
                    </TableCell>
                    {tipoFiltro ? (
                      columnasDinamicas
                        .filter((c) => c !== "marca" && c !== "modelo")
                        .map((campo) => (
                          <TableCell key={campo}>
                            <Typography
                              variant="body2"
                              sx={
                                campo === "serie" || campo === "mac"
                                  ? {
                                      fontFamily: "'DM Mono', monospace",
                                      fontSize: "0.75rem",
                                    }
                                  : {}
                              }
                            >
                              {equipo[campo] || "—"}
                            </Typography>
                          </TableCell>
                        ))
                    ) : (
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "'DM Mono', monospace",
                            fontSize: "0.75rem",
                          }}
                        >
                          {equipo.serie || "—"}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={equipo.estado}
                        color={estadoColor[equipo.estado] || "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Editar">
                        <IconButton
                          size="small"
                          onClick={() => handleAbrir(equipo)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Historial">
                        <IconButton
                          size="small"
                          onClick={() => verHistorial(equipo)}
                        >
                          <HistoryIcon fontSize="small" />
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
        <DialogTitle>{editando ? "Editar equipo" : "Nuevo equipo"}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            {error && <Alert severity="error">{error}</Alert>}

            <TextField
              select
              fullWidth
              label="Tipo de equipo"
              value={form.tipo_id}
              onChange={(e) => setForm({ ...form, tipo_id: e.target.value })}
            >
              {tipos.map((tipo) => (
                <MenuItem key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </MenuItem>
              ))}
            </TextField>

            {form.tipo_id && (
              <>
                <Box sx={{ display: "flex", gap: 2 }}>
                  {renderCampo("marca", "Marca")}
                  {renderCampo("modelo", "Modelo")}
                </Box>
                {renderCampo("serie", "Serie")}
                <Box sx={{ display: "flex", gap: 2 }}>
                  {renderCampo("procesador", "Procesador")}
                  {renderCampo("ram", "RAM")}
                </Box>
                {renderCampo("mac", "MAC")}
                {renderCampo("descripcion", "Descripción")}

                {editando && (
                  <TextField
                    select
                    fullWidth
                    label="Estado"
                    value={form.estado}
                    onChange={(e) =>
                      setForm({ ...form, estado: e.target.value })
                    }
                  >
                    <MenuItem value="disponible">Disponible</MenuItem>
                    <MenuItem value="asignado">Asignado</MenuItem>
                    <MenuItem value="baja">Baja</MenuItem>
                  </TextField>
                )}
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

      {/* Dialog importar */}
      <Dialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Importar desde script PowerShell</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Typography variant="body2" color="text.secondary" mb={2}>
              Pega aquí el resultado del script de PowerShell ejecutado en el
              equipo.
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Output del script"
              value={importTexto}
              onChange={(e) => setImportTexto(e.target.value)}
              placeholder='{"marca": "ASUSTeK", "modelo": "...", "serie": "..."}'
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setImportOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleImportar}>
            Importar
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
        <DialogTitle>
          Historial — {equipoActual?.marca} {equipoActual?.modelo}
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {historial.length === 0 ? (
            <Box sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Este equipo no tiene asignaciones registradas.
              </Typography>
            </Box>
          ) : (
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "background.default" }}>
                  <TableCell>
                    <Typography variant="subtitle1">Colaborador</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1">Departamento</Typography>
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
                        {h.persona_nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{h.departamento}</Typography>
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

      {/* Dialog script */}
      <Dialog
        open={scriptOpen}
        onClose={() => setScriptOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Script de PowerShell</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Ejecuta este script en el equipo a registrar para obtener sus datos
            automáticamente.
          </Typography>
          <Box
            sx={{
              bgcolor: "#13131a",
              borderRadius: 2,
              p: 2.5,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "0.78rem",
              color: "#d4d4d4",
              whiteSpace: "pre",
              overflowX: "auto",
              lineHeight: 1.7,
              border: "1px solid #1e1e28",
            }}
          >
            {SCRIPT}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setScriptOpen(false)}>Cerrar</Button>
          <Button
            variant="outlined"
            color={copiado ? "success" : "primary"}
            startIcon={<ContentCopyIcon />}
            onClick={copiarScript}
          >
            {copiado ? "Copiado" : "Copiar"}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={descargarScript}
          >
            Descargar .ps1
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
