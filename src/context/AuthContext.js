import React, { createContext, useState, useContext } from "react";
import { loginUser, logout, oauthGmail } from "../service/login.service";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: null,
    jwt: null,
  });

  const handleLogin = async (username, password) => {
    const response = await loginUser(username, password);
    return response;
  };

  const handleLogout = () => {
    logout();
    setAuth({
      isAuthenticated: false,
      role: null,
      jwt: null,
    });
    sessionStorage.clear();
  };

  const handleOauth = async (name, email, googleId) => {
    const res = await oauthGmail(name, email, googleId);
    return res;
  };

  return (
    <AuthContext.Provider
      value={{ auth, setAuth, handleLogin, handleLogout, handleOauth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
