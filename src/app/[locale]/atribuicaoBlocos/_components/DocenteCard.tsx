"use client";
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
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  AddCircleOutline as AddIcon,
  RemoveCircleOutline as RemoveIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import ArticleIcon from "@mui/icons-material/Article";
import { useState, MouseEvent } from "react";

type Props = {
  nome: string;
  saldo: number;
  prioridade: number;
  totalFormularios: number;
  cargaDidaticaAtribuida: number;
  maxCarga: number;
  isAtribuido: boolean;
  isTravado?: boolean;
  onAction: () => void;
  onTravar?: () => void;
  onClick?: () => void;
  canNavigate?: boolean;
};

export default function DocenteCard({
  nome,
  saldo,
  prioridade,
  totalFormularios,
  cargaDidaticaAtribuida,
  maxCarga,
  isAtribuido,
  isTravado = false,
  onAction,
  onTravar,
  onClick,
  canNavigate = true,
}: Props) {
  const srOnlyStyle = {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: 0,
  } as const;

  const bgColor = isTravado
    ? alpha("#ff9800", 0.1)
    : isAtribuido
      ? alpha("#1976d2", 0.05)
      : "#fff";
  const borderColor = isTravado
    ? "#ff9800"
    : isAtribuido
      ? "#1976d2"
      : "#e0e0e0";

  // Lógica de Cor do Saldo
  const saldoColor =
    saldo > 0 ? "success.main" : saldo < 0 ? "error.main" : "text.primary";
  const saldoTexto = saldo > 0 ? `+${saldo.toFixed(2)}` : saldo.toFixed(2);

  // Lógica da Barra de Progresso
  const progress =
    maxCarga > 0 ? Math.min((cargaDidaticaAtribuida / maxCarga) * 100, 100) : 0;
  const isOverload = maxCarga > 0 && cargaDidaticaAtribuida > maxCarga;

  return (
    <Paper
      elevation={isAtribuido ? 2 : 1}
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
        borderLeftWidth: isTravado ? 6 : isAtribuido ? 4 : 1,
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
      {/* Indicador de Trava */}
      {isTravado && (
        <Tooltip title="Esta atribuição está travada">
          <Box position="absolute" top={8} right={8} color="warning.main">
            <LockIcon fontSize="small" />
          </Box>
        </Tooltip>
      )}

      <Box>
        {/* Avatar e Nome */}
        <Box display="flex" alignItems="center" gap={1.5} mb={1}>
          <Avatar
            sx={{
              bgcolor: isTravado
                ? "warning.main"
                : isAtribuido
                  ? "primary.main"
                  : "grey.400",
              width: 40,
              height: 40,
            }}
          >
            {nome.charAt(0).toUpperCase()}
          </Avatar>
          <Box flex={1}>
            <Typography
              variant="subtitle2"
              fontWeight="bold"
              noWrap
              title={nome}
              sx={{ mr: isTravado ? 3 : 0 }}
            >
              {nome}
            </Typography>
            {/* Chip de Saldo */}
            <Chip
              label={`Saldo: ${saldoTexto}`}
              size="small"
              variant="outlined"
              sx={{
                fontWeight: "bold",
                color: saldoColor,
                borderColor: saldoColor,
                height: 20,
                fontSize: "0.7rem",
                mt: 0.5,
              }}
            />
          </Box>
        </Box>

        {/* Barra de Progresso da Carga */}
        <Box display="flex" alignItems="center" mt={1} mb={1}>
          <Box width="100%" mr={1}>
            <LinearProgress
              variant="determinate"
              value={progress}
              color={
                isOverload ? "error" : progress >= 100 ? "success" : "primary"
              }
              sx={{ height: 6, borderRadius: 3 }}
            />
          </Box>
          <Box minWidth={70}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="bold"
            >
              {cargaDidaticaAtribuida.toFixed(1)}h / {maxCarga.toFixed(1)}h
            </Typography>
          </Box>
        </Box>

        {/* Informações de Prioridade e Formulários */}
        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <Tooltip title="Prioridade informada para esta turma">
            <Chip
              label={`Prioridade ${prioridade}`}
              size="small"
              color={prioridade > 0 ? "primary" : "default"}
              variant={prioridade > 0 ? "filled" : "outlined"}
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          </Tooltip>
          <Tooltip title="Total de formulários preenchidos pelo docente">
            <Chip
              icon={<ArticleIcon sx={{ fontSize: "0.8rem !important" }} />}
              label={`${totalFormularios} form.`}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                bgcolor: alpha("#000", 0.05),
              }}
            />
          </Tooltip>
        </Stack>

        {/* Carga Didática Atribuída */}
        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <Tooltip title="Carga didática já atribuída ao docente">
            <Chip
              icon={
                <FitnessCenterIcon sx={{ fontSize: "0.8rem !important" }} />
              }
              label={`Carga: ${cargaDidaticaAtribuida.toFixed(2)}h`}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                bgcolor: alpha("#000", 0.05),
              }}
            />
          </Tooltip>
        </Stack>
      </Box>

      {/* Footer: Ações */}
      <Box
        mt={2}
        pt={1}
        borderTop="1px dashed #e0e0e0"
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        gap={1}
      >
        {/* Menu de Ações */}
        <Stack direction="row" spacing={1}>
          {/* Botão de Adicionar/Remover */}
          <Tooltip
            title={
              !canNavigate
                ? "Ação desabilitada"
                : isTravado
                  ? "Ação bloqueada (Item travado)"
                  : isAtribuido
                    ? "Remover atribuição"
                    : "Atribuir docente"
            }
          >
            <span onClick={(e) => e.stopPropagation()}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onAction();
                }}
                disabled={!canNavigate || isTravado}
                color={isAtribuido ? "error" : "primary"}
                sx={{
                  bgcolor: alpha(isAtribuido ? "#d32f2f" : "#1976d2", 0.05),
                }}
              >
                {isAtribuido ? (
                  <RemoveIcon fontSize="small" />
                ) : (
                  <AddIcon fontSize="small" />
                )}
                <span style={srOnlyStyle}>
                  {isAtribuido ? "Remover atribuição" : "Atribuir"}
                </span>
              </IconButton>
            </span>
          </Tooltip>

          {/* Botão de Travar/Destravar */}
          <Tooltip
            title={
              !canNavigate
                ? "Ação desabilitada"
                : isTravado
                  ? "Destravar"
                  : "Travar"
            }
          >
            <span onClick={(e) => e.stopPropagation()}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onTravar?.();
                }}
                disabled={!canNavigate}
                color="warning"
                sx={{ bgcolor: alpha("#ff9800", 0.05) }}
              >
                {isTravado ? (
                  <LockOpenIcon fontSize="small" />
                ) : (
                  <LockIcon fontSize="small" />
                )}
                <span style={srOnlyStyle}>
                  {isTravado ? "Destravar item" : "Travar item"}
                </span>
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>
    </Paper>
  );
}
