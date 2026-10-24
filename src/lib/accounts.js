import { alpha } from "@mui/material/styles";

// Matches RoleEnum in the Management API; labels come from i18n: roles.<NAME>.
// NOTITLE is an account waiting for an administrator's approval.
const ROLE_COLORS = {
  NOTITLE: { light: "#B45309", dark: "#FBBF24" },
  MODERATOR: { light: "#4338CA", dark: "#A5B4FC" },
  ADMIN: { light: "#334155", dark: "#CBD5E1" },
};

export function roleColors(role, mode = "light") {
  const color = (ROLE_COLORS[role] ?? ROLE_COLORS.NOTITLE)[mode];
  return { fg: color, bg: alpha(color, mode === "dark" ? 0.16 : 0.12) };
}

const ORDER = { NOTITLE: 0, MODERATOR: 1, ADMIN: 2 };

/** Accounts waiting for approval first, then moderators, then administrators; by name within each. */
export function sortAccounts(users) {
  return [...users].sort(
    (a, b) => (ORDER[a.roleName] ?? 3) - (ORDER[b.roleName] ?? 3) || a.username.localeCompare(b.username),
  );
}
