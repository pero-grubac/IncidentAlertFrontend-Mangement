import { Box, Stack, Typography } from "@mui/material";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import Brand from "../../components/Brand";
import SettingsMenu from "../../components/SettingsMenu";
import { useT } from "../../i18n";

const POINTS = [
  { Icon: MapRoundedIcon, key: "map" },
  { Icon: TaskAltRoundedIcon, key: "publish" },
  { Icon: HubRoundedIcon, key: "patterns" },
];

export default function AuthLayout({ title, subtitle, children }) {
  const t = useT();
  return (
    <Box sx={{ minHeight: "100vh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(420px, 46%) 1fr" }, bgcolor: "background.paper" }}>
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
          background: "radial-gradient(1200px 600px at -10% 110%, #E11D48 0%, transparent 55%), linear-gradient(150deg, #1E1B4B 0%, #312E81 45%, #4338CA 100%)",
        }}
      >
        {/* Faint map grid */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.12,
            backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
            maskImage: "linear-gradient(160deg, #000 20%, transparent 75%)",
          }}
        />
        <Box sx={{ position: "relative" }}>
          <Brand inverted />
        </Box>

        <Box sx={{ position: "relative", maxWidth: 460 }}>
          <Typography variant="h3" component="p" sx={{ mb: 4, lineHeight: 1.1 }}>
            {t("auth.headline")}
          </Typography>
          <Stack spacing={2.5}>
            {POINTS.map(({ Icon, key }, i) => (
              <Stack key={key} direction="row" spacing={2} alignItems="flex-start" className="ia-rise" style={{ animationDelay: `${150 + i * 90}ms` }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "rgba(255,255,255,.12)", flexShrink: 0 }}>
                  <Icon fontSize="small" />
                </Box>
                <Box>
                  <Typography fontWeight={700}>{t(`auth.points.${key}Title`)}</Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,.72)" }}>
                    {t(`auth.points.${key}Text`)}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Typography variant="caption" sx={{ position: "relative", color: "rgba(255,255,255,.55)" }}>
          {t("brand.footer")}
        </Typography>
      </Box>

      <Stack justifyContent="center" alignItems="center" sx={{ p: { xs: 3, sm: 6 }, position: "relative" }}>
        <SettingsMenu sx={{ position: "absolute", top: 16, right: 16 }} />
        <Box sx={{ width: "100%", maxWidth: 400 }} className="ia-rise">
          <Box sx={{ display: { md: "none" }, mb: 5 }}>
            <Brand />
          </Box>
          <Typography variant="h4" component="h1" sx={{ mb: 1 }}>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            {subtitle}
          </Typography>
          {children}
        </Box>
      </Stack>
    </Box>
  );
}
