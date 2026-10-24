import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import { Alert, Box, Button, Card, Container, Grid2 as Grid, Skeleton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import CategoryChip from "../components/CategoryChip";
import EmptyState from "../components/EmptyState";
import IncidentCard from "../components/IncidentCard";
import IncidentReviewDialog from "../components/IncidentReviewDialog";
import PageHeader from "../components/PageHeader";
import LocationMiniMap from "../components/map/LocationMiniMap";
import { getIncidentsByLocation } from "../api/endpoints";
import { errorMessage } from "../api/client";
import { useQueue } from "../context/QueueContext";
import { categoryNames } from "../lib/categories";
import { isWithin } from "../lib/dates";
import { statusColors, statusOf, statusStyle } from "../lib/status";
import { translate, useT } from "../i18n";

export default function LocationPage() {
  const t = useT();
  const { palette } = useTheme();
  const { locationName } = useParams();
  const { state } = useLocation();
  const queue = useQueue();

  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState(null);
  const [status, setStatus] = useState(null);
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getIncidentsByLocation(locationName)
      .then((data) => !cancelled && setIncidents(data))
      .catch((e) => !cancelled && setError(errorMessage(e, translate("errors.place"))))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [locationName]);

  const location = state?.location ?? incidents[0]?.location;
  const present = useMemo(() => [...new Set(incidents.flatMap(categoryNames))].sort(), [incidents]);
  const filtered = useMemo(
    () =>
      incidents.filter(
        (i) =>
          (!category || categoryNames(i).includes(category)) &&
          (!status || statusOf(i) === status) &&
          isWithin(i.dateTime, from, to),
      ),
    [incidents, category, status, from, to],
  );
  const filtering = Boolean(category || status || from || to);

  // Keep this page and the queue on the map in step.
  const removeEverywhere = (id) => {
    setIncidents((list) => list.filter((i) => i.id !== id));
    queue.remove(id);
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Button component={RouterLink} to="/map" startIcon={<ArrowBackRoundedIcon />} color="inherit" sx={{ mb: 2, ml: -1 }}>
        {t("place.back")}
      </Button>

      <PageHeader
        actions={
          location && (
            <Box sx={{ width: { xs: "100%", sm: 300 } }}>
              <LocationMiniMap location={location} color={statusStyle(statusOf(incidents[0])).color} height={140} />
            </Box>
          )
        }
        eyebrow={t("place.overline")}
        title={locationName}
        description={
          location && (
            <Stack direction="row" spacing={0.75} alignItems="center" component="span">
              <PlaceOutlinedIcon fontSize="small" />
              <span>
                {Number(location.latitude).toFixed(5)}, {Number(location.longitude).toFixed(5)}
              </span>
            </Stack>
          )
        }
      />

      {incidents.length > 0 && (
        <Card sx={{ p: 2, mb: 3 }}>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={2} alignItems={{ lg: "center" }} justifyContent="space-between">
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
              {present.map((name) => (
                <CategoryChip key={name} name={name} selected={category === name} onClick={() => setCategory(category === name ? null : name)} />
              ))}
              <Box sx={{ width: 8 }} />
              {["PENDING", "REJECTED"].map((s) => (
                <Button
                  key={s}
                  size="small"
                  variant={status === s ? "contained" : "text"}
                  onClick={() => setStatus(status === s ? null : s)}
                  sx={{
                    bgcolor: status === s ? statusColors(s, palette.mode).solid : undefined,
                    color: status === s ? statusColors(s, palette.mode).onSolid : statusColors(s, palette.mode).fg,
                    "&:hover": { bgcolor: status === s ? statusColors(s, palette.mode).solid : statusColors(s, palette.mode).bg },
                  }}
                >
                  {t(`status.${s}`)}
                </Button>
              ))}
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <DatePicker label={t("common.from")} value={from} onChange={setFrom} slotProps={{ textField: { size: "small", sx: { width: 160 } } }} />
              <DatePicker label={t("common.to")} value={to} onChange={setTo} minDate={from ?? undefined} slotProps={{ textField: { size: "small", sx: { width: 160 } } }} />
              {filtering && (
                <Button
                  onClick={() => {
                    setCategory(null);
                    setStatus(null);
                    setFrom(null);
                    setTo(null);
                  }}
                >
                  {t("common.clear")}
                </Button>
              )}
            </Stack>
          </Stack>
        </Card>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <Grid container spacing={2.5}>
          {[0, 1, 2].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Skeleton variant="rounded" height={260} />
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 && !error ? (
        <Card>
          <EmptyState
            title={filtering ? t("place.noMatchTitle") : t("place.emptyTitle")}
            description={filtering ? t("place.noMatchText") : t("place.emptyText")}
          />
        </Card>
      ) : (
        <Grid container spacing={2.5}>
          {filtered.map((incident, i) => (
            <Grid key={incident.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <IncidentCard incident={incident} index={i} onClick={setSelected} />
            </Grid>
          ))}
        </Grid>
      )}

      <IncidentReviewDialog
        incident={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onApproved={removeEverywhere}
        onDeleted={removeEverywhere}
        onUpdated={(updated) => {
          setIncidents((list) => list.map((i) => (i.id === updated.id ? updated : i)));
          queue.replace(updated);
          setSelected(updated);
        }}
      />
    </Container>
  );
}
