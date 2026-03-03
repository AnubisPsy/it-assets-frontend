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
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import MainCard from "../../components/MainCard";
import api from "../../services/api";

const estadoColor = {
  disponible: "success",
  asignado: "warning",
  baja: "error",
};

const formVacio = {
  marca: "",
  modelo: "",
  serie: "",
  procesador: "",
  ram: "",
  descripcion: "",
};

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(formVacio);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState("");
  const [importTexto, setImportTexto] = useState("");
  const [importOpen, setImportOpen] = useState(false);

  const cargarEquipos = async () => {
    try {
      const res = await api.get("/equipos");
      setEquipos(res.data);
    } catch {
      setError("Error al cargar equipos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEquipos();
  }, []);

  const handleAbrir = (equipo = null) => {
    setEditando(equipo);
    setForm(
      equipo
        ? {
            marca: equipo.marca,
            modelo: equipo.modelo,
            serie: equipo.serie,
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
      if (editando) {
        await api.put(`/equipos/${editando.id}`, form);
      } else {
        await api.post("/equipos", form);
      }
      setDialogOpen(false);
      cargarEquipos();
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar");
    }
  };

  const handleImportar = () => {
    try {
      const datos = JSON.parse(importTexto);
      setForm({
        marca: datos.marca || "",
        modelo: datos.modelo || "",
        serie: datos.serie || "",
        procesador: datos.procesador || "",
        ram: datos.ram || "",
        descripcion: datos.descripcion || "",
      });
      setImportOpen(false);
      setEditando(null);
      setError("");
      setDialogOpen(true);
    } catch {
      setError("El formato del script no es válido");
    }
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
        <Typography variant="h4">Equipos</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
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

      <MainCard content={false}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "background.default" }}>
                <TableCell>
                  <Typography variant="subtitle1">Marca / Modelo</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Serie</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Procesador</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">RAM</Typography>
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
              ) : equipos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay equipos registrados
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                equipos.map((equipo) => (
                  <TableRow key={equipo.id} hover>
                    <TableCell>
                      <Typography variant="body1" fontWeight={500}>
                        {equipo.marca}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {equipo.modelo}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{equipo.serie}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {equipo.procesador || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {equipo.ram || "—"}
                      </Typography>
                    </TableCell>
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
                        <IconButton size="small">
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
      </MainCard>

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
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Marca"
                value={form.marca}
                onChange={(e) => setForm({ ...form, marca: e.target.value })}
              />
              <TextField
                fullWidth
                label="Modelo"
                value={form.modelo}
                onChange={(e) => setForm({ ...form, modelo: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Serie"
              value={form.serie}
              onChange={(e) => setForm({ ...form, serie: e.target.value })}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                fullWidth
                label="Procesador"
                value={form.procesador}
                onChange={(e) =>
                  setForm({ ...form, procesador: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="RAM"
                value={form.ram}
                onChange={(e) => setForm({ ...form, ram: e.target.value })}
              />
            </Box>
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
            {editando && (
              <TextField
                fullWidth
                select
                label="Estado"
                value={form.estado}
                onChange={(e) => setForm({ ...form, estado: e.target.value })}
                slotProps={{ select: { native: true } }}
              >
                <option value="disponible">Disponible</option>
                <option value="asignado">Asignado</option>
                <option value="baja">Baja</option>
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

      {/* Dialog importar desde script */}
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
    </Box>
  );
}
