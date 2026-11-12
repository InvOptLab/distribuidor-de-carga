"use client";

import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslations } from "next-intl";

interface RestoreDialogProps {
  open: boolean;
  label: string;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

/** Confirmação ao restaurar com trabalho não salvo na grade. */
export default function RestoreDialog({
  open,
  label,
  saving,
  onSave,
  onDiscard,
  onCancel,
}: RestoreDialogProps) {
  const t = useTranslations("Pages.History.dialogs.restore");
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="restore-dialog-title"
    >
      <DialogTitle id="restore-dialog-title">{t("title")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("body", { label })}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap", gap: 1 }}>
        <Button onClick={onCancel} disabled={saving}>
          {t("cancel")}
        </Button>
        <Button color="warning" onClick={onDiscard} disabled={saving}>
          {t("discard")}
        </Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={saving}
          startIcon={
            saving ? <CircularProgress size={16} color="inherit" /> : undefined
          }
          autoFocus
        >
          {t("save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
