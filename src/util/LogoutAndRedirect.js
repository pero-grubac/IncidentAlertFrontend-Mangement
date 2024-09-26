import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const LogoutAndRedirect = () => {
  const { handleLogout } = useAuth();

  useEffect(() => {
    handleLogout();
  }, [handleLogout]);

  // Preusmjerite korisnika na login
  return <Navigate to="/login" />;
};

export default LogoutAndRedirect;
