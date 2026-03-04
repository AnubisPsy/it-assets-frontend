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

  const ReporteCard = ({ titulo, descripcion, tipo, children }) => (
    <Card elevation={0} sx={{ height: "100%" }}>
      <CardContent
        sx={{ p: 3, height: "100%", display: "flex", flexDirection: "column" }}
      >
        <Typography variant="h6" fontWeight={600}>
          {titulo}
        </Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5} mb={2}>
          {descripcion}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {children}
        <BotonesExportar tipo={tipo} />
      </CardContent>
    </Card>
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
        <Grid size={{ xs: 12, md: 6 }}>
          <ReporteCard
            tipo="equipos"
            titulo="Equipos"
            descripcion="Lista completa de equipos registrados con su estado actual."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ReporteCard
            tipo="sinDocumento"
            titulo="Sin documento firmado"
            descripcion="Asignaciones activas que aún no tienen constancia firmada subida."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ReporteCard
            tipo="equiposPorColaborador"
            titulo="Equipos por colaborador"
            descripcion="Equipos actualmente asignados a cada colaborador."
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ReporteCard
            tipo="asignaciones"
            titulo="Asignaciones por rango de fechas"
            descripcion="Todas las asignaciones realizadas en el período seleccionado."
          >
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
          </ReporteCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReporteCard
            tipo="historialPersona"
            titulo="Historial por persona"
            descripcion="Todas las asignaciones de una persona. Dejar vacío para obtener todas."
          >
            <TextField
              fullWidth
              size="small"
              label="Nombre del colaborador"
              value={persona}
              onChange={(e) => setPersona(e.target.value)}
            />
          </ReporteCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReporteCard
            tipo="historialEquipo"
            titulo="Historial por equipo"
            descripcion="Todas las asignaciones de un equipo. Dejar vacío para obtener todas."
          >
            <TextField
              fullWidth
              size="small"
              label="Marca, modelo o serie"
              value={equipo}
              onChange={(e) => setEquipo(e.target.value)}
            />
          </ReporteCard>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ReporteCard
            tipo="historialUsuario"
            titulo="Historial por usuario"
            descripcion="Asignaciones realizadas por un usuario del sistema."
          >
            <TextField
              fullWidth
              size="small"
              label="Nombre del usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />
          </ReporteCard>
        </Grid>
      </Grid>
    </Box>
  );
}
