import LocalFireDepartmentRoundedIcon from "@mui/icons-material/LocalFireDepartmentRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import DirectionsCarRoundedIcon from "@mui/icons-material/DirectionsCarRounded";
import LocalPoliceRoundedIcon from "@mui/icons-material/LocalPoliceRounded";
import ReportRoundedIcon from "@mui/icons-material/ReportRounded";
import { translate } from "../i18n";

// `color` is for pins, icons and fills; `text` is a darker shade that stays readable (4.5:1) on light backgrounds.
const KNOWN = {
  fire: { color: "#EF4444", text: "#B91C1C", Icon: LocalFireDepartmentRoundedIcon },
  flood: { color: "#3B82F6", text: "#1D4ED8", Icon: WaterDropRoundedIcon },
  traffic: { color: "#F59E0B", text: "#B45309", Icon: DirectionsCarRoundedIcon },
  crime: { color: "#8B5CF6", text: "#6D28D9", Icon: LocalPoliceRoundedIcon },
  other: { color: "#64748B", text: "#475569", Icon: ReportRoundedIcon },
};

// Categories added later by moderators still get a stable color of their own.
const PALETTE = [
  ["#0EA5E9", "#0369A1"],
  ["#14B8A6", "#0F766E"],
  ["#EC4899", "#BE185D"],
  ["#84CC16", "#4D7C0F"],
  ["#F97316", "#C2410C"],
  ["#6366F1", "#4338CA"],
];

function hash(text) {
  let h = 0;
  for (const char of text) h = (h * 31 + char.charCodeAt(0)) >>> 0;
  return h;
}

export function categoryStyle(name = "") {
  const key = name.trim().toLowerCase();
  if (KNOWN[key]) return { key, ...KNOWN[key] };
  const [color, text] = PALETTE[hash(key) % PALETTE.length];
  return { key: null, color, text, Icon: ReportRoundedIcon };
}

/** The readable text color for a category in the current theme. */
export function categoryTextColor(name, mode = "light") {
  const style = categoryStyle(name);
  return mode === "dark" ? style.color : style.text;
}

/** The built-in categories are translated; names moderators added are shown as they are. */
export function categoryLabel(name = "", language) {
  const { key } = categoryStyle(name);
  return key ? translate(`categories.${key}`, undefined, language) : name;
}

/** The API returns categories either as names or as { id, name } objects. */
export function categoryNames(incident) {
  return (incident?.categories ?? []).map((c) => (typeof c === "string" ? c : c.name));
}

/** An incident is drawn in the color of its first category. */
export function incidentColor(incident) {
  return categoryStyle(categoryNames(incident)[0]).color;
}
