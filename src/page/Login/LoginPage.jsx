import React, { useState, useEffect } from "react";
import "./LoginPage.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faLock,
  faUserSecret,
} from "@fortawesome/free-solid-svg-icons";
import { Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // Snackbar
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  const { handleLogin } = useAuth();

  const navigate = useNavigate();
  const clearFields = () => {
    setPassword("");
    setUsername("");
    setEmail("");
  };
  const registerLink = () => {
    clearFields();
    navigate("/register");
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
      const response = await handleLogin(username, password);
      if (response.status === 200) {
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
      console.log(tokenResponse);
      try {
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          }
        );
        console.log(userInfo);
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <div className={`wrapper`}>
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
              Don't have an account?{" "}
              <a href="#" onClick={registerLink}>
                Register
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
export default LoginPage;
