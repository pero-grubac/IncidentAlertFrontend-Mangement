import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { Box } from "@mui/material";
import { incidentIcon } from "./markers";
import { TILE_URL } from "./tiles";

/** A small, still map with one pin — where something happened. */
export default function LocationMiniMap({ location, color, height = 150 }) {
  if (!location) return null;
  return (
    <Box sx={{ height, borderRadius: 3, overflow: "hidden", border: 1, borderColor: "divider" }}>
      <MapContainer
        key={`${location.latitude},${location.longitude}`}
        center={[location.latitude, location.longitude]}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        attributionControl={false}
        keyboard={false}
      >
        <TileLayer url={TILE_URL} />
        <Marker position={[location.latitude, location.longitude]} icon={incidentIcon(color)} interactive={false} />
      </MapContainer>
    </Box>
  );
}
