import { Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { statusColors, statusStyle } from "../lib/status";
import { useT } from "../i18n";

export default function StatusChip({ status, size = "small" }) {
  const t = useT();
  const { palette } = useTheme();
  const { Icon } = statusStyle(status);
  const c = statusColors(status, palette.mode);
  return (
    <Chip
      size={size}
      label={t(`status.${status}`)}
      icon={<Icon sx={{ fontSize: 15, color: `${c.fg} !important` }} />}
      sx={{ color: c.fg, bgcolor: c.bg, border: `1px solid ${c.border}` }}
    />
  );
}
