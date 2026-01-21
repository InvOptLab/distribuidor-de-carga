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
  LinearProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import { Docente } from "@/algoritmo/communs/interfaces/interfaces";

interface DocenteCardProps {
  docente: Docente;
  onEdit: (docente: Docente) => void;
  onDelete: (docente: Docente) => void;
}

export default function DocenteCard({
  docente,
  onEdit,
  onDelete,
}: DocenteCardProps) {
  const totalFormularios = docente.formularios.size;

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
              backgroundColor: "info.light",
              color: "info.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SchoolIcon fontSize="small" />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              component="h3"
              noWrap
              title={docente.nome}
              sx={{ fontWeight: 600 }}
            >
              {docente.nome}
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.25 }}
            >
              {docente.ativo && (
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    backgroundColor: "success.main",
                  }}
                />
              )}
              <Typography
                variant="caption"
                color={docente.ativo ? "success.main" : "text.secondary"}
                sx={{ fontWeight: 500 }}
              >
                {docente.ativo ? "Ativo" : "Inativo"}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Informações principais */}
        <Stack spacing={1.5}>
          {/* Saldo */}
          {docente.saldo !== undefined && (
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.5,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Saldo de Carga Didática
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  color={
                    docente.saldo > 2
                      ? "success"
                      : docente.saldo < -1
                        ? "error"
                        : "primary.main"
                  }
                >
                  {docente.saldo}h
                </Typography>
              </Box>
              {/* <LinearProgress
                variant="determinate"
                value={Math.min((docente.saldo / 40) * 100, 100)}
                sx={{ height: 6, borderRadius: 1 }}
              /> */}
            </Box>
          )}

          {/* Formulários/Turmas */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                mb: 0.75,
              }}
            >
              <DescriptionIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="caption" color="text.secondary">
                Formulários Preenchidos
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
              <Typography variant="h6" fontWeight={600}>
                {totalFormularios}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {totalFormularios === 1 ? "turma" : "turmas"}
              </Typography>
            </Box>
          </Box>

          {/* Detalhes adicionais */}
          {(docente.agrupar || docente.comentario) && (
            <>
              <Divider sx={{ my: 0.5 }} />
              {docente.agrupar && (
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.25 }}
                  >
                    Preferência de Agrupamento
                  </Typography>
                  <Chip
                    label={docente.agrupar}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                </Box>
              )}
            </>
          )}
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
        <Tooltip title="Editar docente">
          <IconButton
            size="small"
            onClick={() => onEdit(docente)}
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
        <Tooltip title="Excluir docente">
          <IconButton
            size="small"
            onClick={() => onDelete(docente)}
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
