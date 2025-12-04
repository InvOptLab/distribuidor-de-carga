"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useCollaboration, type RoomConfig } from "@/context/Collaboration";
import {
  Paper,
  Typography,
  Button,
  Box,
  Avatar,
  AvatarGroup,
  Tooltip,
  Chip,
  IconButton,
  Collapse,
  Divider,
  Badge,
  alpha,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from "@mui/material";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CrownIcon from "@mui/icons-material/EmojiEvents";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import GroupsIcon from "@mui/icons-material/Groups";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import SettingsIcon from "@mui/icons-material/Settings";
import SyncIcon from "@mui/icons-material/Sync";
import { useGlobalContext } from "@/context/Global";

// =========================================================
// FUNÇÕES AUXILIARES DE CONVERSÃO (Map/Set <-> Array)
// =========================================================

const serializeContextData = (data: any) => {
  return {
    ...data,
    // Converte Map de formulários dentro de cada Docente para Array
    docentes: data.docentes.map((d: any) => ({
      ...d,
      formularios: d.formularios ? Array.from(d.formularios.entries()) : [],
    })),
    // Converte Set de conflitos dentro de cada Disciplina para Array
    disciplinas: data.disciplinas.map((d: any) => ({
      ...d,
      conflitos: d.conflitos ? Array.from(d.conflitos) : [],
    })),
  };
};

const deserializeContextData = (data: any) => {
  const result = { ...data };

  // Verifica se o campo existe antes de tentar mapear
  if (data.docentes) {
    result.docentes = data.docentes.map((d: any) => ({
      ...d,
      formularios: new Map(d.formularios),
    }));
  }

  if (data.disciplinas) {
    result.disciplinas = data.disciplinas.map((d: any) => ({
      ...d,
      conflitos: new Set(d.conflitos),
    }));
  }

  return result;
};

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

// O cursor visual (Avatar do colega)
const RemoteCursor = ({ cursor }: { cursor: any }) => (
  <div
    style={{
      position: "absolute",
      left: cursor.x,
      top: cursor.y,
      pointerEvents: "none",
      zIndex: 9999,
      transition: "all 0.1s ease-out",
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    }}
  >
    {/* Seta */}
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
        fill={cursor.color}
        stroke="white"
        strokeWidth="1"
      />
    </svg>
    {/* Nome com indicador de role */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        backgroundColor: cursor.color,
        color: "white",
        padding: "2px 8px",
        borderRadius: "4px",
        fontSize: "11px",
        whiteSpace: "nowrap",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
      }}
    >
      {cursor.isOwner && <CrownIcon sx={{ fontSize: 12, color: "#ffd700" }} />}
      {cursor.name}
    </Box>
  </div>
);

interface Props {
  children: React.ReactNode;
}

