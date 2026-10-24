import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { groupByLocation } from "../../lib/grouping";
import { fromNow } from "../../lib/dates";
import { statusColors, statusOf, statusStyle } from "../../lib/status";
import { useT } from "../../i18n";
import HeatLayer from "./HeatLayer";
import { clusterIcon, incidentIcon } from "./markers";
import { TILE_ATTRIBUTION, TILE_URL } from "./tiles";

const DEFAULT_CENTER = [44.2, 18.6];
const DEFAULT_ZOOM = 7;

// A place is drawn amber while anything there still waits for a decision.
function groupColor(group) {
  const pending = group.incidents.some((i) => statusOf(i) === "PENDING");
  return statusStyle(pending ? "PENDING" : "REJECTED").color;
}

function Camera({ focus, groups, leftInset, bottomInset }) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current || groups.length === 0) return;
    fitted.current = true;
    const points = groups.map((g) => [g.location.latitude, g.location.longitude]);
    if (points.length === 1) map.setView(points[0], 13);
    else map.fitBounds(points, { paddingTopLeft: [leftInset + 60, 60], paddingBottomRight: [60, bottomInset + 60], maxZoom: 13 });
  }, [groups, map, leftInset, bottomInset]);

  useEffect(() => {
    if (!focus) return;
    const zoom = Math.max(map.getZoom(), focus.zoom ?? 14);
    const target = map.project([focus.latitude, focus.longitude], zoom).add([-leftInset / 2, bottomInset / 2]);
    map.flyTo(map.unproject(target, zoom), zoom, { duration: 0.8 });
  }, [focus, map, leftInset, bottomInset]);

  return null;
}

function PlaceMarker({ group, onReview, onOpenLocation }) {
  const t = useT();
  const { palette } = useTheme();
  const color = groupColor(group);

  return (
    <Marker
      position={[group.location.latitude, group.location.longitude]}
      icon={incidentIcon(color, group.incidents.length)}
      title={group.location.name}
      incidentCount={group.incidents.length}
      color={color}
    >
      <Popup>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          {group.location.name}
        </Typography>
        <Stack divider={<Divider flexItem />} spacing={0.5} sx={{ mb: 1.5 }}>
          {group.incidents.slice(0, 4).map((incident) => {
            const status = statusOf(incident);
            return (
              <Box
                key={incident.id}
                component="button"
                type="button"
                onClick={() => onReview(incident)}
                sx={{ all: "unset", cursor: "pointer", display: "block", py: 0.5, borderRadius: 1, "&:hover .title": { color: "primary.main" } }}
              >
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography className="title" variant="body2" fontWeight={600} noWrap>
                    {incident.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: statusColors(status, palette.mode).fg, fontWeight: 700, flexShrink: 0 }}>
                    {t(`status.${status}`)}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {fromNow(incident.dateTime)}
                </Typography>
              </Box>
            );
          })}
        </Stack>
        <Button fullWidth size="small" variant="contained" endIcon={<ArrowForwardRoundedIcon />} onClick={() => onOpenLocation(group.location)}>
          {t("map.openPlace")}
        </Button>
      </Popup>
    </Marker>
  );
}

export default function ModerationMap({ incidents, heat, focus, leftInset = 0, bottomInset = 0, showZoom = true, onReview, onOpenLocation }) {
  const t = useT();
  const groups = useMemo(() => groupByLocation(incidents), [incidents]);

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} zoomControl={false} style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} maxZoom={19} />
      {showZoom && <ZoomControl position="bottomright" />}
      <Camera focus={focus} groups={groups} leftInset={leftInset} bottomInset={bottomInset} />
      {heat && <HeatLayer points={heat} />}

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={56}
        showCoverageOnHover={false}
        spiderfyOnMaxZoom
        iconCreateFunction={(cluster) => clusterIcon(cluster, (places) => t("map.cluster", { n: places }))}
      >
        {groups.map((group) => (
          <PlaceMarker key={group.location.name} group={group} onReview={onReview} onOpenLocation={onOpenLocation} />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
