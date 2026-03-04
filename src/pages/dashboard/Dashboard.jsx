import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
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

const COLORES = ["#4d8ef5", "#22c55e", "#e8a838", "#f87171"];

function StatCard({ icon, label, value, color }) {
  return (
    <Card elevation={0}>
      <CardContent
        sx={{ display: "flex", alignItems: "center", gap: 2, p: 2.5 }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            bgcolor: `${color}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Box sx={{ color }}>{icon}</Box>
        </Box>
        <Box>
          <Typography
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: "1.8rem",
              fontWeight: 700,
              color: "text.primary",
              lineHeight: 1,
              mb: 0.3,
            }}
          >
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

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            icon: <LaptopIcon />,
            label: "Total equipos",
            value: stats.totalEquipos,
            color: "#4d8ef5",
          },
          {
            icon: <PeopleIcon />,
            label: "Colaboradores",
            value: stats.totalPersonas,
            color: "#22c55e",
          },
          {
            icon: <AssignmentIcon />,
            label: "Asignaciones totales",
            value: stats.totalAsignaciones,
            color: "#e8a838",
          },
          {
            icon: <CheckCircleIcon />,
            label: "Asignaciones activas",
            value: stats.asignacionesActivas,
            color: "#f87171",
          },
        ].map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Asignaciones por mes
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.porMes}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f2efe9" />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "#9ca3af" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #edeae5",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                    cursor={{ fill: "#f7f5f2" }}
                  />
                  <Bar
                    dataKey="total"
                    fill="#4d8ef5"
                    radius={[6, 6, 0, 0]}
                    name="Asignaciones"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={0}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Estado de equipos
              </Typography>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Disponibles", value: stats.disponibles },
                      { name: "Asignados", value: stats.asignados },
                      { name: "Baja", value: stats.baja },
                    ]}
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={95}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {COLORES.map((color, i) => (
                      <Cell key={i} fill={color} />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(val) => (
                      <span style={{ fontSize: 12, color: "#9ca3af" }}>
                        {val}
                      </span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #edeae5",
                      borderRadius: 10,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {stats.porDepartamento.length > 0 && (
        <Card elevation={0}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>
              Equipos activos por departamento
            </Typography>
            <ResponsiveContainer
              width="100%"
              height={Math.max(150, stats.porDepartamento.length * 50)}
            >
              <BarChart data={stats.porDepartamento} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f2efe9" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tick={{ fontSize: 12, fill: "#9ca3af" }}
                  width={130}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid #edeae5",
                    borderRadius: 10,
                    fontSize: 12,
                  }}
                  cursor={{ fill: "#f7f5f2" }}
                />
                <Bar
                  dataKey="value"
                  fill="#22c55e"
                  radius={[0, 6, 6, 0]}
                  name="Equipos"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
