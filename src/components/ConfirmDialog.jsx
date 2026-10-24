import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { useT } from "../i18n";

export default function ConfirmDialog({ open, title, message, confirmLabel, danger, busy, onConfirm, onClose }) {
  const t = useT();
  return (
    <Dialog open={open} onClose={busy ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit" disabled={busy}>
          {t("common.cancel")}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={danger ? "error" : "primary"} disabled={busy}>
          {confirmLabel ?? t("common.delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
