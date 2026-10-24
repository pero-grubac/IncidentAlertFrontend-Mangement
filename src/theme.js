import { alpha, createTheme } from "@mui/material/styles";

// Colors that do not change with the theme.
export const brand = {
  alert: "#E11D48",
  ink: "#0F172A",
};

const TOKENS = {
  light: {
    background: "#F1F5F9",
    paper: "#FFFFFF",
    text: "#0F172A",
    muted: "#64748B",
    line: "#E2E8F0",
    lineStrong: "#CBD5E1",
    subtle: "#F8FAFC",
    glass: "rgba(255, 255, 255, 0.92)",
    primary: "#4F46E5",
    secondary: "#E11D48",
  },
  dark: {
    background: "#0B1120",
    paper: "#131C2E",
    text: "#E2E8F0",
    muted: "#94A3B8",
    line: "#243047",
    lineStrong: "#33415C",
    subtle: "#0F1729",
    glass: "rgba(19, 28, 46, 0.9)",
    primary: "#818CF8",
    secondary: "#FB7185",
  },
};

export function createAppTheme(mode = "light", locale = {}) {
  const c = TOKENS[mode];
  const dark = mode === "dark";

  return createTheme(
    {
      palette: {
        mode,
        primary: { main: c.primary, contrastText: dark ? "#0B1120" : "#FFFFFF" },
        secondary: { main: c.secondary, contrastText: dark ? "#0B1120" : "#FFFFFF" },
        success: { main: dark ? "#34D399" : "#10B981" },
        warning: { main: dark ? "#FBBF24" : "#D97706" },
        error: { main: dark ? "#F87171" : "#DC2626" },
        background: { default: c.background, paper: c.paper },
        text: { primary: c.text, secondary: c.muted },
        divider: c.line,
        surface: { glass: c.glass, subtle: c.subtle, lineStrong: c.lineStrong },
      },
      shape: { borderRadius: 12 },
      typography: {
        fontFamily: '"Inter Variable", Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        h1: { fontWeight: 800, letterSpacing: "-0.03em" },
        h2: { fontWeight: 800, letterSpacing: "-0.03em" },
        h3: { fontWeight: 750, letterSpacing: "-0.02em" },
        h4: { fontWeight: 750, letterSpacing: "-0.02em" },
        h5: { fontWeight: 700, letterSpacing: "-0.01em" },
        h6: { fontWeight: 700, letterSpacing: "-0.01em" },
        subtitle1: { fontWeight: 600 },
        subtitle2: { fontWeight: 600 },
        overline: { fontWeight: 700, letterSpacing: "0.08em" },
        button: { textTransform: "none", fontWeight: 600 },
      },
      shadows: [
        "none",
        "0 1px 2px rgba(15, 23, 42, 0.06)",
        "0 1px 3px rgba(15, 23, 42, 0.08), 0 1px 2px rgba(15, 23, 42, 0.04)",
        "0 4px 8px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)",
        dark
          ? "0 12px 28px -6px rgba(0, 0, 0, 0.55), 0 4px 8px -4px rgba(0, 0, 0, 0.4)"
          : "0 12px 24px -6px rgba(15, 23, 42, 0.12), 0 4px 8px -4px rgba(15, 23, 42, 0.06)",
        ...Array(20).fill(dark ? "0 24px 48px -12px rgba(0, 0, 0, 0.6)" : "0 24px 48px -12px rgba(15, 23, 42, 0.22)"),
      ],
      components: {
        MuiCssBaseline: {
          styleOverrides: {
            body: { WebkitFontSmoothing: "antialiased", colorScheme: mode },
          },
        },
        MuiButton: {
          defaultProps: { disableElevation: true },
          styleOverrides: {
            root: { borderRadius: 10, paddingInline: 16 },
            sizeLarge: { paddingBlock: 10, fontSize: "0.95rem" },
          },
        },
        MuiIconButton: { styleOverrides: { root: { borderRadius: 10 } } },
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" }, rounded: { borderRadius: 16 } } },
        MuiCard: {
          defaultProps: { elevation: 0 },
          styleOverrides: { root: { border: `1px solid ${c.line}`, borderRadius: 16 } },
        },
        MuiChip: {
          styleOverrides: {
            root: { fontWeight: 600, borderRadius: 8 },
            sizeSmall: { height: 24, fontSize: "0.75rem" },
          },
        },
        MuiDialog: { styleOverrides: { paper: { borderRadius: 20 } } },
        MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700, fontSize: "1.15rem" } } },
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              backgroundColor: c.paper,
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: c.lineStrong },
            },
            notchedOutline: { borderColor: c.line },
          },
        },
        MuiToggleButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              fontWeight: 600,
              border: "none",
              borderRadius: "8px !important",
              paddingBlock: 6,
              paddingInline: 6,
              whiteSpace: "nowrap",
              fontSize: "0.8125rem",
              minWidth: 0,
              color: c.muted,
              "&.Mui-selected": {
                backgroundColor: c.paper,
                color: c.text,
                boxShadow: dark ? "0 1px 3px rgba(0, 0, 0, 0.5)" : "0 1px 3px rgba(15, 23, 42, 0.12)",
                "&:hover": { backgroundColor: c.paper },
              },
            },
          },
        },
        MuiToggleButtonGroup: {
          styleOverrides: { root: { backgroundColor: dark ? c.subtle : "#F1F5F9", padding: 3, borderRadius: 10, gap: 2 } },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: { backgroundColor: dark ? "#E2E8F0" : brand.ink, color: dark ? brand.ink : "#FFFFFF", fontSize: "0.75rem", borderRadius: 8 },
          },
        },
        MuiAlert: { styleOverrides: { root: { borderRadius: 12, fontWeight: 500 } } },
        MuiLinearProgress: { styleOverrides: { root: { borderRadius: 4 } } },
        MuiListItemButton: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              "&.Mui-selected": { backgroundColor: alpha(c.primary, dark ? 0.16 : 0.08) },
            },
          },
        },
      },
    },
    locale,
  );
}
