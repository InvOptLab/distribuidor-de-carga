"use client";
import { Horario } from "@/algoritmo/communs/interfaces/interfaces";
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Stack,
  alpha,
  Avatar,
  AvatarGroup,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Warning as WarningIcon,
  AddCircleOutline as AddIcon,
  RemoveCircleOutline as RemoveIcon,
  NightsStay as NightIcon,
  Language as LangIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { useState, MouseEvent } from "react";

type Props = {
  nome: string;
  codigo: string;
  turma: number;
  horarios: Horario[];
  prioridade: number;
  curso: string;
  carga: number;
  nivel: string;
  noturna: boolean;
  ingles: boolean;
  docentesAtribuidos?: string[];
  isAtribuida: boolean;
  isTravada?: boolean;
  hasConflict?: boolean;
  onAction: () => void;
  onTravar?: () => void;
  onClick?: () => void;
  canNavigate?: boolean;
};

export default function TurmaCard({
  nome,
  codigo,
  turma,
  horarios,
  prioridade,
  curso,
  carga,
  nivel,
  noturna,
  ingles,
  docentesAtribuidos = [],
  isAtribuida,
  isTravada = false,
  hasConflict = false,
  onAction,
  onTravar,
  onClick,
  canNavigate = true,
}: Props) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAction = () => {
    handleMenuClose();
    if (!isTravada || !isAtribuida) {
      onAction();
    }
  };

  const handleTravar = () => {
    handleMenuClose();
    onTravar?.();
  };

  const bgColor = isTravada
    ? alpha("#ff9800", 0.1)
    : hasConflict
      ? alpha("#d32f2f", 0.05)
      : isAtribuida
        ? alpha("#1976d2", 0.05)
        : "#fff";

  const borderColor = isTravada
    ? "#ff9800"
    : hasConflict
      ? "#d32f2f"
      : isAtribuida
        ? "#1976d2"
        : "#e0e0e0";

  return (
    <Paper
      elevation={isAtribuida ? 2 : 1}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation(); // Impede que o clique vaze para a linha (Row)
          onClick();
        }
      }}
      sx={{
        width: 280,
        minWidth: 280,
        p: 1.5,
        borderRadius: 2,
        bgcolor: bgColor,
        border: `1px solid ${borderColor}`,
        borderLeftWidth: isTravada ? 6 : hasConflict ? 6 : isAtribuida ? 4 : 1,
        transition: "all 0.2s ease-in-out",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: 3,
        },
      }}
    >
      {/* Indicadores no canto superior direito */}
      <Box position="absolute" top={8} right={8} display="flex" gap={0.5}>
        {isTravada && (
          <Tooltip title="Esta atribuição está travada">
            <LockIcon fontSize="small" sx={{ color: "warning.main" }} />
          </Tooltip>
        )}
        {hasConflict && (
          <Tooltip title="Choque de horário com outra disciplina">
            <WarningIcon fontSize="small" sx={{ color: "error.main" }} />
          </Tooltip>
        )}
      </Box>

      <Box>
        <Typography
          variant="subtitle2"
          fontWeight="bold"
          noWrap
          title={nome}
          sx={{ mr: 3, mb: 0.5 }}
        >
          {nome}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight="medium"
          >
            {codigo} — T{turma}
          </Typography>

          <Stack direction="row" spacing={0.5}>
            {noturna && (
              <Tooltip title="Curso Noturno">
                <NightIcon
                  fontSize="inherit"
                  sx={{ fontSize: 14, color: "indigo" }}
                />
              </Tooltip>
            )}
            {ingles && (
              <Tooltip title="Ministrada em Inglês">
                <LangIcon
                  fontSize="inherit"
                  sx={{ fontSize: 14, color: "teal" }}
                />
              </Tooltip>
            )}
            {nivel && (
              <Tooltip title={nivel === "g" ? "Graduação" : "Pós-graduação"}>
                <Chip
                  label={nivel.substring(0, 4)}
                  size="small"
                  variant="filled"
                  sx={{ height: 16, fontSize: "0.6rem", px: 0 }}
                  color={nivel === "g" ? "primary" : "secondary"}
                />
              </Tooltip>
            )}
          </Stack>
        </Stack>

        <Typography
          variant="caption"
          display="block"
          color="text.secondary"
          noWrap
          gutterBottom
        >
          {curso}
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center" my={1}>
          <Tooltip title={`Carga didática da turma ${codigo}-${turma}.`}>
            <Chip
              icon={
                <FitnessCenterIcon sx={{ fontSize: "0.8rem !important" }} />
              }
              label={`${carga}`}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                bgcolor: alpha("#000", 0.05),
              }}
            />
          </Tooltip>
          <Chip
            label={`Prioridade ${prioridade}`}
            size="small"
            color={prioridade > 0 ? "primary" : "default"}
            variant={prioridade > 0 ? "filled" : "outlined"}
            sx={{ height: 20, fontSize: "0.7rem" }}
          />
        </Stack>

        <Stack spacing={0.5} mt={1}>
          {horarios.length > 0 ? (
            horarios.map((h, i) => (
              <Chip
                key={i}
                icon={<TimeIcon sx={{ fontSize: "0.9rem !important" }} />}
                label={`${h.dia} ${h.inicio}-${h.fim}`}
                size="small"
                sx={{
                  justifyContent: "flex-start",
                  bgcolor: alpha("#000", 0.03),
                  height: 22,
                  fontSize: "0.75rem",
                }}
              />
            ))
          ) : (
            <Typography
              variant="caption"
              color="text.disabled"
              fontStyle="italic"
            >
              Sem horário definido
            </Typography>
          )}
        </Stack>
      </Box>

      <Box
        mt={2}
        pt={1}
        borderTop="1px dashed #e0e0e0"
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box display="flex" alignItems="center">
          {docentesAtribuidos.length > 0 ? (
            <AvatarGroup
              max={3}
              sx={{
                "& .MuiAvatar-root": {
                  width: 24,
                  height: 24,
                  fontSize: "0.7rem",
                },
              }}
            >
              {docentesAtribuidos.map((d) => (
                <Tooltip key={d} title={d}>
                  <Avatar alt={d}>{d.charAt(0)}</Avatar>
                </Tooltip>
              ))}
            </AvatarGroup>
          ) : (
            <Typography variant="caption" color="text.disabled">
              Nenhum docente
            </Typography>
          )}
        </Box>

        {/* Menu de Ações */}
        <Tooltip title="Ações">
          <span>
            <IconButton
              size="small"
              onClick={handleMenuOpen}
              disabled={!canNavigate}
              sx={{ bgcolor: alpha("#000", 0.05) }}
            >
              <MoreIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          {isAtribuida ? (
            <Box>
              <MenuItem onClick={handleAction} disabled={isTravada}>
                <ListItemIcon>
                  <RemoveIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>
                  {isTravada ? "Travado - Não pode remover" : "Remover"}
                </ListItemText>
              </MenuItem>
              <MenuItem onClick={handleTravar}>
                <ListItemIcon>
                  {isTravada ? (
                    <LockOpenIcon fontSize="small" color="warning" />
                  ) : (
                    <LockIcon fontSize="small" color="warning" />
                  )}
                </ListItemIcon>
                <ListItemText>
                  {isTravada ? "Destravar" : "Travar"}
                </ListItemText>
              </MenuItem>
            </Box>
          ) : (
            <Box>
              <MenuItem onClick={handleAction}>
                <ListItemIcon>
                  <AddIcon fontSize="small" color="primary" />
                </ListItemIcon>
                <ListItemText>Adicionar</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleTravar}>
                <ListItemIcon>
                  <LockIcon fontSize="small" color="warning" />
                </ListItemIcon>
                <ListItemText>Adicionar e Travar</ListItemText>
              </MenuItem>
            </Box>
          )}
        </Menu>
      </Box>
    </Paper>
  );
}
