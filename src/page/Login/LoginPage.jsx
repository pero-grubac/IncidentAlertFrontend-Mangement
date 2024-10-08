import React, { useState } from "react";
import "./LoginPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faLock } from "@fortawesome/free-solid-svg-icons";
import { Snackbar, Alert } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // Snackbar
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const { handleLogin, setAuth, handleOauth } = useAuth();

  const navigate = useNavigate();
  const clearFields = () => {
    setPassword("");
    setUsername("");
    setEmail("");
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  };

  const handleCloseSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const handleLoginClick = async (e) => {
    e.preventDefault();
    try {
      const response = await handleLogin("admin3", "admin3?A");
      if (response.status === 200) {
        const token = response.data;
        const decodedToken = jwtDecode(token);
        setAuth({
          isAuthenticated: true,
          role: decodedToken.role,
          jwt: token,
        });
        showMessage("Login successful!", "success");
        navigate("/map");
      } else {
        showMessage("Login failed. Please check your credentials.", "error");
      }
    } catch (error) {
      console.log(error);
      showMessage("Login failed. Please check your credentials.", "error");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );

        await handleBackendOauth(
          userInfo.data.name,
          userInfo.data.email,
          userInfo.data.sub
        );
      } catch (error) {
        console.log(error);
        showMessage("Login failed. Please check your credentials.", "error");
      }
    },
  });

  const handleBackendOauth = async (name, email, googleId) => {
    try {
      const response = await handleOauth(name, email, googleId);
      if (response.status === 200) {
        const token = response.data;
        const decodedToken = jwtDecode(token);
        setAuth({
          isAuthenticated: true,
          role: decodedToken.role,
          jwt: token,
        });
        showMessage("Login successful!", "success");
        navigate("/map");
      } else if (response.status === 201) {
        showMessage(
          "Account created successfully! Wait to be approved",
          "success"
        );
      } else {
        showMessage("Login failed. Please check your credentials.", "error");
      }
    } catch (error) {
      console.log(error);
      showMessage("Login failed. Please check your credentials.", "error");
    }
  };
  return (
    <div className="login-page">
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={handleCloseSnackBar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackBar}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>

      <div className="wrapper">
        <div className="form-box login">
          <form action="">
            <h1>Login</h1>
            <div className="input-box">
              <FontAwesomeIcon icon={faUser} className="icon" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label>Username</label>
            </div>
            <div className="input-box">
              <FontAwesomeIcon icon={faLock} className="icon" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label>Password</label>
            </div>
            <button type="submit" onClick={handleLoginClick}>
              Login
            </button>
            <br />
            <br />
            <div>
              <button onClick={() => googleLogin()}>
                Sign in with Google 🚀
              </button>
            </div>
            <div className="register-link">
              <p>
                Don't have an account? <Link to="/register">Register</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
