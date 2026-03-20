"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
} from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";

interface IdentifierChangeDialogProps {
  open: boolean;
  oldIdentifier: string;
  newIdentifier: string;
  type: "docente" | "turma";
  onContinue: () => void;
  onDeleteOld: () => void;
  onCancel: () => void;
}

export default function IdentifierChangeDialog({
  open,
  oldIdentifier,
  newIdentifier,
  type,
  onContinue,
  onDeleteOld,
  onCancel,
}: IdentifierChangeDialogProps) {
  const label = type === "docente" ? "nome" : "ID";

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              p: 0.75,
              borderRadius: 1,
              backgroundColor: "warning.light",
              color: "warning.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <WarningIcon fontSize="small" />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Identificador Alterado
          </Typography>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2">
            O identificador único ({label}) foi alterado:
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              backgroundColor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mb: 0.5 }}
            >
              De:
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "error.main",
              }}
              title={oldIdentifier}
            >
              &quot;{oldIdentifier}&quot;
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ mt: 1.5, mb: 0.5 }}
            >
              Para:
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "success.main",
              }}
              title={newIdentifier}
            >
              &quot;{newIdentifier}&quot;
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Isso resultará na criação de um novo registro. Escolha uma das
            opções abaixo:
          </Typography>
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          color="inherit"
          sx={{
            transition: "all 0.2s",
            "&:hover": {
              backgroundColor: "action.hover",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={onContinue}
          variant="contained"
          color="primary"
          sx={{
            transition: "all 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(25, 103, 210, 0.3)",
            },
          }}
        >
          Criar Novo
        </Button>
        <Button
          onClick={onDeleteOld}
          variant="contained"
          color="error"
          sx={{
            transition: "all 0.2s",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(244, 67, 54, 0.3)",
            },
          }}
        >
          Excluir Antigo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
