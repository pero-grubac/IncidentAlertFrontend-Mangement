import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const LogoutAndRedirect = () => {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  // Preusmjerite korisnika na login
  return <Navigate to="/login" />;
};

export default LogoutAndRedirect;
