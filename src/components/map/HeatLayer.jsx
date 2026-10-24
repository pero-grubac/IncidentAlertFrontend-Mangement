import { useEffect } from "react";
import L from "leaflet";
import "leaflet.heat";
import { useMap } from "react-leaflet";

// Cool to hot: indigo, cyan, amber, orange, rose.
const GRADIENT = { 0.2: "#6366F1", 0.45: "#22D3EE", 0.65: "#FBBF24", 0.85: "#F97316", 1: "#E11D48" };

/** Hot spots: a heat map of published incidents per place (from the Statistics service). */
export default function HeatLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!points?.length) return undefined;
    const max = Math.max(...points.map((p) => p.incidentCount));
    const layer = L.heatLayer(
      points.map((p) => [p.latitude, p.longitude, p.incidentCount / max]),
      // maxZoom is low on purpose: leaflet.heat fades points out below it, and the region view is zoom ~7.
      { radius: 42, blur: 30, maxZoom: 6, minOpacity: 0.5, gradient: GRADIENT },
    ).addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map, points]);

  return null;
}
