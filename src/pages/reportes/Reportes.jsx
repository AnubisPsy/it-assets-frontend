import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import api from "../../services/api";
import { exportarExcel, exportarPDF, REPORTES } from "../../utils/reportes";

const hoy = new Date().toISOString().split("T")[0];
const haceTresMeses = new Date(new Date().setMonth(new Date().getMonth() - 3))
  .toISOString()
  .split("T")[0];

export default function Reportes() {
  const [error, setError] = useState("");
  const [fechaDesde, setFechaDesde] = useState(haceTresMeses);
  const [fechaHasta, setFechaHasta] = useState(hoy);
  const [persona, setPersona] = useState("");
  const [equipo, setEquipo] = useState("");
  const [usuario, setUsuario] = useState("");

  const generarReporte = async (tipo, formato) => {
    try {
      setError("");
      const reporte = REPORTES[tipo];
      let datos = [];

      if (tipo === "equipos") {
        const res = await api.get("/equipos");
        datos = res.data;
      } else if (tipo === "asignaciones") {
        const params = new URLSearchParams();
        if (fechaDesde) params.append("fecha_desde", fechaDesde);
        if (fechaHasta) params.append("fecha_hasta", fechaHasta);
        const res = await api.get(`/asignaciones/buscar/resultados?${params}`);
        datos = res.data;
      } else if (tipo === "equiposPorColaborador") {
        const res = await api.get("/asignaciones");
        datos = res.data.filter((a) => a.activa);
      } else if (tipo === "sinDocumento") {
        const res = await api.get("/asignaciones");
        datos = res.data.filter((a) => a.activa && !a.documento_firmado);
      } else if (tipo === "historialPersona") {
        const params = new URLSearchParams();
        if (persona) params.append("persona", persona);
        const res = await api.get(`/asignaciones/buscar/resultados?${params}`);
        datos = res.data;
      } else if (tipo === "historialEquipo") {
        const params = new URLSearchParams();
        if (equipo) params.append("equipo", equipo);
        const res = await api.get(`/asignaciones/buscar/resultados?${params}`);
        datos = res.data;
      } else if (tipo === "historialUsuario") {
        const params = new URLSearchParams();
        if (usuario) params.append("usuario", usuario);
        const res = await api.get(`/asignaciones/buscar/resultados?${params}`);
        datos = res.data;
      }

      if (datos.length === 0) {
        setError(
          "No hay datos para generar el reporte con los filtros aplicados.",
        );
        return;
      }

      const nombreArchivo = `${reporte.titulo.replace(/\s+/g, "_")}_${hoy}`;

      if (formato === "excel") {
        exportarExcel(datos, reporte.columnas, nombreArchivo);
      } else {
        exportarPDF(datos, reporte.columnas, reporte.titulo, nombreArchivo);
      }

      // Limpiar inputs
      if (tipo === "historialPersona") setPersona("");
      if (tipo === "historialEquipo") setEquipo("");
      if (tipo === "historialUsuario") setUsuario("");
    } catch {
      setError("Error al generar el reporte.");
    }
  };

  const BotonesExportar = ({ tipo }) => (
    <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
      <Button
        size="small"
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={() => generarReporte(tipo, "excel")}
      >
        Excel
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        startIcon={<PictureAsPdfIcon />}
        onClick={() => generarReporte(tipo, "pdf")}
      >
        PDF
      </Button>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Reportes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2}>
        {/* Equipos */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #f0f0f0",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Equipos
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Lista completa de equipos registrados con su estado actual.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <BotonesExportar tipo="equipos" />
            </CardContent>
          </Card>
        </Grid>

        {/* Sin documento firmado */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #f0f0f0",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Sin documento firmado
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Asignaciones activas que aún no tienen constancia firmada
                subida.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <BotonesExportar tipo="sinDocumento" />
            </CardContent>
          </Card>
        </Grid>

        {/* Equipos por colaborador */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #f0f0f0",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Equipos por colaborador
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Equipos actualmente asignados a cada colaborador.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <BotonesExportar tipo="equiposPorColaborador" />
            </CardContent>
          </Card>
        </Grid>

        {/* Asignaciones por fecha */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #f0f0f0",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Asignaciones por rango de fechas
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Todas las asignaciones realizadas en el período seleccionado.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  size="small"
                  type="date"
                  label="Desde"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  type="date"
                  label="Hasta"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  slotProps={{ inputLabel: { shrink: true } }}
                  sx={{ flex: 1 }}
                />
              </Box>
              <BotonesExportar tipo="asignaciones" />
            </CardContent>
          </Card>
        </Grid>

        {/* Historial por persona */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #f0f0f0",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Historial por persona
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Todas las asignaciones de una persona. Dejar vacío para obtener
                todas.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                size="small"
                label="Nombre del colaborador"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
              />
              <BotonesExportar tipo="historialPersona" />
            </CardContent>
          </Card>
        </Grid>

        {/* Historial por equipo */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #f0f0f0",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Historial por equipo
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Todas las asignaciones de un equipo. Dejar vacío para obtener
                todas.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                size="small"
                label="Marca, modelo o serie"
                value={equipo}
                onChange={(e) => setEquipo(e.target.value)}
              />
              <BotonesExportar tipo="historialEquipo" />
            </CardContent>
          </Card>
        </Grid>

        {/* Historial por usuario */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              border: "1px solid #f0f0f0",
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600}>
                Historial por usuario
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Asignaciones realizadas por un usuario del sistema.
              </Typography>
              <Divider sx={{ my: 2 }} />
              <TextField
                fullWidth
                size="small"
                label="Nombre del usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
              <BotonesExportar tipo="historialUsuario" />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
