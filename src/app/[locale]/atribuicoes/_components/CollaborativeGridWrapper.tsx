"use client";

import type React from "react";
import { useRef, useState } from "react";
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
  useTheme,
  type Theme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
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
import { Alert } from "@mui/material";
import { useTranslations } from "next-intl";

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

function roleColors(theme: Theme) {
  return { owner: theme.palette.primary.main, guest: theme.palette.warning.main };
}

export const CollaborativeGridWrapper = ({ children }: Props) => {
  // Cores da barra derivadas do tema (claro/escuro/alto contraste), sem gradientes fixos
  const theme = useTheme();
  const roleColor = roleColors(theme);
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
    ownerOnline,
    presenceReady,
  } = useCollaboration();

  const t = useTranslations("Pages.Assignment.CollaborativeGridWrapper");

  const containerRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState<RoomConfig>(config);

  const lastMouseUpdate = useRef(0);

  // A sincronização dos dados (receber, responder a quem entra) fica no
  // CollaborationSync, montado no layout, para funcionar em qualquer página.

  // Se não estiver em sala, apenas renderiza a grade normal sem wrapper
  if (!isInRoom) return <>{children}</>;

  const handleMouseMove = (e: React.MouseEvent) => {
    const now = Date.now();
    // Só envia pacote se tiver passado 50 milissegundos desde o último
    if (now - lastMouseUpdate.current > 50) {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        broadcastMouse(e.clientX - rect.left, e.clientY - rect.top);
        lastMouseUpdate.current = now;
      }
    }
  };

  const canEdit = isOwner || config.guestsCanEdit;
  const canFilter = isOwner || config.guestsCanFilter;

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1,
        flex: 1,
        width: "100%",
        overflowX: "hidden",
        // height: 100,
      }}
    >
      {/* BARRA DE STATUS DA SALA */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          border: "1px solid",
          borderColor: isOwner ? "primary.main" : "warning.main",
          bgcolor: alpha(isOwner ? roleColor.owner : roleColor.guest, 0.08),
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
                  {t("live")}
                </Typography>
              </Box>
            </Tooltip>

            <Divider orientation="vertical" flexItem />

            {/* Nome da sala */}
            <Tooltip title={t("collaborationRoomName")}>
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
              title={isOwner ? t("leaderDescription") : t("guestDescription")}
            >
              <Chip
                icon={
                  isOwner ? (
                    <CrownIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 16 }} />
                  )
                }
                label={isOwner ? t("leaderBadge") : t("guestBadge")}
                size="small"
                sx={{
                  fontWeight: "bold",
                  bgcolor: isOwner
                    ? alpha(roleColor.owner, 0.15)
                    : alpha(roleColor.guest, 0.15),
                  color: isOwner ? "primary.dark" : "warning.dark",
                  border: "1px solid",
                  borderColor: isOwner
                    ? alpha(roleColor.owner, 0.3)
                    : alpha(roleColor.guest, 0.3),
                }}
              />
            </Tooltip>

            {/* Indicadores de Permissão */}
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Tooltip
                title={canEdit ? t("editingAllowed") : t("editingBlocked")}
              >
                <Chip
                  icon={<EditIcon sx={{ fontSize: 14 }} />}
                  label={canEdit ? t("canEdit") : t("readOnly")}
                  size="small"
                  color={canEdit ? "success" : "default"}
                />
              </Tooltip>
              <Tooltip
                title={canFilter ? t("filtersAllowed") : t("filtersBlocked")}
              >
                <Chip
                  icon={<FilterListIcon sx={{ fontSize: 14 }} />}
                  label={canFilter ? t("canFilter") : t("filterSync")}
                  size="small"
                  color={canFilter ? "info" : "default"}
                />
              </Tooltip>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Contador de usuários */}
            <Tooltip title={t("usersOnline")}>
              <Chip
                icon={<GroupsIcon sx={{ fontSize: 16 }} />}
                label={`${usersInRoom} online`}
                size="small"
                variant="outlined"
                sx={{ fontWeight: "medium" }}
              />
            </Tooltip>

            {/* Convidado: pede o estado ao líder. Líder: reenvia o seu a todos. */}
            <Tooltip title={isOwner ? t("pushSync") : t("requestSync")}>
              <IconButton
                size="small"
                onClick={handleRequestSync}
                color="primary"
                aria-label={isOwner ? t("pushSync") : t("requestSync")}
              >
                <SyncIcon />
              </IconButton>
            </Tooltip>

            {isOwner && (
              <Tooltip title={t("roomSettingsTooltip")}>
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
              title={isExpanded ? t("collapseDetails") : t("expandDetails")}
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
                isOwner ? t("leaveAndEndRoomTooltip") : t("leaveRoomTooltip")
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
                {isOwner ? t("endRoom") : t("leave")}
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
              bgcolor: alpha(theme.palette.background.paper, 0.5),
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                {t("yourName")}
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
                {t("participants")}
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
                <Tooltip title={t("youSuffix", { userName: userName })}>
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
                      cursor.isOwner ? t("leaderSuffix") : t("guestSuffix")
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

      {/* Líder fechou a aba ou perdeu a conexão: avisa os convidados */}
      {!isOwner && presenceReady && !ownerOnline && (
        <Alert severity="warning" variant="outlined" role="status">
          {t("ownerOffline")}
        </Alert>
      )}

      {/* ÁREA DA GRADE */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        style={{
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
          minHeight: 0,
        }}
      >
        {children}
        {Object.values(cursors).map((c: any) => (
          <RemoteCursor key={c.userId} cursor={c} />
        ))}
      </div>

      {/* DIALOG DE CONFIGURAÇÃO ATUALIZADO */}
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
                {t("roomSettingsTitle")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("managePermissions")}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Switch de Edição */}
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, bgcolor: alpha(roleColor.owner, 0.03) }}
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
                      {t("guestsCanEdit")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("guestsCanEditDescription")}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", m: 0 }}
              />
            </Paper>

            {/* NOVO: Switch de Filtro */}
            <Paper
              variant="outlined"
              sx={{ p: 2, borderRadius: 2, bgcolor: alpha(roleColor.owner, 0.03) }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={tempConfig.guestsCanFilter ?? false}
                    onChange={(e) =>
                      setTempConfig({
                        ...tempConfig,
                        guestsCanFilter: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" fontWeight="medium">
                      {t("guestsCanFilter")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t("guestsCanFilterDescription")}
                    </Typography>
                  </Box>
                }
                sx={{ alignItems: "flex-start", m: 0 }}
              />
            </Paper>

            <Box sx={{ p: 2, bgcolor: alpha(roleColor.guest, 0.1), borderRadius: 2 }}>
              <Typography variant="body2" color="warning.dark">
                <strong>{t("noteLabel")}</strong>{" "}
                {t("changesAppliedImmediately")}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfigDialogOpen(false)}>
            {t("cancel")}
          </Button>
          <Button onClick={handleSaveConfig} variant="contained">
            {t("saveSettings")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
