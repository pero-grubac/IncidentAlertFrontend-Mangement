import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Badge, Box, Chip, Divider, Fab, IconButton, List, Paper, Skeleton, Stack, ToggleButton, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import PlaylistAddCheckRoundedIcon from "@mui/icons-material/PlaylistAddCheckRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import WhatshotRoundedIcon from "@mui/icons-material/WhatshotRounded";
import BottomSheet from "../components/BottomSheet";
import EmptyState from "../components/EmptyState";
import IncidentReviewDialog from "../components/IncidentReviewDialog";
import ModerationMap from "../components/map/ModerationMap";
import PlaceSearch from "../components/PlaceSearch";
import QueueListItem from "../components/QueueListItem";
import RangeFilter from "../components/RangeFilter";
import { getLocationHeat } from "../api/endpoints";
import { errorMessage } from "../api/client";
import { useNotify } from "../context/NotificationContext";
import { useQueue } from "../context/QueueContext";
import { sheetHeight } from "../lib/sheet";
import { statusColors, statusOf, statusStyle } from "../lib/status";
import { useT } from "../i18n";

const PANEL_WIDTH = 380;

// Approved reports leave the queue, so "Approved" only shows up for older data.
const FILTERS = ["PENDING", "REJECTED", "ACCEPTED"];

