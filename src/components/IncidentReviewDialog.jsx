import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  LinearProgress,
  Skeleton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ReactCountryFlag from "react-country-flag";
import CategoryChip from "./CategoryChip";
import ConfirmDialog from "./ConfirmDialog";
import Gallery from "./Gallery";
import StatusChip from "./StatusChip";
import LocationMiniMap from "./map/LocationMiniMap";
import { approveIncident, changeStatus, deleteIncident } from "../api/endpoints";
import { errorMessage } from "../api/client";
import { useNotify } from "../context/NotificationContext";
import { categoryNames } from "../lib/categories";
import { formatDateTime, fromNow } from "../lib/dates";
import { statusOf, statusStyle } from "../lib/status";
import { translateText } from "../lib/translate";
import { translationEnabled } from "../config";
import { useT } from "../i18n";

/** Reports are stored in Serbian; "en" asks Google to translate the title and the text. */
function useTranslation(incident, language) {
  const [text, setText] = useState({ title: incident?.title, text: incident?.text, loading: false });

  useEffect(() => {
    if (!incident) return undefined;
    if (language === "sr") {
      setText({ title: incident.title, text: incident.text, loading: false });
      return undefined;
    }
    const controller = new AbortController();
    setText((t) => ({ ...t, loading: true }));
    Promise.all([translateText(incident.title, language, controller.signal), translateText(incident.text, language, controller.signal)])
      .then(([title, text]) => setText({ title, text, loading: false }))
      .catch(() => {});
    return () => controller.abort();
  }, [incident, language]);

  return text;
}

/**
 * A report in the moderation queue, with the moderator's decisions:
 * approve (publish it), reject / restore, or delete it.
 */
export default function IncidentReviewDialog({ incident, open, onClose, onApproved, onUpdated, onDeleted }) {
  const t = useT();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const notify = useNotify();
  const [language, setLanguage] = useState("sr");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const translated = useTranslation(incident, language);

  useEffect(() => {
    if (open) setLanguage("sr");
  }, [open, incident]);

  if (!incident) return null;

  const status = statusOf(incident);
  const { color } = statusStyle(status);

  const act = async (action, success) => {
    setBusy(true);
    try {
      await action();
      notify(success, "success");
    } catch (error) {
      notify(errorMessage(error), "error");
    } finally {
      setBusy(false);
    }
  };

  const approve = () =>
    act(async () => {
      await approveIncident(incident.id);
      onApproved?.(incident.id);
      onClose();
    }, t("review.approved"));

  const toggleRejected = () =>
    act(
      async () => {
        const updated = await changeStatus(incident.id, status === "REJECTED" ? "PENDING" : "REJECTED");
        // The response has no image URLs, so only the status is taken from it.
        onUpdated?.({ ...incident, status: updated.status, statusName: updated.statusName });
      },
      status === "REJECTED" ? t("review.restored") : t("review.rejected"),
    );

  const remove = () =>
    act(async () => {
      await deleteIncident(incident.id);
      setConfirmDelete(false);
      onDeleted?.(incident.id);
      onClose();
    }, t("review.deleted"));

  return (
    <>
      <Dialog open={open} onClose={busy ? undefined : onClose} fullWidth fullScreen={fullScreen} maxWidth="sm" aria-labelledby="review-title">
        {busy ? <LinearProgress /> : <Box sx={{ height: 4, bgcolor: color, flexShrink: 0 }} />}
        <IconButton
          onClick={onClose}
          aria-label={t("common.close")}
          disabled={busy}
          sx={{ position: "absolute", top: 12, right: 12, zIndex: 1, bgcolor: "background.paper", boxShadow: 2, "&:hover": { bgcolor: "background.paper" } }}
        >
          <CloseRoundedIcon />
        </IconButton>

        <Gallery images={incident.images} title={incident.title} height={260} />

        <DialogContent sx={{ pt: 2.5 }}>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.5, pr: incident.images?.length ? 0 : 5 }}>
            <StatusChip status={status} />
            {categoryNames(incident).map((name) => (
              <CategoryChip key={name} name={name} />
            ))}
          </Stack>

          <Typography id="review-title" variant="h5" sx={{ mb: 1 }}>
            {translated.loading ? <Skeleton width="70%" /> : translated.title}
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={{ xs: 0.5, sm: 2.5 }} sx={{ color: "text.secondary", mb: 2.5 }}>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <ScheduleRoundedIcon sx={{ fontSize: 18 }} />
              <Typography variant="body2">
                {formatDateTime(incident.dateTime)} · {fromNow(incident.dateTime)}
              </Typography>
            </Stack>
            {incident.location?.name && (
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                <PlaceOutlinedIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2" noWrap>
                  {incident.location.name}
                </Typography>
              </Stack>
            )}
          </Stack>

          <Typography variant="body1" sx={{ whiteSpace: "pre-line", lineHeight: 1.7, mb: 2.5 }}>
            {translated.loading ? (
              <>
                <Skeleton />
                <Skeleton width="60%" />
              </>
            ) : (
              translated.text
            )}
          </Typography>

          {incident.location && (
            <Box>
              <Typography variant="overline" color="text.secondary" component="p" sx={{ mb: 0.75 }}>
                {t("review.where")}
              </Typography>
              <LocationMiniMap location={incident.location} color={color} />
            </Box>
          )}

          {translationEnabled && (
            <ToggleButtonGroup size="small" exclusive value={language} onChange={(_e, v) => v && setLanguage(v)} aria-label={t("review.language")} sx={{ mt: 2.5 }}>
              <ToggleButton value="sr" sx={{ gap: 0.75 }}>
                <ReactCountryFlag countryCode="RS" svg /> SR
              </ToggleButton>
              <ToggleButton value="en" sx={{ gap: 0.75 }}>
                <ReactCountryFlag countryCode="GB" svg /> EN
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 2, gap: 1, flexWrap: "wrap", borderTop: 1, borderColor: "divider" }}>
          <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} disabled={busy} onClick={() => setConfirmDelete(true)}>
            {t("common.delete")}
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            color={status === "REJECTED" ? "inherit" : "warning"}
            startIcon={status === "REJECTED" ? <UndoRoundedIcon /> : <BlockRoundedIcon />}
            disabled={busy}
            onClick={toggleRejected}
          >
            {status === "REJECTED" ? t("review.backToPending") : t("review.reject")}
          </Button>
          <Button variant="contained" color="success" startIcon={<TaskAltRoundedIcon />} disabled={busy} onClick={approve}>
            {t("review.approve")}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        danger
        busy={busy}
        title={t("review.confirmTitle")}
        message={t("review.confirmText", { title: incident.title })}
        confirmLabel={t("common.delete")}
        onConfirm={remove}
        onClose={() => setConfirmDelete(false)}
      />
    </>
  );
}
