import React, { createContext, useState, useContext, useEffect } from "react";
import { loginUser, logout, oauthGmail } from "../service/login.service";
import { register } from "../service/register.service";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    role: null,
    jwt: null,
  });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      setAuth(parsedAuth);
    }
    setLoading(false);
  }, []);
  useEffect(() => {
    if (auth.isAuthenticated) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth");
    }
  }, [auth]);

  const handleLogin = async (username, password) => {
    const response = await loginUser(username, password);
    if (response.status === 200) {
      const token = response.data;
      const decodedToken = jwtDecode(token);
      setAuth({
        isAuthenticated: true,
        role: decodedToken.role,
        jwt: token,
      });
    }
    return response;
  };

  const handleLogout = () => {
    logout();
    setAuth({
      isAuthenticated: false,
      role: null,
      jwt: null,
    });
    localStorage.removeItem("auth");
    sessionStorage.clear();
  };

  const handleOauth = async (name, email, googleId) => {
    const res = await oauthGmail(name, email, googleId);
    if (res.status === 200) {
      const token = res.data;
      const decodedToken = jwtDecode(token);
      setAuth({
        isAuthenticated: true,
        role: decodedToken.role,
        jwt: token,
      });
    }
    return res;
  };
  const handleRegister = async (username, password, email) => {
    const res = await register(username, password, email);
    return res;
  };
  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        handleLogin,
        handleLogout,
        handleOauth,
        handleRegister,
        isAuthenticated: auth.isAuthenticated,
        role: auth.role,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
