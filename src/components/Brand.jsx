import { Box, Stack, Typography } from "@mui/material";
import { useT } from "../i18n";

export function BrandMark({ size = 36 }) {
  return (
    <Box
      component="img"
      src="/favicon.svg"
      alt=""
      sx={{ width: size, height: size, borderRadius: size / 4, boxShadow: "0 6px 14px -4px rgba(67, 56, 202, 0.6)", flexShrink: 0 }}
    />
  );
}

export default function Brand({ inverted }) {
  const t = useT();
  return (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
      <BrandMark />
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" component="div" fontWeight={750} lineHeight={1.15} color={inverted ? "#fff" : "text.primary"} noWrap>
          Incident Alert
        </Typography>
        <Typography variant="caption" lineHeight={1.2} display="block" color={inverted ? "rgba(255,255,255,.6)" : "text.secondary"} noWrap>
          {t("brand.tagline")}
        </Typography>
      </Box>
    </Stack>
  );
}
