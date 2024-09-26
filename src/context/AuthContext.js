import React, { createContext, useState, useContext } from "react";
import { loginUser, logout, oauthGmail } from "../service/login.service";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: null,
    jwt: null,
  });

  const handleLogin = async (username, password) => {
    const response = await loginUser(username, password);
    const token = response.data;
    const decodedToken = jwtDecode(token);
    setAuth({
      isAuthenticated: true,
      role: decodedToken.role,
      jwt: token,
    });
    sessionStorage.setItem("jwt", token);
    return response;
  };

  const handleLogout = () => {
    logout();
    setAuth({
      isAuthenticated: false,
      role: null,
      jwt: null,
    });
  };

  const handleOuath = async (oiduser) => {
    const response = await oauthGmail(oiduser);
    const token = response.data;
    const decodedToken = jwtDecode(token);
    setAuth({
      isAuthenticated: true,
      role: decodedToken.role,
      jwt: token,
    });
  };

  return (
    <AuthContext.Provider
      value={{ auth, handleLogin, handleLogout, handleOuath }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
