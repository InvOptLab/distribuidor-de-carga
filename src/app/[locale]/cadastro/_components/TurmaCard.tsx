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
import { useTranslations } from "next-intl";

interface TurmaCardProps {
  turma: Disciplina;
  onEdit: (turma: Disciplina) => void;
  onDelete: (turma: Disciplina) => void;
}

export default function TurmaCard({ turma, onEdit, onDelete }: TurmaCardProps) {
  const t = useTranslations("Pages.Cadastro.Components.TurmaCard");
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        backgroundImage: "linear-gradient(145deg, rgba(25, 118, 210, 0.02) 0%, transparent 100%)",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 28px rgba(0, 0, 0, 0.08)",
          borderColor: "primary.light",
          "& .action-buttons": {
            opacity: 1,
            transform: "translateY(0)",
          }
        },
      }}
    >
      <Box 
        sx={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "4px", 
          height: "100%", 
          backgroundColor: turma.ativo ? "primary.main" : "text.disabled" 
        }} 
      />
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
              {turma.codigo} - {t("class", { number: turma.turma })}
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
                {t("courses")}
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
                {t("level")}
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
                {t("workload")}
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {t("hoursPerWeek", { hours: turma.carga })}
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
                  {t("schedules")}
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
                    label={t("more", { count: turma.horarios.length - 2 })}
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
              label={turma.ativo ? t("active") : t("inactive")}
              size="small"
              variant={turma.ativo ? "filled" : "outlined"}
              color={turma.ativo ? "success" : "default"}
              sx={{ fontWeight: 500 }}
            />
            {turma.noturna && (
              <Chip
                label={t("nightClass")}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            )}
            {turma.ingles && (
              <Chip
                label={t("english")}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 500 }}
              />
            )}
          </Box>
        </Stack>
      </CardContent>

      <CardActions
        className="action-buttons"
        sx={{
          justifyContent: "flex-end",
          borderTop: 1,
          borderColor: "divider",
          gap: 0.5,
          pt: 1.5,
          pb: 1.5,
          opacity: { xs: 1, md: 0.6 },
          transition: "all 0.3s",
        }}
      >
        <Tooltip title={t("editTooltip")}>
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
        <Tooltip title={t("deleteTooltip")}>
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
