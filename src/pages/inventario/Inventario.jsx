import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import LaptopIcon from "@mui/icons-material/Laptop";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import api from "../../services/api";

const estadoColor = {
  disponible: "success",
  asignado: "warning",
  baja: "error",
};

export default function Inventario() {
  const [equipos, setEquipos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandidos, setExpandidos] = useState({});

  const cargarDatos = async () => {
    try {
      const [resEquipos, resTipos, resInsumos, resCategorias] =
        await Promise.all([
          api.get("/equipos/inventario"),
          api.get("/tipos-equipo"),
          api.get("/insumos"),
          api.get("/insumos/categorias"),
        ]);
      setEquipos(resEquipos.data);
      setTipos(resTipos.data);
      setInsumos(resInsumos.data);
      setCategorias(resCategorias.data);
    } catch {
      setError("Error al cargar inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const toggleExpandir = (id) =>
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));

  // Agrupar equipos por tipo
  const equiposPorTipo = tipos
    .map((tipo) => {
      const items = equipos.filter((e) => e.tipo_id === tipo.id);
      const disponibles = items.filter((e) => e.estado === "disponible").length;
      const asignados = items.filter((e) => e.estado === "asignado").length;
      const baja = items.filter((e) => e.estado === "baja").length;
      return {
        ...tipo,
        items,
        total: items.length,
        disponibles,
        asignados,
        baja,
      };
    })
    .filter((t) => t.total > 0);

  // Agrupar insumos por categoría
  const insumosPorCategoria = [
    ...categorias.map((cat) => ({
      categoria: cat,
      items: insumos.filter((i) => i.categoria === cat),
    })),
    {
      categoria: "Sin categoría",
      items: insumos.filter((i) => !i.categoria),
    },
  ].filter((g) => g.items.length > 0);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 10,
        }}
      >
        <CircularProgress size={36} />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Typography variant="h4" mb={4}>
        Inventario
      </Typography>

      {/* Equipos */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <LaptopIcon color="action" />
        <Typography variant="h6" fontWeight={700}>
          Equipos
        </Typography>
      </Box>

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          mb: 5,
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "background.default" }}>
                <TableCell sx={{ width: 40 }} />
                <TableCell>
                  <Typography variant="subtitle1">Tipo</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Total</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Disponibles</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Asignados</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle1">Baja</Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {equiposPorTipo.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No hay equipos registrados.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                equiposPorTipo.map((tipo) => (
                  <>
                    <TableRow key={tipo.id} hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleExpandir(tipo.id)}
                        >
                          {expandidos[tipo.id] ? (
                            <ExpandLessIcon fontSize="small" />
                          ) : (
                            <ExpandMoreIcon fontSize="small" />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" fontWeight={600}>
                          {tipo.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {tipo.total}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tipo.disponibles}
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tipo.asignados}
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={tipo.baja}
                          color={tipo.baja > 0 ? "error" : "default"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>

                    <TableRow key={`${tipo.id}-detalle`}>
                      <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                        <Collapse in={expandidos[tipo.id]}>
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
                                      Marca / Modelo
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                    >
                                      Serie
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
                                  <TableCell>
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                    >
                                      Asignado a
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                    >
                                      Departamento
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography
                                      variant="caption"
                                      fontWeight={600}
                                    >
                                      Fecha asignación
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tipo.items.map((equipo) => (
                                  <TableRow key={equipo.id}>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                      >
                                        {equipo.marca}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        {equipo.modelo}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontFamily: "'DM Mono', monospace",
                                          fontSize: "0.75rem",
                                        }}
                                      >
                                        {equipo.serie}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={equipo.estado}
                                        color={
                                          estadoColor[equipo.estado] ||
                                          "default"
                                        }
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {equipo.persona_nombre || "—"}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {equipo.departamento || "—"}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {equipo.fecha_asignacion
                                          ? new Date(
                                              equipo.fecha_asignacion,
                                            ).toLocaleDateString("es-HN")
                                          : "—"}
                                      </Typography>
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

      <Divider sx={{ mb: 4 }} />

      {/* Insumos */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
        <InventoryIcon color="action" />
        <Typography variant="h6" fontWeight={700}>
          Insumos
        </Typography>
      </Box>

      {insumosPorCategoria.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No hay insumos registrados.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {insumosPorCategoria.map((grupo) => (
            <Box key={grupo.categoria}>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                {grupo.categoria}
              </Typography>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                }}
              >
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "background.default" }}>
                        <TableCell>
                          <Typography variant="caption" fontWeight={600}>
                            Nombre
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" fontWeight={600}>
                            Stock actual
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" fontWeight={600}>
                            Stock mínimo
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" fontWeight={600}>
                            Estado
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {grupo.items.map((insumo) => {
                        const stockBajo = insumo.stock <= insumo.stock_minimo;
                        return (
                          <TableRow key={insumo.id} hover>
                            <TableCell>
                              <Typography variant="body2" fontWeight={500}>
                                {insumo.nombre}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color={
                                  stockBajo ? "error.main" : "text.primary"
                                }
                              >
                                {insumo.stock}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {insumo.stock_minimo}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              {stockBajo ? (
                                <Tooltip title="Stock bajo o agotado">
                                  <Chip
                                    icon={<WarningAmberIcon />}
                                    label="Stock bajo"
                                    color="error"
                                    size="small"
                                  />
                                </Tooltip>
                              ) : (
                                <Chip
                                  label="Normal"
                                  color="success"
                                  size="small"
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
