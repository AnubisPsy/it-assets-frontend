import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import RefreshIcon from "@mui/icons-material/Refresh";
import StorageIcon from "@mui/icons-material/Storage";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import { io } from "socket.io-client";

const socket = io("http://192.168.0.233:6060");

const MarqueeName = ({ nombre }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [overflow, setOverflow] = useState(0);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const textWidth = textRef.current.offsetWidth;
    setOverflow(Math.max(0, textWidth - containerWidth));
  }, [nombre]);

  return (
    <Box ref={containerRef} sx={{ flex: 1, overflow: "hidden", minWidth: 0 }}>
      <Typography
        ref={textRef}
        style={overflow > 0 ? { "--scroll-px": `-${overflow}px` } : undefined}
        sx={{
          fontFamily: "'Outfit', sans-serif",
          fontWeight: 700,
          fontSize: "1.6rem",
          lineHeight: 1.3,
          whiteSpace: "nowrap",
          display: "inline-block",
          ...(overflow > 0 && {
            animation: "scroll-name 10s ease-in-out infinite",
            "@keyframes scroll-name": {
              "0%, 15%": { transform: "translateX(0)" },
              "50%, 65%": { transform: "translateX(var(--scroll-px))" },
              "100%": { transform: "translateX(0)" },
            },
          }),
        }}
      >
        {nombre}
      </Typography>
    </Box>
  );
};

const GrupoCards = ({ titulo, icono, items, tipo, verificando, onVerificar }) => {
  const online = items.filter((s) => s.estado === "online").length;
  const offline = items.filter((s) => s.estado === "offline").length;

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {icono}
          <Typography variant="h6" fontWeight={700}>
            {titulo}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Chip
            label={`${online} en línea`}
            color="success"
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Chip
            label={`${offline} fuera`}
            color={offline > 0 ? "error" : "default"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 2,
          alignContent: "start",
        }}
      >
        {items.map((servidor) => {
          const isOnline = servidor.estado === "online";
          const isVerificando = verificando[`${tipo}-${servidor.id}`];

          return (
            <Card
              key={servidor.id}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: isOnline ? "success.main" : "error.main",
                borderRadius: 3,
                opacity: isVerificando ? 0.7 : 1,
                transition: "all 0.3s ease",
                bgcolor: isOnline
                  ? "rgba(46, 125, 50, 0.04)"
                  : "rgba(211, 47, 47, 0.04)",
                overflow: "hidden",
              }}
            >
              <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
                {/* Nombre + botón de refresco */}
                <Box
                  sx={{
                    px: 2,
                    pt: 2,
                    pb: 2,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 1,
                  }}
                >
                  <MarqueeName nombre={servidor.nombre} />
                  <Tooltip title="Verificar ahora">
                    <IconButton
                      size="small"
                      onClick={() => onVerificar(tipo, servidor.id)}
                      disabled={isVerificando}
                      sx={{ mt: -0.5, mr: -0.5, flexShrink: 0 }}
                    >
                      {isVerificando ? (
                        <CircularProgress size={12} />
                      ) : (
                        <RefreshIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>

                {/* Barra inferior: hora | ip | círculo */}
                <Box
                  sx={{
                    display: "flex",
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      py: 1.25,
                      px: 1.5,
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      noWrap
                      sx={{ fontSize: "0.63rem" }}
                    >
                      {new Date(servidor.ultimo_check).toLocaleTimeString(
                        "es-HN",
                      )}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: 1.2,
                      py: 1.25,
                      px: 1.5,
                      borderRight: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography
                      color="text.secondary"
                      noWrap
                      sx={{
                        fontSize: "0.63rem",
                        fontFamily: "'DM Mono', monospace",
                      }}
                    >
                      {tipo === "biometrico"
                        ? servidor.ip
                        : servidor.linkedServer}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: 0.5,
                      py: 1.25,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        flexShrink: 0,
                        bgcolor: isOnline ? "success.main" : "error.main",
                        boxShadow: isOnline
                          ? "0 0 8px rgba(34, 197, 94, 0.7)"
                          : "0 0 6px rgba(248, 113, 113, 0.5)",
                        animation: isOnline ? "pulse 2s infinite" : "none",
                        "@keyframes pulse": {
                          "0%": {
                            opacity: 1,
                            boxShadow: "0 0 6px rgba(34, 197, 94, 0.5)",
                          },
                          "50%": {
                            opacity: 0.7,
                            boxShadow: "0 0 14px rgba(34, 197, 94, 1)",
                          },
                          "100%": {
                            opacity: 1,
                            boxShadow: "0 0 6px rgba(34, 197, 94, 0.5)",
                          },
                        },
                      }}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default function Servidores() {
  const [servidores, setServidores] = useState([]);
  const [biometricos, setBiometricos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const [verificando, setVerificando] = useState({});

  useEffect(() => {
    socket.on("connect_error", () => {
      setError("No se pudo conectar al servidor en tiempo real");
    });

    socket.on("estado_servidores", (data) => {
      setServidores(data.servidores);
      setBiometricos(data.biometricos);
      setUltimaActualizacion(new Date());
      setLoading(false);
    });

    socket.on("estado_servidor", ({ tipo, datos }) => {
      if (tipo === "biometrico") {
        setBiometricos((prev) =>
          prev.map((s) => (s.id === datos.id ? datos : s)),
        );
      } else {
        setServidores((prev) =>
          prev.map((s) => (s.id === datos.id ? datos : s)),
        );
      }
      setVerificando((prev) => ({ ...prev, [`${tipo}-${datos.id}`]: false }));
    });

    return () => {
      socket.off("connect_error");
      socket.off("estado_servidores");
      socket.off("estado_servidor");
    };
  }, []);

  const verificarUno = (tipo, id) => {
    setVerificando((prev) => ({ ...prev, [`${tipo}-${id}`]: true }));
    socket.emit("verificar_uno", { tipo, id });
  };

  const totalOnline =
    servidores.filter((s) => s.estado === "online").length +
    biometricos.filter((s) => s.estado === "online").length;
  const totalOffline =
    servidores.filter((s) => s.estado === "offline").length +
    biometricos.filter((s) => s.estado === "offline").length;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 48px)",
      }}
    >
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
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="h4">Monitoreo</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {ultimaActualizacion
              ? `Última verificación: ${ultimaActualizacion.toLocaleTimeString("es-HN")}`
              : "Conectando..."}
          </Typography>
        </Box>
        {!loading && (
          <Box sx={{ display: "flex", gap: 1 }}>
            <Chip
              label={`${totalOnline} en línea`}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Chip
              label={`${totalOffline} fuera de línea`}
              color={totalOffline > 0 ? "error" : "default"}
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        )}
      </Box>

      {loading ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <CircularProgress size={36} />
          <Typography variant="body2" color="text.secondary">
            Verificando...
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            gap: 3,
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          <Box sx={{ flex: 1, overflow: "auto", minWidth: 0 }}>
            <GrupoCards
              titulo="Servidores"
              icono={<StorageIcon sx={{ color: "text.secondary" }} />}
              items={servidores}
              tipo="servidor"
              verificando={verificando}
              onVerificar={verificarUno}
            />
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ flex: 1, overflow: "auto", minWidth: 0 }}>
            <GrupoCards
              titulo="Biométricos"
              icono={<FingerprintIcon sx={{ color: "text.secondary" }} />}
              items={biometricos}
              tipo="biometrico"
              verificando={verificando}
              onVerificar={verificarUno}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
