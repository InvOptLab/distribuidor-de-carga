"use client";

import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
} from "@mui/material";
import {
  History as HistoryIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon,
  Clear as ClearIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

interface Change {
  id: string;
  type: "docente" | "disciplina" | "formulario" | "bulk";
  action: string;
  target: string;
  description: string;
  timestamp: string;
}

interface ChangeHistoryProps {
  changes: Change[];
  onClearHistory: () => void;
}

export function ChangeHistory({ changes, onClearHistory }: ChangeHistoryProps) {
  const [clearDialog, setClearDialog] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "docente":
        return <PersonIcon color="primary" />;
      case "disciplina":
        return <SchoolIcon color="secondary" />;
      case "formulario":
        return <AssignmentIcon color="info" />;
      case "bulk":
        return <SettingsIcon color="warning" />;
      default:
        return <HistoryIcon />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "docente":
        return "primary";
      case "disciplina":
        return "secondary";
      case "formulario":
        return "info";
      case "bulk":
        return "warning";
      default:
        return "default";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("pt-BR");
  };

  const handleClearHistory = () => {
    onClearHistory();
    setClearDialog(false);
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">Histórico de Alterações</Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<ClearIcon />}
          onClick={() => setClearDialog(true)}
          disabled={changes.length === 0}
        >
          Limpar Histórico
        </Button>
      </Box>

      {/* Lista de Alterações */}
      {changes.length === 0 ? (
        <Alert severity="info">
          Nenhuma alteração foi registrada ainda. As alterações aparecerão aqui
          conforme você edita os dados.
        </Alert>
      ) : (
        <Card>
          <CardContent>
            <List>
              {changes.map((change, index) => (
                <div key={change.id}>
                  <ListItem>
                    <ListItemIcon>{getTypeIcon(change.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="subtitle2">
                            {change.description}
                          </Typography>
                          <Chip
                            label={change.type}
                            size="small"
                            color={getTypeColor(change.type) as any}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Alvo: {change.target}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(change.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < changes.length - 1 && <Divider />}
                </div>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Dialog de Confirmação para Limpar */}
      <Dialog
        open={clearDialog}
        onClose={() => setClearDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="warning" />
          Limpar Histórico
        </DialogTitle>
        <DialogContent>
          <Typography>
            Esta ação irá remover permanentemente todo o histórico de
            alterações. Esta operação não pode ser desfeita. Deseja continuar?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleClearHistory}
            variant="contained"
            color="error"
          >
            Limpar Histórico
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
