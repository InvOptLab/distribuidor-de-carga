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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  School as SchoolIcon,
  Description as DescriptionIcon,
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
  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <SchoolIcon color="primary" />
          <Typography variant="h6" component="h3" noWrap title={docente.nome}>
            {docente.nome}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Saldo:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {docente.saldo ?? "Não informado"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <DescriptionIcon fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {docente.formularios.size} formulário(s)
            </Typography>
          </Box>

          <Chip
            label={docente.ativo ? "Ativo" : "Inativo"}
            color={docente.ativo ? "success" : "default"}
            size="small"
            sx={{ width: "fit-content", mt: 1 }}
          />
        </Box>
      </CardContent>

      <CardActions
        sx={{
          justifyContent: "flex-end",
          borderTop: 1,
          borderColor: "divider",
        }}
      >
        <Tooltip title="Editar docente">
          <IconButton
            size="small"
            onClick={() => onEdit(docente)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir docente">
          <IconButton
            size="small"
            onClick={() => onDelete(docente)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
