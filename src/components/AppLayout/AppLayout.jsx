import React from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../Sidebar/Sidebar";

const AppLayout = ({ children }) => {
  const { isAuthenticated } = useAuth(); // Access the authentication state

  return (
    <div>
      {isAuthenticated ? (
        // Show the Sidebar only if the user is authenticated
        <Sidebar>{children}</Sidebar>
      ) : (
        // Just render children without the sidebar for non-authenticated users
        <div>{children}</div>
      )}
    </div>
  );
};

export default AppLayout;