export const CollaborativeGridWrapper = ({ children }: Props) => {
  const {
    isInRoom,
    isOwner,
    cursors,
    broadcastMouse,
    leaveRoom,
    usersInRoom,
    roomName,
    userName,
    config,
    updateConfig,
    requestDataFromOwner,
    onDataRequest,
    broadcastDataUpdate,
    onDataUpdate,
    onAssignmentChange,
    broadcastAssignmentChange,
  } = useCollaboration();

  // Consumir o estado global para sincronização
  const {
    docentes,
    disciplinas,
    atribuicoes,
    formularios,
    travas,
    setDocentes,
    setDisciplinas,
    setAtribuicoes,
    setFormularios,
    setTravas,
  } = useGlobalContext();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<RoomConfig>(config);

  // =========================================================
  // LÓGICA DE SINCRONIZAÇÃO
  // =========================================================

  // LÍDER: Serializa e Envia Dados Completos (FULL_DATA) quando solicitado
  // Apenas o líder responde a "Pedidos de Dados" de novos entrantes.
  useEffect(() => {
    if (!isInRoom || !isOwner) return;

    const unsubscribe = onDataRequest(() => {
      const rawData = {
        docentes,
        disciplinas,
        atribuicoes,
        formularios,
        travas,
      };

      // Convertemos Map/Set para Array antes de enviar
      const serializedPayload = serializeContextData(rawData);

      console.log("📤 Líder enviando dados serializados...", serializedPayload);
      broadcastDataUpdate(serializedPayload, "FULL_DATA");
    });

    return () => unsubscribe();
  }, [
    isInRoom,
    isOwner,
    onDataRequest,
    broadcastDataUpdate,
    docentes,
    disciplinas,
    atribuicoes,
    formularios,
    travas,
  ]);

  // TODOS (Líder e Convidados): Recebem atualizações
  // IMPORTANTE: Removido '|| isOwner' para que o líder também receba edits dos convidados.
  useEffect(() => {
    if (!isInRoom) return;

    // Escuta pacotes de dados (FULL_DATA ou parciais)
    // Ex: Alguém rodou o algoritmo ou limpou a grade -> envia FULL_DATA
    const unsubscribeData = onDataUpdate((payload) => {
      if (payload.type === "FULL_DATA" && payload.data) {
        console.log("📥 Recebendo dados sincronizados:", payload.data);
        const hydratedData = deserializeContextData(payload.data);

        if (hydratedData.docentes) setDocentes(hydratedData.docentes);
        if (hydratedData.disciplinas) setDisciplinas(hydratedData.disciplinas);
        if (hydratedData.atribuicoes) setAtribuicoes(hydratedData.atribuicoes);
        if (hydratedData.formularios) setFormularios(hydratedData.formularios);
        if (hydratedData.travas) setTravas(hydratedData.travas);
      }
    });

    // Escuta mudanças pontuais na grade (Click/Add/Remove)
    const unsubscribeAssignment = onAssignmentChange((payload) => {
      if (payload.assignment) {
        console.log("📥 Atualização de atribuição recebida:", payload);
        setAtribuicoes((prev) => {
          const index = prev.findIndex(
            (a) => a.id_disciplina === payload.assignment.id_disciplina
          );
          if (index !== -1) {
            const newArr = [...prev];
            newArr[index] = payload.assignment;
            return newArr;
          }
          return [...prev, payload.assignment];
        });
      }
    });

    return () => {
      unsubscribeData();
      unsubscribeAssignment();
    };
  }, [
    isInRoom,
    onDataUpdate,
    onAssignmentChange,
    setDocentes,
    setDisciplinas,
    setAtribuicoes,
    setFormularios,
    setTravas,
  ]);

  // Se não estiver em sala, apenas renderiza a grade normal sem wrapper
  if (!isInRoom) return <>{children}</>;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      broadcastMouse(e.clientX - rect.left, e.clientY - rect.top);
    }
  };

  const canEdit = isOwner || config.guestsCanEdit;

  const handleOpenConfig = () => {
    setTempConfig(config);
    setConfigDialogOpen(true);
  };

  const handleSaveConfig = async () => {
    await updateConfig(tempConfig);
    setConfigDialogOpen(false);
  };

  const handleRequestSync = () => {
    requestDataFromOwner();
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, flex: 1 }}>
      {/* BARRA DE STATUS DA SALA */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid",
          borderColor: isOwner ? "primary.main" : "warning.main",
          background: isOwner
            ? "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)"
            : "linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)",
        }}
      >
        {/* Header principal */}
        <Box
          sx={{
            p: 1.5,
            px: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Indicador ao vivo */}
            <Tooltip title="Sala ativa - colaboração em tempo real">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Badge
                  variant="dot"
                  color="error"
                  sx={{
                    "& .MuiBadge-badge": {
                      animation: "pulse 1.5s infinite",
                      "@keyframes pulse": {
                        "0%": { transform: "scale(1)", opacity: 1 },
                        "50%": { transform: "scale(1.2)", opacity: 0.7 },
                        "100%": { transform: "scale(1)", opacity: 1 },
                      },
                    },
                  }}
                >
                  <SignalCellularAltIcon
                    sx={{ color: isOwner ? "primary.main" : "warning.main" }}
                  />
                </Badge>
                <Typography
                  variant="subtitle2"
                  fontWeight="bold"
                  color={isOwner ? "primary.main" : "warning.dark"}
                >
                  Ao Vivo
                </Typography>
              </Box>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            {/* Nome da sala */}
            <Tooltip title="Nome da sala de colaboração">
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <GroupsIcon
                  sx={{
                    fontSize: 20,
                    color: isOwner ? "primary.main" : "warning.main",
                  }}
                />
                <Typography variant="body2" fontWeight="medium">
                  {roomName}
                </Typography>
              </Box>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            {/* Seu papel na sala */}
            <Tooltip
              title={
                isOwner
                  ? "Você é o líder desta sala - tem controle total sobre a grade e permissões"
                  : "Você é um convidado - suas permissões são definidas pelo líder"
              }
            >
              <Chip
                icon={
                  isOwner ? (
                    <CrownIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                  )
                }
                label={isOwner ? "LÍDER" : "CONVIDADO"}
                size="small"
                sx={{
                  fontWeight: "bold",
                  bgcolor: isOwner
                    ? alpha("#1976d2", 0.15)
                    : alpha("#ed6c02", 0.15),
                  color: isOwner ? "primary.dark" : "warning.dark",
                  border: "1px solid",
                  borderColor: isOwner
                    ? alpha("#1976d2", 0.3)
                    : alpha("#ed6c02", 0.3),
                }}
              />
            </Tooltip>

            {/* Indicador de permissão de edição */}
            <Tooltip
              title={
                canEdit
                  ? "Você pode editar a grade"
                  : "Apenas visualização - o líder não liberou edição para convidados"
              }
            >
              <Chip
                icon={
                  canEdit ? (
                    <EditIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 14 }} />
                  )
                }
                label={canEdit ? "Pode Editar" : "Somente Leitura"}
                size="small"
                variant="outlined"
                color={canEdit ? "success" : "default"}
                sx={{ fontSize: "0.7rem" }}
              />
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Contador de usuários */}
            <Tooltip title="Usuários online nesta sala">
              <Chip
                icon={<GroupsIcon sx={{ fontSize: 16 }} />}
                label={`${usersInRoom} online`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: "medium" }}
              />
            </Tooltip>

            {!isOwner && (
              <Tooltip title="Solicitar sincronização de dados do líder">
                <IconButton
                  size="small"
                  onClick={handleRequestSync}
                  color="primary"
                >
                  <SyncIcon />
                </IconButton>
              </Tooltip>
            )}

            {isOwner && (
              <Tooltip title="Configurações da sala">
                <IconButton
                  size="small"
                  onClick={handleOpenConfig}
                  color="primary"
                >
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            )}

            {/* Botão expandir/recolher detalhes */}
            <Tooltip
              title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
            >
              <IconButton
                size="small"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>

            {/* Botão sair */}
            <Tooltip
              title={
                isOwner
                  ? "Sair e encerrar a sala (todos os convidados serão desconectados)"
                  : "Sair da sala"
              }
            >
              <Button
                size="small"
                color={isOwner ? "error" : "inherit"}
                variant={isOwner ? "contained" : "outlined"}
                onClick={leaveRoom}
                startIcon={<ExitToAppIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: "bold",
                }}
              >
                {isOwner ? "Encerrar Sala" : "Sair"}
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Detalhes expandidos */}
        <Collapse in={isExpanded}>
          <Divider />
          <Box
            sx={{
              p: 1.5,
              px: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              bgcolor: "rgba(255,255,255,0.5)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Seu nome:
              </Typography>
              <Chip
                avatar={
                  <Avatar
                    sx={{
                      bgcolor: stringToColor(userName || ""),
                      width: 24,
                      height: 24,
                      fontSize: "0.75rem",
                    }}
                  >
                    {userName?.charAt(0).toUpperCase()}
                  </Avatar>
                }
                label={userName}
                size="small"
                sx={{ fontWeight: "medium" }}
              />
            </Box>

            {/* Avatares dos usuários online */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Participantes:
              </Typography>
              <AvatarGroup
                max={5}
                sx={{
                  "& .MuiAvatar-root": {
                    width: 28,
                    height: 28,
                    fontSize: "0.75rem",
                    border: "2px solid white",
                  },
                }}
              >
                {/* Avatar do usuário atual */}
                <Tooltip title={`${userName} (Você)`}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    badgeContent={
                      isOwner ? (
                        <CrownIcon
                          sx={{
                            fontSize: 12,
                            color: "#ffd700",
                            bgcolor: "white",
                            borderRadius: "50%",
                          }}
                        />
                      ) : null
                    }
                  >
                    <Avatar
                      sx={{
                        bgcolor: stringToColor(userName || ""),
                        border: "2px solid",
                        borderColor: isOwner ? "primary.main" : "warning.main",
                      }}
                    >
                      {userName?.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </Tooltip>

                {/* Avatares dos outros usuários (cursors) */}
                {Object.values(cursors).map((cursor: any) => (
                  <Tooltip
                    key={cursor.userId}
                    title={`${cursor.name}${
                      cursor.isOwner ? " (Líder)" : " (Convidado)"
                    }`}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                      badgeContent={
                        cursor.isOwner ? (
                          <CrownIcon
                            sx={{
                              fontSize: 12,
                              color: "#ffd700",
                              bgcolor: "white",
                              borderRadius: "50%",
                            }}
                          />
                        ) : null
                      }
                    >
                      <Avatar sx={{ bgcolor: cursor.color }}>
                        {cursor.name?.charAt(0).toUpperCase()}
                      </Avatar>
                    </Badge>
                  </Tooltip>
                ))}
              </AvatarGroup>
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* ÁREA DA GRADE COM RASTREAMENTO */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{ position: "relative", flex: 1, display: "flex" }}
      >
        {/* Renderiza a Grade Original */}
        {children}

        {/* Renderiza os Cursores por cima */}
        {Object.values(cursors).map((c: any) => (
          <RemoteCursor key={c.userId} cursor={c} />
        ))}
      </div>

      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "primary.main" }}>
              <SettingsIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Configurações da Sala
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Gerencie as permissões e comportamentos
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
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
                    checked={tempConfig.guestsCanEdit}
                    onChange={(e) =>
                      setTempConfig({
                        ...tempConfig,
                        guestsCanEdit: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      Convidados podem editar
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Quando ativado, todos os convidados poderão fazer
                      alterações na grade de atribuições. Quando desativado,
                      apenas você (líder) poderá editar.
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", m: 0 }}
              />
            </Paper>

            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: alpha("#ff9800", 0.1),
                borderRadius: 2,
              }}
            >
              <Typography variant="body2" color="warning.dark">
                <strong>Nota:</strong> As alterações serão aplicadas
                imediatamente para todos os participantes da sala.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setConfigDialogOpen(false)}
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSaveConfig}
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: "bold" }}
          >
            Salvar Configurações
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
