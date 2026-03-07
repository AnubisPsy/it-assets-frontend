import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorageIcon from "@mui/icons-material/Storage";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export default function Servidores() {
  const [servidores, setServidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [verificando, setVerificando] = useState({});

  useEffect(() => {
    socket.on("connect", () => {
      setError("");
    });

    socket.on("connect_error", () => {
      setError("No se pudo conectar al servidor en tiempo real");
    });

    socket.on("estado_servidores", (data) => {
      setServidores(data);
      setUltimaActualizacion(new Date());
      setLoading(false);
    });

    socket.on("estado_servidor", (data) => {
      setServidores((prev) => prev.map((s) => (s.id === data.id ? data : s)));
      setVerificando((prev) => ({ ...prev, [data.id]: false }));
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("estado_servidores");
      socket.off("estado_servidor");
    };
  }, []);

  const verificarUno = (id) => {
    setVerificando((prev) => ({ ...prev, [id]: true }));
    socket.emit("verificar_uno", id);
  };

  const online = servidores.filter((s) => s.estado === "online").length;
  const offline = servidores.filter((s) => s.estado === "offline").length;

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
          alignItems: "flex-start",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4">Servidores</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {ultimaActualizacion
              ? `Última verificación: ${ultimaActualizacion.toLocaleTimeString("es-HN")}`
              : "Conectando..."}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Chip
            label={`${online} en línea`}
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`${offline} fuera de línea`}
            color={offline > 0 ? "error" : "default"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            mt: 10,
          }}
        >
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">
            Verificando servidores...
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {servidores.map((servidor) => {
            const isOnline = servidor.estado === "online";
            const isVerificando = verificando[servidor.id];

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={servidor.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    border: "1px solid",
                    borderColor: isOnline ? "success.main" : "error.main",
                    borderRadius: 3,
                    opacity: isVerificando ? 0.7 : 1,
                    transition: "all 0.3s ease",
                    bgcolor: isOnline
                      ? "rgba(46, 125, 50, 0.04)"
                      : "rgba(211, 47, 47, 0.04)",
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: isOnline
                            ? "rgba(46, 125, 50, 0.12)"
                            : "rgba(211, 47, 47, 0.12)",
                        }}
                      >
                        <StorageIcon
                          sx={{
                            fontSize: 20,
                            color: isOnline ? "success.main" : "error.main",
                          }}
                        />
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Chip
                          label={isOnline ? "En línea" : "Fuera de línea"}
                          color={isOnline ? "success" : "error"}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                        />
                        <Tooltip title="Verificar ahora">
                          <IconButton
                            size="small"
                            onClick={() => verificarUno(servidor.id)}
                            disabled={isVerificando}
                            sx={{ ml: 0.5 }}
                          >
                            {isVerificando ? (
                              <CircularProgress size={14} />
                            ) : (
                              <RefreshIcon sx={{ fontSize: 16 }} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography variant="body1" fontWeight={700} mb={0.5}>
                      {servidor.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: "0.7rem",
                        mb: 1.5,
                      }}
                    >
                      {servidor.linkedServer}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        pt: 1.5,
                        borderTop: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          bgcolor: isOnline ? "success.main" : "error.main",
                          boxShadow: isOnline
                            ? "0 0 6px rgba(46, 125, 50, 0.6)"
                            : "none",
                          animation: isOnline ? "pulse 2s infinite" : "none",
                          "@keyframes pulse": {
                            "0%": { opacity: 1 },
                            "50%": { opacity: 0.4 },
                            "100%": { opacity: 1 },
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        fontSize="0.7rem"
                      >
                        {new Date(servidor.ultimo_check).toLocaleTimeString(
                          "es-HN",
                        )}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
