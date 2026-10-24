import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { CssBaseline, GlobalStyles, ThemeProvider, useMediaQuery } from "@mui/material";
import { enUS, srRS } from "@mui/material/locale";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { createAppTheme } from "../theme";
import { useI18n } from "../i18n";

export const THEME_PREFERENCES = ["system", "light", "dark"];
const STORAGE_KEY = "incident-alert.theme";

function savedPreference() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return THEME_PREFERENCES.includes(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

const AppearanceContext = createContext({ preference: "system", mode: "light", setPreference: () => {} });

/**
 * Theme (light / dark / follow the system) and the localized MUI theme and date pickers.
 * Also exposes the palette as CSS variables, so the Leaflet map can follow the theme.
 */
export function AppearanceProvider({ children, mode: forcedMode }) {
  const { language, info } = useI18n();
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)", { noSsr: true });
  const [preference, setPreferenceState] = useState(savedPreference);

  const mode = forcedMode ?? (preference === "system" ? (prefersDark ? "dark" : "light") : preference);

  const setPreference = useCallback((value) => {
    setPreferenceState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // Not remembered, but it still applies now.
    }
  }, []);

  const theme = useMemo(() => createAppTheme(mode, language === "sr" ? srRS : enUS), [mode, language]);

  useEffect(() => {
    document.documentElement.dataset.mode = mode;
  }, [mode]);

  const value = useMemo(() => ({ preference, mode, setPreference }), [preference, mode, setPreference]);

  return (
    <AppearanceContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <GlobalStyles
          styles={{
            ":root": {
              "--ia-paper": theme.palette.background.paper,
              "--ia-text": theme.palette.text.primary,
              "--ia-muted": theme.palette.text.secondary,
              "--ia-line": theme.palette.divider,
              "--ia-map": mode === "dark" ? "#0E1626" : "#E8EDF3",
            },
          }}
        />
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={info.dayjs}>
          {children}
        </LocalizationProvider>
      </ThemeProvider>
    </AppearanceContext.Provider>
  );
}

export const useAppearance = () => useContext(AppearanceContext);
