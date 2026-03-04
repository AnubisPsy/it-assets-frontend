import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import LaptopIcon from "@mui/icons-material/Laptop";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../../services/api";

const COLORES = ["#1890ff", "#52c41a", "#faad14", "#ff4d4f"];

function StatCard({ icon, label, value, color }) {
  return (
    <Card
      elevation={0}
      sx={{ border: "1px solid #f0f0f0", borderRadius: 3, height: "100%" }}
    >
      <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, p: 3 }}>
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2,
            bgcolor: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [equiposRes, personasRes, asigRes] = await Promise.all([
          api.get("/equipos"),
          api.get("/personas"),
          api.get("/asignaciones"),
        ]);

        const equipos = equiposRes.data;
        const personas = personasRes.data;
        const asignaciones = asigRes.data;

        const disponibles = equipos.filter(
          (e) => e.estado === "disponible",
        ).length;
        const asignados = equipos.filter((e) => e.estado === "asignado").length;
        const baja = equipos.filter((e) => e.estado === "baja").length;
        const activas = asignaciones.filter((a) => a.activa).length;

        const ahora = new Date();
        const meses = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(
            ahora.getFullYear(),
            ahora.getMonth() - (5 - i),
            1,
          );
          return {
            mes: d.toLocaleString("es-HN", { month: "short" }),
            year: d.getFullYear(),
            month: d.getMonth(),
            total: 0,
          };
        });

        asignaciones.forEach((a) => {
          const fecha = new Date(a.fecha_asignacion);
          const m = meses.find(
            (m) =>
              m.month === fecha.getMonth() && m.year === fecha.getFullYear(),
          );
          if (m) m.total++;
        });

        const deptMap = {};
        asignaciones
          .filter((a) => a.activa)
          .forEach((a) => {
            deptMap[a.departamento] = (deptMap[a.departamento] || 0) + 1;
          });
        const porDepartamento = Object.entries(deptMap).map(
          ([name, value]) => ({ name, value }),
        );

        setStats({
          totalEquipos: equipos.length,
          totalPersonas: personas.length,
          totalAsignaciones: asignaciones.length,
          asignacionesActivas: activas,
          disponibles,
          asignados,
          baja,
          porMes: meses,
          porDepartamento,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  if (loading)
    return <Typography color="text.secondary">Cargando...</Typography>;
  if (!stats) return null;

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Dashboard
      </Typography>

      {/* Tarjetas */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            icon: <LaptopIcon />,
            label: "Total equipos",
            value: stats.totalEquipos,
            color: "#1890ff",
          },
          {
            icon: <PeopleIcon />,
            label: "Colaboradores",
            value: stats.totalPersonas,
            color: "#52c41a",
          },
          {
            icon: <AssignmentIcon />,
            label: "Asignaciones totales",
            value: stats.totalAsignaciones,
            color: "#faad14",
          },
          {
            icon: <CheckCircleIcon />,
            label: "Asignaciones activas",
            value: stats.asignacionesActivas,
            color: "#ff4d4f",
          },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Gráficos fila 1 */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            elevation={0}
            sx={{ border: "1px solid #f0f0f0", borderRadius: 3, p: 3 }}
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              Asignaciones por mes
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stats.porMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar
                  dataKey="total"
                  fill="#1890ff"
                  radius={[4, 4, 0, 0]}
                  name="Asignaciones"
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            elevation={0}
            sx={{ border: "1px solid #f0f0f0", borderRadius: 3, p: 3 }}
          >
            <Typography variant="h6" fontWeight={600} mb={2}>
              Estado de equipos
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Disponibles", value: stats.disponibles },
                    { name: "Asignados", value: stats.asignados },
                    { name: "Baja", value: stats.baja },
                  ]}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  dataKey="value"
                >
                  {COLORES.map((color, i) => (
                    <Cell key={i} fill={color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Grid>
      </Grid>

      {/* Departamentos */}
      {stats.porDepartamento.length > 0 && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={0}
              sx={{ border: "1px solid #f0f0f0", borderRadius: 3, p: 3 }}
            >
              <Typography variant="h6" fontWeight={600} mb={2}>
                Equipos activos por departamento
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <ResponsiveContainer
                width="100%"
                height={Math.max(150, stats.porDepartamento.length * 50)}
              >
                <BarChart data={stats.porDepartamento} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 12 }}
                    width={130}
                  />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    fill="#52c41a"
                    radius={[0, 4, 4, 0]}
                    name="Equipos"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
