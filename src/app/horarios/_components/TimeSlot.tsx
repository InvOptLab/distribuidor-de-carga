"use client";

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Tooltip,
  Avatar,
  AvatarGroup,
} from "@mui/material";
import {
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import type { TimetableEntry } from "../page";

interface TimeSlotProps {
  entry: TimetableEntry;
  viewMode: "compact" | "detailed";
  onClick: () => void;
}

export default function TimeSlot({ entry, viewMode, onClick }: TimeSlotProps) {
  const { disciplina, docentes, inicio, fim, duracao } = entry;

  const hasDocentes = docentes.length > 0;
  const isInactive = !disciplina.ativo;

  if (viewMode === "compact") {
    return (
      <Tooltip
        title={
          <Box>
            <Typography variant="subtitle2">{disciplina.nome}</Typography>
            <Typography variant="caption">
              {inicio} - {fim} ({duracao}min)
            </Typography>
            {hasDocentes ? (
              <Typography variant="caption" display="block">
                Docentes: {docentes.join(", ")}
              </Typography>
            ) : (
              <Typography
                variant="caption"
                color="warning.main"
                display="block"
              >
                Sem docentes atribuídos
              </Typography>
            )}
          </Box>
        }
      >
        <Box
          onClick={onClick}
          sx={{
            p: 0.5,
            mb: 0.5,
            borderRadius: 1,
            cursor: "pointer",
            fontSize: "0.75rem",
            bgcolor: hasDocentes ? "success.50" : "warning.50",
            border: 1,
            borderColor: hasDocentes ? "success.200" : "warning.200",
            opacity: isInactive ? 0.6 : 1,
            "&:hover": {
              bgcolor: hasDocentes ? "success.100" : "warning.100",
            },
          }}
        >
          <Typography
            variant="caption"
            fontWeight="medium"
            noWrap
            sx={{ display: "block" }}
          >
            {disciplina.nome}
          </Typography>
          {hasDocentes ? (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{ display: "block" }}
            >
              {docentes.length === 1
                ? docentes[0]
                : `${docentes.length} docentes`}
            </Typography>
          ) : (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <WarningIcon sx={{ fontSize: 12, color: "warning.main" }} />
              <Typography variant="caption" color="warning.main">
                Não atribuído
              </Typography>
            </Box>
          )}
        </Box>
      </Tooltip>
    );
  }

  return (
    <Card
      variant="outlined"
      onClick={onClick}
      sx={{
        cursor: "pointer",
        height: "100%",
        opacity: isInactive ? 0.7 : 1,
        border: 2,
        borderColor: hasDocentes ? "success.200" : "warning.200",
        bgcolor: hasDocentes ? "success.50" : "warning.50",
        "&:hover": {
          borderColor: hasDocentes ? "success.400" : "warning.400",
          bgcolor: hasDocentes ? "success.100" : "warning.100",
          transform: "translateY(-2px)",
          boxShadow: 2,
        },
        transition: "all 0.2s ease-in-out",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Cabeçalho */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {disciplina.codigo}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {disciplina.nome}
            </Typography>
          </Box>
          {!hasDocentes && (
            <Tooltip title="Sem docentes atribuídos">
              <WarningIcon color="warning" sx={{ fontSize: 20 }} />
            </Tooltip>
          )}
        </Box>

        {/* Horário */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <ScheduleIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary">
            {inicio} - {fim}
          </Typography>
          <Chip label={`${duracao}min`} size="small" variant="outlined" />
        </Box>

        {/* Docentes */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
          {hasDocentes ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flex: 1,
                minWidth: 0,
              }}
            >
              <AvatarGroup
                max={2}
                sx={{
                  "& .MuiAvatar-root": {
                    width: 24,
                    height: 24,
                    fontSize: "0.75rem",
                  },
                }}
              >
                {docentes.map((docente, index) => (
                  <Avatar key={index} sx={{ bgcolor: "primary.main" }}>
                    {docente.charAt(0).toUpperCase()}
                  </Avatar>
                ))}
              </AvatarGroup>
              <Typography variant="caption" color="text.secondary" noWrap>
                {docentes.length === 1
                  ? docentes[0]
                  : `${docentes.length} docentes`}
              </Typography>
            </Box>
          ) : (
            <Typography variant="caption" color="warning.main">
              Não atribuído
            </Typography>
          )}
        </Box>

        {/* Informações adicionais */}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 1 }}>
          {disciplina.noturna && (
            <Chip
              label="Noturno"
              size="small"
              color="info"
              variant="outlined"
            />
          )}
          {disciplina.ingles && (
            <Chip
              label="Inglês"
              size="small"
              color="secondary"
              variant="outlined"
            />
          )}
          {!disciplina.ativo && (
            <Chip
              label="Inativo"
              size="small"
              color="default"
              variant="outlined"
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
