"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Grid,
  Tooltip,
  Fade,
  InputAdornment,
  Divider,
  Badge,
  alpha,
  FormControlLabel,
  Switch,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import GroupsIcon from "@mui/icons-material/Groups";
import CrownIcon from "@mui/icons-material/EmojiEvents";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SettingsIcon from "@mui/icons-material/Settings";
import { supabase } from "@/lib/supabaseClient";
import { useCollaboration, type RoomConfig } from "@/context/Collaboration";
import { useRouter } from "next/navigation";

// Função para gerar cor consistente baseada no nome
const stringToColor = (string: string) => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

// Função para formatar tempo relativo
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Agora mesmo";
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  return `${diffDays}d atrás`;
};

export default function LobbyPage() {
  const { createRoom, joinRoom, isInRoom } = useCollaboration();
  const router = useRouter();

  const [rooms, setRooms] = useState<any[]>([]);
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isJoinOpen, setJoinOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [inputRoomName, setInputRoomName] = useState("");
  const [inputUserName, setInputUserName] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<any | null>(null);
  const [createError, setCreateError] = useState("");
  const [joinError, setJoinError] = useState("");

  const [initialConfig, setInitialConfig] = useState<RoomConfig>({
    guestsCanEdit: false,
    guestsCanFilter: false,
  });

  // Se já estiver em sala, redireciona para a grade
  useEffect(() => {
    if (isInRoom) router.push("/atribuicoes");
  }, [isInRoom, router]);

  const fetchRooms = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from("rooms")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setRooms(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRooms();
    const channel = supabase
      .channel("lobby")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rooms" },
        fetchRooms
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleCreate = async () => {
    if (!inputRoomName.trim() || !inputUserName.trim()) {
      setCreateError("Preencha todos os campos");
      return;
    }
    try {
      setCreateError("");
      await createRoom(
        inputRoomName.trim(),
        inputUserName.trim(),
        initialConfig
      );
      setCreateOpen(false);
      setInputRoomName("");
      setInputUserName("");
      setInitialConfig({ guestsCanEdit: false, guestsCanFilter: false });
    } catch (e: any) {
      setCreateError(e.message || "Erro ao criar sala");
    }
  };

  const handleJoin = async () => {
    if (!selectedRoom || !inputUserName.trim()) {
      setJoinError("Informe seu nome");
      return;
    }
    try {
      setJoinError("");
      await joinRoom(selectedRoom.name, inputUserName.trim());
      setJoinOpen(false);
      setInputUserName("");
    } catch (e: any) {
      setJoinError(e.message || "Erro ao entrar na sala");
    }
  };

  const openJoin = (room: any) => {
    setSelectedRoom(room);
    setJoinError("");
    setJoinOpen(true);
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.owner_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 3,
            background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <GroupsIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  Salas de Colaboração
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Trabalhe em equipe em tempo real
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Atualizar lista de salas">
                <IconButton
                  onClick={fetchRooms}
                  sx={{
                    color: "white",
                    bgcolor: "rgba(255,255,255,0.1)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Criar uma nova sala de colaboração">
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setCreateError("");
                    setInitialConfig({
                      guestsCanEdit: false,
                      guestsCanFilter: false,
                    });
                    setCreateOpen(true);
                  }}
                  sx={{
                    bgcolor: "white",
                    color: "primary.main",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                  }}
                >
                  Criar Sala
                </Button>
              </Tooltip>
            </Box>
          </Box>
        </Paper>

        {/* Search Bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <TextField
            fullWidth
            placeholder="Buscar salas por nome ou criador..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#f5f5f5",
                "& fieldset": { border: "none" },
              },
            }}
          />
          <Chip
            icon={<MeetingRoomIcon />}
            label={`${rooms.length} sala${rooms.length !== 1 ? "s" : ""} ativa${
              rooms.length !== 1 ? "s" : ""
            }`}
            color="primary"
            variant="outlined"
          />
        </Paper>

        {/* Rooms Grid */}
        {isLoading ? (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography color="text.secondary">Carregando salas...</Typography>
          </Box>
        ) : filteredRooms.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: "center",
              borderRadius: 3,
              bgcolor: "white",
            }}
          >
            <MeetingRoomIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchQuery
                ? "Nenhuma sala encontrada"
                : "Nenhuma sala ativa no momento"}
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              {searchQuery
                ? "Tente buscar por outro termo"
                : "Seja o primeiro a criar uma sala de colaboração!"}
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
              >
                Criar Primeira Sala
              </Button>
            )}
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {filteredRooms.map((room, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={room.id}>
                <Fade in timeout={300 + index * 100}>
                  <Card
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                        borderColor: "primary.main",
                      },
                    }}
                  >
                    <CardContent sx={{ pb: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          mb: 2,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          <Avatar
                            sx={{
                              bgcolor: stringToColor(room.name),
                              width: 48,
                              height: 48,
                              fontWeight: "bold",
                            }}
                          >
                            {room.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: 180,
                              }}
                            >
                              {room.name}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <Tooltip title="Criador da sala (Líder)">
                                <CrownIcon
                                  sx={{ fontSize: 14, color: "warning.main" }}
                                />
                              </Tooltip>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {room.owner_name}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Tooltip title="Sala ativa - usuários podem entrar">
                          <Badge
                            variant="dot"
                            color="success"
                            sx={{
                              "& .MuiBadge-badge": {
                                animation: "pulse 2s infinite",
                                "@keyframes pulse": {
                                  "0%": { opacity: 1 },
                                  "50%": { opacity: 0.4 },
                                  "100%": { opacity: 1 },
                                },
                              },
                            }}
                          >
                            <Chip
                              size="small"
                              label="Ao Vivo"
                              color="success"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          </Badge>
                        </Tooltip>
                      </Box>

                      <Divider sx={{ my: 1.5 }} />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Tooltip title="Data de criação da sala">
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <AccessTimeIcon
                              sx={{ fontSize: 14, color: "text.disabled" }}
                            />
                            <Typography variant="caption" color="text.disabled">
                              {formatRelativeTime(room.created_at)}
                            </Typography>
                          </Box>
                        </Tooltip>
                        {room.config?.guestsCanEdit && (
                          <Tooltip title="Convidados podem editar a grade">
                            <Chip
                              size="small"
                              label="Edição liberada"
                              color="info"
                              variant="outlined"
                              sx={{ fontSize: "0.65rem", height: 20 }}
                            />
                          </Tooltip>
                        )}
                        {room.config?.guestsCanFilter && (
                          <Tooltip title="Convidados podem editar os filtros">
                            <Chip
                              size="small"
                              label="Filtros liberada"
                              color="info"
                              variant="outlined"
                              sx={{ fontSize: "0.65rem", height: 20 }}
                            />
                          </Tooltip>
                        )}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ px: 2, pb: 2 }}>
                      <Tooltip title="Entrar nesta sala como convidado">
                        <Button
                          fullWidth
                          variant="contained"
                          endIcon={<LoginIcon />}
                          onClick={() => openJoin(room)}
                          sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: "bold",
                          }}
                        >
                          Entrar na Sala
                        </Button>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* DIALOG CRIAR - Adicionada seção de configurações */}
      <Dialog
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <AddIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Criar Nova Sala
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Você será o líder desta sala
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 2 }}>
            <Tooltip
              title="Nome único que identifica sua sala"
              placement="top-start"
            >
              <TextField
                autoFocus
                label="Nome da Sala"
                placeholder="Ex: Reunião de Planejamento"
                fullWidth
                value={inputRoomName}
                onChange={(e) => setInputRoomName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MeetingRoomIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Tooltip>
            <Tooltip
              title="Como você será identificado na sala"
              placement="top-start"
            >
              <TextField
                label="Seu Nome (Líder)"
                placeholder="Ex: João Silva"
                fullWidth
                value={inputUserName}
                onChange={(e) => setInputUserName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Tooltip>

            <Divider sx={{ my: 1 }}>
              <Chip
                icon={<SettingsIcon sx={{ fontSize: 16 }} />}
                label="Configurações Iniciais"
                size="small"
                variant="outlined"
              />
            </Divider>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha("#1976d2", 0.03),
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={initialConfig.guestsCanEdit}
                    onChange={(e) =>
                      setInitialConfig({
                        ...initialConfig,
                        guestsCanEdit: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Convidados podem editar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Permite que convidados façam alterações na grade. Você
                      pode alterar isso depois.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", m: 0 }}
              />
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: alpha("#1976d2", 0.03),
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={initialConfig.guestsCanFilter}
                    onChange={(e) =>
                      setInitialConfig({
                        ...initialConfig,
                        guestsCanFilter: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Convidados podem filtrar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Permite que convidados façam alterações nos filtros grade.
                      Você pode alterar isso depois.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", m: 0 }}
              />
            </Paper>

            {createError && (
              <Typography color="error" variant="body2">
                {createError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2, fontWeight: "bold" }}
          >
            Criar Sala
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIALOG ENTRAR */}
      <Dialog
        open={isJoinOpen}
        onClose={() => setJoinOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "success.main" }}>
              <LoginIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Entrar em "{selectedRoom?.name}"
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Você entrará como convidado
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: alpha("#ff9800", 0.1),
                border: "1px solid",
                borderColor: alpha("#ff9800", 0.3),
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <CrownIcon sx={{ color: "warning.main", fontSize: 18 }} />
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="warning.dark"
                >
                  Líder da Sala: {selectedRoom?.owner_name}
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                O líder controla as permissões de edição da grade.
                {selectedRoom?.config?.guestsCanEdit
                  ? " Esta sala permite que convidados editem."
                  : " Esta sala está em modo somente leitura para convidados."}
              </Typography>
            </Box>
            <Tooltip
              title="Como você será identificado na sala"
              placement="top-start"
            >
              <TextField
                autoFocus
                label="Seu Nome"
                placeholder="Ex: Maria Santos"
                fullWidth
                value={inputUserName}
                onChange={(e) => setInputUserName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Tooltip>
            {joinError && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {joinError}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setJoinOpen(false)} sx={{ borderRadius: 2 }}>
            Cancelar
          </Button>
          <Button
            onClick={handleJoin}
            variant="contained"
            color="success"
            startIcon={<LoginIcon />}
            sx={{ borderRadius: 2, fontWeight: "bold" }}
          >
            Entrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
