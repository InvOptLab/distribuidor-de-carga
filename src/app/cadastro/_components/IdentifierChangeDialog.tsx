"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
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
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningIcon color="warning" />
          Identificador Alterado
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          O identificador único ({label}) foi alterado de{" "}
          <strong>&quot;{oldIdentifier}&quot;</strong> para{" "}
          <strong>&quot;{newIdentifier}&quot;</strong>.
        </DialogContentText>
        <DialogContentText sx={{ mt: 2 }}>
          Isso levará à criação de um novo registro. O que você deseja fazer?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit">
          Cancelar
        </Button>
        <Button onClick={onContinue} variant="contained" color="primary">
          Continuar (Criar novo)
        </Button>
        <Button onClick={onDeleteOld} variant="contained" color="error">
          Excluir Antigo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
