import { MapContainer, TileLayer } from "react-leaflet";
import { Box } from "@mui/material";
import HeatLayer from "./HeatLayer";
import { TILE_ATTRIBUTION, TILE_URL } from "./tiles";

/** A heat map of published incidents, framed on the places that have any. */
export default function HotspotMap({ points, height = 360 }) {
  const bounds = points?.length > 1 ? points.map((p) => [p.latitude, p.longitude]) : null;
  const center = points?.length === 1 ? [points[0].latitude, points[0].longitude] : [44.2, 18.6];

  return (
    <Box sx={{ height, borderRadius: 3, overflow: "hidden", border: 1, borderColor: "divider" }}>
      <MapContainer
        center={center}
        zoom={7}
        bounds={bounds ?? undefined}
        boundsOptions={{ padding: [40, 40], maxZoom: 11 }}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
        <HeatLayer points={points} />
      </MapContainer>
    </Box>
  );
}
