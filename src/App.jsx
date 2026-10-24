import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { I18nProvider } from "./i18n";
import { AppearanceProvider } from "./context/AppearanceContext";
import { config, googleSignInEnabled } from "./config";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { QueueProvider } from "./context/QueueContext";
import AppLayout from "./components/AppLayout";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MapPage from "./pages/MapPage";
import LocationPage from "./pages/LocationPage";
import CategoriesPage from "./pages/CategoriesPage";
import GroupedIncidentsPage from "./pages/GroupedIncidentsPage";
import StatisticsPage from "./pages/StatisticsPage";
import UsersPage from "./pages/UsersPage";
import { ROUTER_FUTURE } from "./router";

/** Signed-in moderators and administrators only; everyone else goes to the sign-in page and comes back afterwards. */
export function RequireModerator({ children }) {
  const { isAuthenticated, canModerate } = useAuth();
  const location = useLocation();
  if (!isAuthenticated || !canModerate) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

/** Account administration is for administrators only. */
export function RequireAdmin({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/map" replace />;
}

export function GuestOnly({ children }) {
  const { isAuthenticated, canModerate } = useAuth();
  return isAuthenticated && canModerate ? <Navigate to="/map" replace /> : children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
      <Route
        element={
          <RequireModerator>
            <QueueProvider>
              <AppLayout />
            </QueueProvider>
          </RequireModerator>
        }
      >
        <Route path="/map" element={<MapPage />} />
        <Route path="/location/:locationName" element={<LocationPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/grouped-incidents" element={<GroupedIncidentsPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/users" element={<RequireAdmin><UsersPage /></RequireAdmin>} />
      </Route>
      <Route path="/category" element={<Navigate to="/categories" replace />} />
      <Route path="*" element={<Navigate to="/map" replace />} />
    </Routes>
  );
}

function Providers({ children }) {
  const app = (
    <I18nProvider>
      <AppearanceProvider>
        <NotificationProvider>
          <AuthProvider>{children}</AuthProvider>
        </NotificationProvider>
      </AppearanceProvider>
    </I18nProvider>
  );
  return googleSignInEnabled ? <GoogleOAuthProvider clientId={config.googleClientId}>{app}</GoogleOAuthProvider> : app;
}

export default function App() {
  return (
    <Providers>
      <BrowserRouter future={ROUTER_FUTURE}>
        <AppRoutes />
      </BrowserRouter>
    </Providers>
  );
}
