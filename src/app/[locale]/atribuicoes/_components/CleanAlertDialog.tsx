import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslations } from "next-intl";

export interface CleanAlertDialogInterface {
  openDialog: boolean;
  cleanState: () => void;
  onCloseDialog: () => void;
}

export default function CleanAlertDialog({
  openDialog,
  cleanState,
  onCloseDialog,
}: CleanAlertDialogInterface) {
  const t = useTranslations("Pages.Assignment.CleanAlertDialog");
  return (
    <Dialog
      open={openDialog}
      onClose={onCloseDialog}
      aria-labelledby="alert-dialog-title"
    >
      <DialogTitle id="alert-dialog-title">
        {t("clearAllocations")}
        <IconButton
          aria-label="close"
          onClick={onCloseDialog}
          sx={(theme) => ({
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>{t("warningMessage")}</DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "flex-end", padding: "8px 12px" }}>
        <Button onClick={onCloseDialog} variant="contained" color="error">
          {t("cancel")}
        </Button>
        <Button onClick={cleanState} variant="contained" color="primary">
          {t("apply")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
