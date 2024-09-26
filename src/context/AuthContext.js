import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

// TODO login servis
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: null, // "MODERATOR", "ADMIN", itd.
  });

  const login = (role) => {
    setAuth({
      isAuthenticated: true,
      role: role,
    });
    // Moguće pohranjivanje tokena u localStorage ili sessionStorage
  };

  const logout = () => {
    setAuth({
      isAuthenticated: false,
      role: null,
    });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
