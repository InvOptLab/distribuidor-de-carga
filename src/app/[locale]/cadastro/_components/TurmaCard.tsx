"use client";

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Stack,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Class as ClassIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { Disciplina } from "@/algoritmo/communs/interfaces/interfaces";

interface TurmaCardProps {
  turma: Disciplina;
  onEdit: (turma: Disciplina) => void;
  onDelete: (turma: Disciplina) => void;
}

export default function TurmaCard({ turma, onEdit, onDelete }: TurmaCardProps) {
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid",
        borderColor: "divider",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.12)",
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        {/* Header com ícone e nome */}
        <Box
          sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 2 }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              backgroundColor: "primary.light",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ClassIcon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h3"
              noWrap
              title={turma.nome}
              sx={{ fontWeight: 600 }}
            >
              {turma.nome}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {turma.codigo} - Turma {turma.turma}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Informações principais */}
        <Stack spacing={1.5}>
          {turma.cursos && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.25 }}
              >
                Cursos
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {turma.cursos}
              </Typography>
            </Box>
          )}

          {turma.nivel && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.25 }}
              >
                Nível
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {turma.nivel}
              </Typography>
            </Box>
          )}

          {turma.carga && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mb: 0.25 }}
              >
                Carga Horária
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {turma.carga}h/semana
              </Typography>
            </Box>
          )}

          {/* Horários */}
          {turma.horarios && turma.horarios.length > 0 && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.5,
                }}
              >
                <TimeIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                <Typography variant="caption" color="text.secondary">
                  Horários
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                {turma.horarios.slice(0, 2).map((h, idx) => (
                  <Chip
                    key={idx}
                    label={`${h.dia} ${h.inicio}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: "0.7rem" }}
                  />
                ))}
                {turma.horarios.length > 2 && (
                  <Chip
                    label={`+${turma.horarios.length - 2} mais`}
                    size="small"
                    variant="filled"
                    sx={{ fontSize: "0.7rem" }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Status */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
            <Chip
              label={turma.ativo ? "Ativa" : "Inativa"}
              size="small"
              variant={turma.ativo ? "filled" : "outlined"}
              color={turma.ativo ? "success" : "default"}
              sx={{ fontWeight: 500 }}
            />
            {turma.noturna && (
              <Chip
                label="Noturna"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            )}
            {turma.ingles && (
              <Chip
                label="English"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>
        </Stack>
      </CardContent>

      <CardActions
        sx={{
          justifyContent: "flex-end",
          borderTop: 1,
          borderColor: "divider",
          gap: 0.5,
          pt: 1,
        }}
      >
        <Tooltip title="Editar turma">
          <IconButton
            size="small"
            onClick={() => onEdit(turma)}
            color="primary"
            sx={{
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: "primary.light",
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir turma">
          <IconButton
            size="small"
            onClick={() => onDelete(turma)}
            color="error"
            sx={{
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: "error.light",
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
