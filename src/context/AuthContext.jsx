import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SESSION_EXPIRED } from "../api/client";
import { login as loginRequest, loginWithGoogle as googleRequest } from "../api/endpoints";
import { clearSession, loadSession, parseToken, saveSession } from "../api/session";

// Roles that may use the moderation workspace. Administrators can moderate and also approve accounts.
export const MODERATOR = "MODERATOR";
export const ADMIN = "ADMIN";
export const STAFF = [MODERATOR, ADMIN];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);
  const [expired, setExpired] = useState(false);

  const start = useCallback((token) => {
    const parsed = parseToken(token);
    if (!parsed) throw new Error("The server returned an invalid session.");
    saveSession(token);
    setExpired(false);
    setSession(parsed);
    return parsed;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const login = useCallback(async (username, password) => start(await loginRequest(username, password)), [start]);

  const loginWithGoogle = useCallback(
    async (idToken) => {
      const result = await googleRequest(idToken);
      return result.created ? result : start(result.token);
    },
    [start],
  );

  useEffect(() => {
    const onExpired = () => {
      setExpired(true);
      logout();
    };
    window.addEventListener(SESSION_EXPIRED, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED, onExpired);
  }, [logout]);

  // Sign out on the dot when the token runs out.
  useEffect(() => {
    if (!session?.expiresAt) return undefined;
    const timer = setTimeout(() => {
      setExpired(true);
      logout();
    }, Math.max(0, session.expiresAt - Date.now()));
    return () => clearTimeout(timer);
  }, [session, logout]);

  const value = useMemo(
    () => ({
      session,
      expired,
      isAuthenticated: Boolean(session),
      canModerate: STAFF.includes(session?.role),
      isAdmin: session?.role === ADMIN,
      login,
      loginWithGoogle,
      logout,
    }),
    [session, expired, login, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
