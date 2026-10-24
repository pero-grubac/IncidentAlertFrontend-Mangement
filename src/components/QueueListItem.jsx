import { Box, ListItemButton, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { categoryLabel, categoryNames, categoryStyle, categoryTextColor } from "../lib/categories";
import { fromNow } from "../lib/dates";
import { statusColors, statusOf } from "../lib/status";
import { useI18n } from "../i18n";

/** A compact row of the moderation queue. */
export default function QueueListItem({ incident, selected, onClick }) {
  const { t, language } = useI18n();
  const { palette } = useTheme();
  const names = categoryNames(incident);
  const { color, Icon } = categoryStyle(names[0]);
  const status = statusOf(incident);
  const s = statusColors(status, palette.mode);

  return (
    <ListItemButton selected={selected} onClick={() => onClick(incident)} sx={{ gap: 1.5, py: 1, alignItems: "flex-start" }}>
      <Box sx={{ width: 36, height: 36, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: alpha(color, 0.14), color, flexShrink: 0 }}>
        <Icon fontSize="small" />
      </Box>
      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography variant="body2" fontWeight={650} noWrap>
            {incident.title}
          </Typography>
          <Typography variant="caption" sx={{ color: s.fg, bgcolor: s.bg, px: 0.75, borderRadius: 1, fontWeight: 700, flexShrink: 0 }}>
            {t(`status.${status}`)}
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" component="div" noWrap>
          {incident.location?.name}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
          <Typography variant="caption" sx={{ color: categoryTextColor(names[0], palette.mode), fontWeight: 650 }}>
            {names.map((n) => categoryLabel(n, language)).join(" · ")}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {fromNow(incident.dateTime)}
          </Typography>
        </Stack>
      </Box>
    </ListItemButton>
  );
}
