import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { auth, isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div>Loading...</div>; // You can replace this with a loader component
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (role && auth.role !== role) {
    return <Navigate to="/register" />;
  }

  return children;
};
export default ProtectedRoute;
