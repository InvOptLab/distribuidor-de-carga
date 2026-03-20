import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

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
  return (
    <Dialog open={openDialog} onClose={onCloseDialog} aria-labelledby="alert-dialog-title">
      <DialogTitle id="alert-dialog-title">
        Limpar as atribuições
        <IconButton
          aria-label="close"
          onClick={onCloseDialog}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <DialogContentText>
          Você está prestes a limpar todas as atribuições realizadas. Esta ação é irreversível e
          não poderá ser desfeita. Tem certeza de que deseja continuar?
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'flex-end', padding: '8px 12px' }}>
        <Button onClick={onCloseDialog} variant="contained" color="error">
          Cancelar
        </Button>
        <Button onClick={cleanState} variant="contained" color="primary">
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
