import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from "./page/Login/LoginPage";
import RegisterPage from "./page/Register/RegisterPage";
import MapPage from "./page/Map/MapPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./util/ProtectedRoute";
import LogoutAndRedirect from "./util/LogoutAndRedirect";
import { SearchProvider } from "./context/SearchContext";
import { IncidentProvider } from "./context/IncidentContext";
import LocationPage from "./page/Location/LocationPage";
const App = () => {
  return (
    <AuthProvider>
      <SearchProvider>
        <IncidentProvider>
          <BrowserRouter>
            <div>
              <Routes>
                <Route exact path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                  path="/map"
                  element={
                    <ProtectedRoute role="MODERATOR">
                      <MapPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/location/:locationName"
                  element={
                    <ProtectedRoute role="MODERATOR">
                      <LoginPage />
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
          </BrowserRouter>
        </IncidentProvider>
      </SearchProvider>
    </AuthProvider>
  );
};

export default App;
