import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, authRole }) => {
  const {  isAuthenticated, loading, role } = useAuth();
  if (loading) {
    return <div>Loading...</div>; // You can replace this with a loader component
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (authRole && role !== authRole) {
    return <Navigate to="/register" />;
  }

  return children;
};
export default ProtectedRoute;
