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
  Class as ClassIcon,
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
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <ClassIcon color="primary" />
          <Typography variant="h6" component="h3" noWrap title={turma.nome}>
            {turma.nome}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              ID:
            </Typography>
            <Typography
              variant="body2"
              fontWeight="medium"
              noWrap
              title={turma.id}
            >
              {turma.id}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Cursos:
            </Typography>
            <Typography
              variant="body2"
              fontWeight="medium"
              noWrap
              title={turma.cursos}
            >
              {turma.cursos || "Não informado"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Nível:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {turma.nivel || "Não informado"}
            </Typography>
          </Box>

          <Chip
            label={turma.ativo ? "Ativa" : "Inativa"}
            color={turma.ativo ? "success" : "default"}
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
        <Tooltip title="Editar turma">
          <IconButton
            size="small"
            onClick={() => onEdit(turma)}
            color="primary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Excluir turma">
          <IconButton
            size="small"
            onClick={() => onDelete(turma)}
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
