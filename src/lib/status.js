import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { alpha } from "@mui/material/styles";

// Matches StatusEnum in the Management API. Labels come from i18n: status.<NAME>.
// `color` fills pins and badges; `text` is the darker shade that stays readable (4.5:1) on light backgrounds.
export const STATUS = {
  PENDING: { color: "#F59E0B", text: "#B45309", Icon: HourglassTopRoundedIcon },
  REJECTED: { color: "#EF4444", text: "#B91C1C", Icon: BlockRoundedIcon },
  ACCEPTED: { color: "#10B981", text: "#047857", Icon: CheckCircleRoundedIcon },
};

export function statusOf(incident) {
  return incident?.statusName ?? "PENDING";
}

export function statusStyle(name) {
  return STATUS[name] ?? STATUS.PENDING;
}

/** Foreground and background of a status badge in the current theme. */
export function statusColors(name, mode = "light") {
  const { color, text } = statusStyle(name);
  return mode === "dark"
    ? { fg: color, bg: alpha(color, 0.16), border: alpha(color, 0.35), solid: color, onSolid: "#0B1120" }
    : { fg: text, bg: alpha(color, 0.14), border: alpha(color, 0.35), solid: text, onSolid: "#FFFFFF" };
}
