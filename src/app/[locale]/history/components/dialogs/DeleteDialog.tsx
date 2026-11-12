"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslations } from "next-intl";

interface DeleteDialogProps {
  open: boolean;
  count: number;
  skippedCurrent: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Confirmação de exclusão em lote. A solução atual é sempre preservada. */
export default function DeleteDialog({
  open,
  count,
  skippedCurrent,
  onConfirm,
  onCancel,
}: DeleteDialogProps) {
  const t = useTranslations("Pages.History.dialogs.delete");
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="delete-dialog-title"
    >
      <DialogTitle id="delete-dialog-title">
        {t("title", { count })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{t("body")}</DialogContentText>
        {skippedCurrent && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t("skippedCurrent")}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} autoFocus>
          {t("cancel")}
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={onConfirm}
          disabled={count === 0}
        >
          {t("confirm", { count })}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
