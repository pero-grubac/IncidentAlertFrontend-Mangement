import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { I18nProvider } from "../i18n";
import { AppearanceProvider } from "../context/AppearanceContext";
import { NotificationProvider } from "../context/NotificationContext";
import { AuthProvider } from "../context/AuthContext";
import { ROUTER_FUTURE } from "../router";

/** An unsigned JWT with the claims the Management API puts in its tokens. */
export function fakeToken({ sub = "moderator", role = "MODERATOR", exp = Math.floor(Date.now() / 1000) + 3600 } = {}) {
  const encode = (value) => btoa(JSON.stringify(value)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
  const claims = { sub, exp, "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": role };
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(claims)}.signature`;
}

export function signIn(claims) {
  sessionStorage.setItem("incident-alert.session", fakeToken(claims));
}

/** Shows the current path, so tests can assert on redirects. */
export function CurrentPath() {
  const location = useLocation();
  return <div data-testid="path">{location.pathname}</div>;
}

/** Renders with the same providers the app uses (English, light theme unless asked). Pass `path` to mount the UI on a route (other paths render the current location). */
export function renderWithProviders(ui, { route = "/", routerState, path, language = "en", mode = "light" } = {}) {
  return render(
    <I18nProvider language={language}>
      <AppearanceProvider mode={mode}>
        <NotificationProvider>
          <AuthProvider>
            <MemoryRouter future={ROUTER_FUTURE} initialEntries={[{ pathname: route, state: routerState }]}>
              {path ? (
                <Routes>
                  <Route path={path} element={ui} />
                  <Route path="*" element={<CurrentPath />} />
                </Routes>
              ) : (
                ui
              )}
            </MemoryRouter>
          </AuthProvider>
        </NotificationProvider>
      </AppearanceProvider>
    </I18nProvider>,
  );
}
