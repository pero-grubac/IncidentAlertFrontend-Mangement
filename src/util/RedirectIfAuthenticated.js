import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RedirectIfAuthenticated = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users to the "/map" page
  if (isAuthenticated) {
    return <Navigate to="/map" />;
  }

  return children; // If not authenticated, render the wrapped component (Login/Register)
};

export default RedirectIfAuthenticated;
