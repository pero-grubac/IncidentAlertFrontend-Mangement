import { Box, Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
import PhotoLibraryOutlinedIcon from "@mui/icons-material/PhotoLibraryOutlined";
import CategoryChip from "./CategoryChip";
import StatusChip from "./StatusChip";
import { categoryNames, categoryStyle } from "../lib/categories";
import { formatDateTime, fromNow } from "../lib/dates";
import { statusOf } from "../lib/status";

/** `index` staggers the entrance animation in a grid. */
export default function IncidentCard({ incident, onClick, index = 0 }) {
  const photos = incident.images?.length ?? 0;
  const cover = incident.images?.[0];
  const { color, Icon } = categoryStyle(categoryNames(incident)[0]);

  return (
    <Card
      className="ia-rise"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
      sx={{ height: "100%", transition: "box-shadow .2s, transform .2s", "&:hover": { boxShadow: 4, transform: "translateY(-2px)" } }}>
      <CardActionArea onClick={() => onClick(incident)} sx={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "stretch" }}>
        <Box
          sx={{
            height: 120,
            position: "relative",
            display: "grid",
            placeItems: "center",
            background: cover ? `center / cover no-repeat url("${cover}")` : `linear-gradient(135deg, ${color}38, ${color}0D)`,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          {!cover && <Icon sx={{ fontSize: 40, color, opacity: 0.55 }} />}
          <Box sx={{ position: "absolute", left: 10, top: 10 }}>
            <StatusChip status={statusOf(incident)} />
          </Box>
          {photos > 0 && (
            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{ position: "absolute", right: 10, bottom: 10, px: 1, py: 0.25, borderRadius: 2, bgcolor: "rgba(15,23,42,.7)", color: "#fff" }}
            >
              <PhotoLibraryOutlinedIcon sx={{ fontSize: 14 }} />
              <Typography variant="caption" fontWeight={700}>
                {photos}
              </Typography>
            </Stack>
          )}
        </Box>
        <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3} sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {incident.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {incident.text}
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {categoryNames(incident).map((name) => (
              <CategoryChip key={name} name={name} />
            ))}
          </Stack>
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: "auto", pt: 0.5, color: "text.secondary" }} title={formatDateTime(incident.dateTime)}>
            <ScheduleRoundedIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">{fromNow(incident.dateTime)}</Typography>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
