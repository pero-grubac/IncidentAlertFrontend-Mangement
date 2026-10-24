import L from "leaflet";

function pinSvg(color, inner) {
  return `
    <svg width="34" height="44" viewBox="0 0 34 44" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17 1.5C8.4 1.5 1.5 8.3 1.5 16.7 1.5 28.4 17 42.5 17 42.5s15.5-14.1 15.5-25.8C32.5 8.3 25.6 1.5 17 1.5z"
            fill="${color}" stroke="#fff" stroke-width="2.5"/>
      ${inner}
    </svg>`;
}

const DOT = '<circle cx="17" cy="16.5" r="5.5" fill="#fff"/>';
const PLUS = '<path d="M17 10.5v12M11 16.5h12" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';

function count(n, color) {
  const label = n > 99 ? "99+" : String(n);
  return `<circle cx="17" cy="16.5" r="9" fill="#fff"/>
          <text x="17" y="20.5" text-anchor="middle" font-family="Inter Variable, Inter, sans-serif"
                font-size="${label.length > 2 ? 8 : 11}" font-weight="800" fill="${color}">${label}</text>`;
}

const cache = new Map();

/** A pin in the color of the incident's category, showing how many incidents share the place. */
export function incidentIcon(color, incidents = 1, active = false) {
  const key = `${color}-${incidents}-${active}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      L.divIcon({
        className: `ia-pin${active ? " ia-pin--active" : ""}`,
        html: pinSvg(color, incidents > 1 ? count(incidents, color) : DOT),
        iconSize: [34, 44],
        iconAnchor: [17, 42],
        popupAnchor: [0, -38],
      }),
    );
  }
  return cache.get(key);
}

/**
 * Several places merged when zoomed out: the number of incidents in the middle, and a ring
 * split by category color in proportion to how many incidents each color stands for.
 */
export function clusterIcon(cluster, describe) {
  const markers = cluster.getAllChildMarkers();
  const byColor = new Map();
  let total = 0;
  for (const marker of markers) {
    const n = marker.options.incidentCount ?? 1;
    const color = marker.options.color ?? "#64748B";
    byColor.set(color, (byColor.get(color) ?? 0) + n);
    total += n;
  }

  let angle = 0;
  const stops = [...byColor.entries()].map(([color, n]) => {
    const from = angle;
    angle += (n / total) * 360;
    return `${color} ${from}deg ${angle}deg`;
  });

  const size = total < 10 ? 42 : total < 50 ? 50 : 58;
  const label = total > 999 ? "999+" : String(total);
  return L.divIcon({
    className: "ia-cluster",
    html: `<div class="ia-cluster__ring" style="width:${size}px;height:${size}px;background:conic-gradient(${stops.join(",")})"
                role="img" aria-label="${describe(markers.length)}">
             <span class="ia-cluster__count">${label}</span>
           </div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/** The pin dropped where the user clicked or searched — the place a new report would go. */
export const selectionIcon = L.divIcon({
  className: "ia-pin ia-pin--selection",
  html: `<span class="ia-pulse"></span>${pinSvg("#E11D48", PLUS)}`,
  iconSize: [34, 44],
  iconAnchor: [17, 42],
  popupAnchor: [0, -38],
});
