import { useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Alert, Button, Divider, Link, Stack, TextField, Typography } from "@mui/material";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import AuthLayout from "./AuthLayout";
import GoogleSignInButton from "./GoogleSignInButton";
import PasswordField from "./PasswordField";
import { STAFF, useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../api/client";
import { googleSignInEnabled } from "../../config";
import { useT } from "../../i18n";

export default function LoginPage() {
  const t = useT();
  const { login, loginWithGoogle, logout, expired } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    state?.registered ? { severity: "success", key: "auth.login.created" } : expired ? { severity: "info", key: "auth.login.expired" } : null,
  );

  const enter = (session) => {
    if (!STAFF.includes(session.role)) {
      logout();
      setMessage({ severity: "warning", key: "auth.login.cannotModerate" });
      return;
    }
    navigate(state?.from ?? "/map", { replace: true });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!username.trim() || !password) {
      setMessage({ severity: "error", key: "auth.login.required" });
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      enter(await login(username.trim(), password));
    } catch (error) {
      setMessage({ severity: "error", text: errorMessage(error, t("auth.login.failed")) });
    } finally {
      setBusy(false);
    }
  };

  const google = async (idToken) => {
    setBusy(true);
    setMessage(null);
    try {
      const result = await loginWithGoogle(idToken);
      if (result.created) setMessage({ severity: "success", key: "auth.login.created" });
      else enter(result);
    } catch (error) {
      setMessage({ severity: "error", text: errorMessage(error, t("auth.login.googleFailed")) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title={t("auth.login.title")} subtitle={t("auth.login.subtitle")}>
      <Stack component="form" spacing={2.25} onSubmit={submit} noValidate>
        {/* Messages keep their key, so they follow a language switch. */}
        {message && <Alert severity={message.severity}>{message.key ? t(message.key) : message.text}</Alert>}
        <TextField label={t("auth.username")} value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" autoFocus fullWidth />
        <PasswordField label={t("auth.password")} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" fullWidth />
        <Button type="submit" size="large" variant="contained" disabled={busy} endIcon={<LoginRoundedIcon />}>
          {busy ? t("auth.login.submitting") : t("auth.login.submit")}
        </Button>

        {googleSignInEnabled && (
          <>
            <Divider>
              <Typography variant="caption" color="text.secondary">
                {t("auth.login.or")}
              </Typography>
            </Divider>
            <GoogleSignInButton disabled={busy} onCredential={google} onError={(e) => setMessage({ severity: "error", text: errorMessage(e, e.message) })} />
          </>
        )}

        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ pt: 1 }}>
          {t("auth.login.newModerator")}{" "}
          <Link component={RouterLink} to="/register" fontWeight={600} underline="hover">
            {t("auth.login.createAccount")}
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
