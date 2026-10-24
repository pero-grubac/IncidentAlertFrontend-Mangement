import { jwtDecode } from "jwt-decode";

const KEY = "incident-alert.session";
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

/** Reads what the app needs from a Management API token. Returns null for a broken or expired one. */
export function parseToken(token, now = Date.now()) {
  try {
    const claims = jwtDecode(token);
    if (claims.exp && claims.exp * 1000 <= now) return null;
    return { token, username: claims.sub ?? "", role: claims[ROLE_CLAIM] ?? claims.role ?? null, expiresAt: claims.exp * 1000 };
  } catch {
    return null;
  }
}

// The session lives for the browser tab only.
export function loadSession() {
  const token = sessionStorage.getItem(KEY);
  const session = token ? parseToken(token) : null;
  if (token && !session) sessionStorage.removeItem(KEY);
  return session;
}

export function saveSession(token) {
  sessionStorage.setItem(KEY, token);
}

export function clearSession() {
  sessionStorage.removeItem(KEY);
}

export function currentToken() {
  return sessionStorage.getItem(KEY);
}
