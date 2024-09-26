import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./page/LoginPage";
import RegisterPage from "./page/RegisterPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./util/ProtectedRoute";
import LogoutAndRedirect from "./util/LogoutAndRedirect";
const App = () => {
  // TODO searchprovider
  // todo incidentprovider
  return (
    <AuthProvider>
      <BrowserRouter>
        <div>
          <Routes>
            <Route exact path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/map"
              element={
                <ProtectedRoute role="MODERATOR">
                  <LoginPage />
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
    </AuthProvider>
  );
};

export default App;
