import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./page/Login/LoginPage";
import RegisterPage from "./page/Register/RegisterPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./util/ProtectedRoute";
import LogoutAndRedirect from "./util/LogoutAndRedirect";
import { SearchProvider } from "./context/SearchContext";
import { IncidentProvider } from "./context/IncidentContext";
import LocationPage from "./page/Location/LocationPage";
import LeafMapComponent from "./components/MapComponent/LeafletMapComponent";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Enviroments from "./Enviroments";
import AppLayout from "./components/AppLayout/AppLayout";
import RedirectIfAuthenticated from "./util/RedirectIfAuthenticated";
const apiKey = Enviroments().REACT_APP_GOOGLE_API_TOKEN;

const App = () => {
  return (
    <GoogleOAuthProvider clientId={apiKey}>
      <AuthProvider>
        <SearchProvider>
          <IncidentProvider>
            <BrowserRouter>
              <AppLayout>
                <div>
                  <Routes>
                    <Route
                      exact
                      path="/login"
                      element={
                        <RedirectIfAuthenticated>
                          <LoginPage />
                        </RedirectIfAuthenticated>
                      }
                    />
                    <Route
                      path="/register"
                      element={
                        <RedirectIfAuthenticated>
                          <RegisterPage />
                        </RedirectIfAuthenticated>
                      }
                    />
                    <Route
                      path="/map"
                      element={
                        <ProtectedRoute role="MODERATOR">
                          <LeafMapComponent />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/location/:locationName"
                      element={
                        <ProtectedRoute role="MODERATOR">
                          <LocationPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/statistics"
                      element={
                        <ProtectedRoute role="MODERATOR">
                          <LoginPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<LogoutAndRedirect />} />
                  </Routes>
                </div>
              </AppLayout>
            </BrowserRouter>
          </IncidentProvider>
        </SearchProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
