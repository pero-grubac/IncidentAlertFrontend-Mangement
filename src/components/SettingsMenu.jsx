import { useState } from "react";
import { Box, IconButton, Menu, Stack, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import SettingsBrightnessRoundedIcon from "@mui/icons-material/SettingsBrightnessRounded";
import ReactCountryFlag from "react-country-flag";
import { LANGUAGES, useI18n } from "../i18n";
import { THEME_PREFERENCES, useAppearance } from "../context/AppearanceContext";

const THEME_ICONS = { system: SettingsBrightnessRoundedIcon, light: LightModeRoundedIcon, dark: DarkModeRoundedIcon };

/** Language and theme, in one small menu. */
export default function SettingsMenu({ size = "small", sx }) {
  const { language, setLanguage, t } = useI18n();
  const { preference, setPreference } = useAppearance();
  const [anchor, setAnchor] = useState(null);

  return (
    <>
      <Tooltip title={t("common.settings")}>
        <IconButton size={size} onClick={(e) => setAnchor(e.currentTarget)} aria-label={t("common.settings")} sx={sx}>
          <TuneRoundedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { p: 2, width: 280, mt: 1 } } }}
      >
        <Stack spacing={2}>
          <Box>
            <Typography variant="overline" color="text.secondary" component="p" sx={{ mb: 0.75 }}>
              {t("common.language")}
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={language}
              onChange={(_e, v) => v && setLanguage(v)}
              aria-label={t("common.language")}
            >
              {LANGUAGES.map((l) => (
                <ToggleButton key={l.code} value={l.code} sx={{ gap: 1 }} lang={l.code}>
                  <ReactCountryFlag countryCode={l.country} svg style={{ width: 18, borderRadius: 2 }} aria-hidden />
                  {l.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          <Box>
            <Typography variant="overline" color="text.secondary" component="p" sx={{ mb: 0.75 }}>
              {t("common.theme")}
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              size="small"
              value={preference}
              onChange={(_e, v) => v && setPreference(v)}
              aria-label={t("common.theme")}
            >
              {THEME_PREFERENCES.map((p) => {
                const Icon = THEME_ICONS[p];
                return (
                  <ToggleButton key={p} value={p} sx={{ gap: 0.75, flexDirection: "column", py: 1 }}>
                    <Icon fontSize="small" />
                    <Typography variant="caption" fontWeight={600}>
                      {t(`common.themes.${p}`)}
                    </Typography>
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </Menu>
    </>
  );
}