function Section({ title, children }) {
  return (
    <Box sx={{ px: 2.5 }}>
      <Typography variant="overline" color="text.secondary" display="block" sx={{ mb: 1 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function StatusFilters({ statuses, counts, onToggle }) {
  const t = useT();
  const { palette } = useTheme();
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      {FILTERS.filter((status) => status !== "ACCEPTED" || counts.ACCEPTED > 0).map((status) => {
        const { Icon } = statusStyle(status);
        const c = statusColors(status, palette.mode);
        const on = statuses.includes(status);
        return (
          <Chip
            key={status}
            label={t("map.filter", { status: t(`status.${status}`), n: counts[status] ?? 0 })}
            icon={<Icon sx={{ fontSize: 16, color: `${on ? c.onSolid : c.fg} !important` }} />}
            onClick={() => onToggle(status)}
            aria-pressed={on}
            sx={{
              color: on ? c.onSolid : c.fg,
              bgcolor: on ? c.solid : c.bg,
              "&.MuiChip-clickable:hover": { bgcolor: on ? c.solid : c.bg, filter: "brightness(0.97)" },
            }}
          />
        );
      })}
    </Stack>
  );
}

export default function MapPage() {
  const t = useT();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();
  const notify = useNotify();
  const { incidents, range, loading, error, selectRange, remove, replace, reload } = useQueue();

  const [panelOpen, setPanelOpen] = useState(true);
  const [sheet, setSheet] = useState("half");
  const [statuses, setStatuses] = useState(["PENDING"]);
  const [focus, setFocus] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showHeat, setShowHeat] = useState(false);
  const [heat, setHeat] = useState(null);

  // Hot spots come from the Statistics service, loaded the first time they are switched on.
  useEffect(() => {
    if (!showHeat || heat) return;
    getLocationHeat()
      .then(setHeat)
      .catch((e) => {
        setShowHeat(false);
        notify(errorMessage(e), "error");
      });
  }, [showHeat, heat, notify]);

  const counts = useMemo(() => {
    const c = { PENDING: 0, REJECTED: 0, ACCEPTED: 0 };
    for (const i of incidents) c[statusOf(i)] = (c[statusOf(i)] ?? 0) + 1;
    return c;
  }, [incidents]);

  const visible = useMemo(() => incidents.filter((i) => statuses.includes(statusOf(i))), [incidents, statuses]);

  const toggleStatus = (status) =>
    setStatuses((current) => (current.includes(status) ? current.filter((s) => s !== status) : [...current, status]));

  const review = (incident) => {
    setSelected(incident);
    if (incident.location) setFocus({ latitude: incident.location.latitude, longitude: incident.location.longitude, zoom: 13 });
    if (isMobile) setSheet("peek");
  };

  const filters = (
    <Stack spacing={2.5} sx={{ pb: 2 }}>
      <Section title={t("map.reported")}>
        <RangeFilter value={range} onChange={selectRange} />
      </Section>
      <Section title={t("map.status")}>
        <StatusFilters statuses={statuses} counts={counts} onToggle={toggleStatus} />
      </Section>
    </Stack>
  );

  const list = (
    <Box sx={{ px: 1.25, py: 1.5 }}>
      {error && (
        <Alert severity="error" sx={{ mx: 1.25 }}>
          {error}
        </Alert>
      )}
      {loading &&
        [0, 1, 2, 3].map((i) => (
          <Stack key={i} direction="row" spacing={1.5} sx={{ px: 2, py: 1.25 }}>
            <Skeleton variant="rounded" width={36} height={36} />
            <Box sx={{ flexGrow: 1 }}>
              <Skeleton width="70%" />
              <Skeleton width="45%" />
            </Box>
          </Stack>
        ))}
      {!loading && !error && visible.length === 0 && (
        <EmptyState compact icon={TaskAltRoundedIcon} title={t("map.emptyTitle")} description={t("map.emptyText")} />
      )}
      {!loading && (
        <List disablePadding>
          {visible.map((incident, i) => (
            <Box key={incident.id} className="ia-rise" style={{ animationDelay: `${Math.min(i, 10) * 30}ms` }}>
              <QueueListItem incident={incident} selected={selected?.id === incident.id} onClick={review} />
            </Box>
          ))}
        </List>
      )}
    </Box>
  );

  const header = (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" component="h1" lineHeight={1.2}>
          {t("map.title")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {loading ? t("common.loading") : t("map.waiting", { n: counts.PENDING })}
        </Typography>
      </Box>
      <Stack direction="row">
        <Tooltip title={t("common.refresh")}>
          <IconButton onClick={reload} aria-label={t("common.refresh")} size="small">
            <RefreshRoundedIcon />
          </IconButton>
        </Tooltip>
        {!isMobile && (
          <Tooltip title={t("map.hidePanel")}>
            <IconButton onClick={() => setPanelOpen(false)} aria-label={t("map.hidePanel")} size="small">
              <ChevronLeftRoundedIcon />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );

  return (
    <Box sx={{ position: "relative", height: "100vh" }}>
      <ModerationMap
        incidents={visible}
        heat={showHeat ? heat : null}
        focus={focus}
        leftInset={panelOpen && !isMobile ? PANEL_WIDTH + 16 : 0}
        bottomInset={isMobile ? sheetHeight(sheet === "full" ? "half" : sheet) : 0}
        showZoom={!isMobile}
        onReview={review}
        onOpenLocation={(location) => navigate(`/location/${encodeURIComponent(location.name)}`, { state: { location } })}
      />

      {isMobile ? (
        <BottomSheet
          step={sheet}
          onStepChange={setSheet}
          expandLabel={t("map.expand")}
          collapseLabel={t("map.collapse")}
          header={
            <Stack spacing={1.5} sx={{ px: 2.5, pb: 1.5, flexShrink: 0 }}>
              {header}
              <PlaceSearch onSelect={(place) => setFocus({ latitude: place.latitude, longitude: place.longitude, zoom: 14 })} />
            </Stack>
          }
        >
          {filters}
          <Divider />
          {list}
        </BottomSheet>
      ) : (
        <Paper
          elevation={4}
          sx={(th) => ({
            position: "absolute",
            zIndex: 1000,
            top: 16,
            left: 16,
            bottom: 16,
            width: PANEL_WIDTH,
            display: panelOpen ? "flex" : "none",
            flexDirection: "column",
            bgcolor: th.palette.surface.glass,
            backdropFilter: "blur(12px)",
            border: `1px solid ${alpha(th.palette.divider, 0.8)}`,
            overflow: "hidden",
          })}
        >
          <Box sx={{ px: 2.5, pt: 2.5, pb: 2 }}>{header}</Box>
          <Box sx={{ px: 2.5, pb: 2.5 }}>
            <PlaceSearch onSelect={(place) => setFocus({ latitude: place.latitude, longitude: place.longitude, zoom: 14 })} />
          </Box>
          {filters}
          <Divider />
          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>{list}</Box>
        </Paper>
      )}

      {!panelOpen && !isMobile && (
        <Tooltip title={t("map.showQueue")} placement="right">
          <Fab
            onClick={() => setPanelOpen(true)}
            aria-label={t("map.showQueue")}
            sx={{ position: "absolute", zIndex: 1000, top: 16, left: 16, bgcolor: "background.paper", "&:hover": { bgcolor: "background.paper" } }}
          >
            <Badge badgeContent={counts.PENDING} color="warning">
              <PlaylistAddCheckRoundedIcon color="primary" />
            </Badge>
          </Fab>
        </Tooltip>
      )}

      <Tooltip title={t("map.heatmapHint")} placement="left">
        <ToggleButton
          value="heat"
          selected={showHeat}
          onChange={() => setShowHeat((v) => !v)}
          aria-label={t("map.heatmap")}
          sx={(th) => ({
            position: "absolute",
            zIndex: 1000,
            top: 16,
            right: isMobile ? 72 : 16,
            gap: 1,
            px: 1.75,
            bgcolor: "background.paper",
            boxShadow: 4,
            borderRadius: "12px !important",
            "&.Mui-selected, &.Mui-selected:hover": { bgcolor: th.palette.secondary.main, color: th.palette.secondary.contrastText },
            "&:hover": { bgcolor: "background.paper" },
          })}
        >
          <WhatshotRoundedIcon fontSize="small" />
          {t("map.heatmap")}
        </ToggleButton>
      </Tooltip>

      <IncidentReviewDialog
        incident={selected}
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onApproved={remove}
        onDeleted={remove}
        onUpdated={(updated) => {
          replace(updated);
          setSelected(updated);
        }}
      />
    </Box>
  );
}
