import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MapRoundedIcon from "@mui/icons-material/MapRounded";
import SellRoundedIcon from "@mui/icons-material/SellRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ManageAccountsRoundedIcon from "@mui/icons-material/ManageAccountsRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import Brand from "./Brand";
import SettingsMenu from "./SettingsMenu";
import { useAuth } from "../context/AuthContext";
import { useT } from "../i18n";

export const NAV_WIDTH = 248;

const NAV = [
  { to: "/map", key: "nav.map", Icon: MapRoundedIcon },
  { to: "/categories", key: "nav.categories", Icon: SellRoundedIcon },
  { to: "/grouped-incidents", key: "nav.similar", Icon: HubRoundedIcon },
  { to: "/statistics", key: "nav.statistics", Icon: InsightsRoundedIcon },
];

const ADMIN_NAV = [{ to: "/users", key: "nav.accounts", Icon: ManageAccountsRoundedIcon }];

function Navigation({ onNavigate }) {
  const t = useT();
  const { palette } = useTheme();
  const { session, logout, isAdmin } = useAuth();
  const items = isAdmin ? [...NAV, ...ADMIN_NAV] : NAV;

  return (
    <Stack
      sx={{
        height: "100%",
        // The navigation stays dark in both themes; in the dark theme it sits a shade below the page.
        bgcolor: palette.mode === "dark" ? "#070B14" : "#0F172A",
        borderRight: palette.mode === "dark" ? `1px solid ${palette.divider}` : "none",
        color: "#CBD5E1",
      }}
    >
      <Box sx={{ px: 2.5, py: 3 }}>
        <Brand inverted />
      </Box>

      <Typography variant="overline" sx={{ px: 3, color: "rgba(203,213,225,.45)" }}>
        {t("nav.workspace")}
      </Typography>
      <List sx={{ px: 1.5 }}>
        {items.map(({ to, key, Icon }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            onClick={onNavigate}
            sx={{
              mb: 0.5,
              color: "inherit",
              "&:hover": { bgcolor: "rgba(255,255,255,.06)" },
              "&.active": { bgcolor: "rgba(129,140,248,.16)", color: "#fff" },
              "&.active .MuiListItemIcon-root": { color: "#A5B4FC" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: "rgba(203,213,225,.7)" }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={t(key)} slotProps={{ primary: { fontWeight: 600, fontSize: "0.9rem" } }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ flexGrow: 1 }} />

      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ m: 1.5, p: 1.5, borderRadius: 3, bgcolor: "rgba(255,255,255,.05)" }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: "#4F46E5", color: "#fff", fontSize: "0.95rem", fontWeight: 700 }}>
          {session?.username?.[0]?.toUpperCase() ?? "?"}
        </Avatar>
        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
          <Typography variant="body2" fontWeight={650} color="#fff" noWrap>
            {session?.username}
          </Typography>
          <Typography variant="caption" sx={{ color: "rgba(203,213,225,.6)" }} noWrap component="div">
            {session?.role ? t(`roles.${session.role}`) : ""}
          </Typography>
        </Box>
        <SettingsMenu sx={{ color: "rgba(203,213,225,.8)" }} />
        <Tooltip title={t("nav.signOut")}>
          <IconButton onClick={logout} aria-label={t("nav.signOut")} size="small" sx={{ color: "rgba(203,213,225,.8)" }}>
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  );
}

export default function AppLayout() {
  const t = useT();
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Drawer
        variant={desktop ? "permanent" : "temporary"}
        open={desktop || open}
        onClose={() => setOpen(false)}
        sx={{ width: { md: NAV_WIDTH }, flexShrink: 0, "& .MuiDrawer-paper": { width: NAV_WIDTH, border: 0 } }}
      >
        <Navigation onNavigate={() => setOpen(false)} />
      </Drawer>

      {!desktop && (
        <IconButton
          onClick={() => setOpen(true)}
          aria-label={t("nav.open")}
          sx={{ position: "fixed", zIndex: 1300, top: 16, right: 16, bgcolor: "#0F172A", color: "#fff", boxShadow: 4, "&:hover": { bgcolor: "#1E293B" } }}
        >
          <MenuRoundedIcon />
        </IconButton>
      )}

      {/* Keyed by the path, so every page change replays the entrance animation. */}
      <Box component="main" key={pathname} className="ia-page" sx={{ flexGrow: 1, minWidth: 0, position: "relative" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
