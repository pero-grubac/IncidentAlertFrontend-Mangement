import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Alert, Button, Link, Stack, TextField, Typography } from "@mui/material";
import AuthLayout from "./AuthLayout";
import PasswordField from "./PasswordField";
import { register } from "../../api/endpoints";
import { errorMessage } from "../../api/client";
import { passwordProblems } from "../../lib/password";
import { useT } from "../../i18n";

export default function RegisterPage() {
  const t = useT();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [failure, setFailure] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    const found = {};
    if (!/^[a-zA-Z0-9._@+-]{3,}$/.test(form.username)) found.username = t("auth.register.errors.username");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) found.email = t("auth.register.errors.email");
    const problems = passwordProblems(form.password);
    if (problems.length)
      found.password = t("auth.register.errors.password", { list: problems.map((p) => t(`auth.register.rules.${p}`)).join(", ") });
    if (form.confirm !== form.password) found.confirm = t("auth.register.errors.confirm");
    setErrors(found);
    if (Object.keys(found).length) return;

    setBusy(true);
    setFailure(null);
    try {
      await register({ username: form.username, email: form.email, password: form.password });
      navigate("/login", { state: { registered: true } });
    } catch (error) {
      setFailure(errorMessage(error, t("auth.register.failed")));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout title={t("auth.register.title")} subtitle={t("auth.register.subtitle")}>
      <Stack component="form" spacing={2.25} onSubmit={submit} noValidate>
        {failure && <Alert severity="error">{failure}</Alert>}
        <TextField label={t("auth.username")} value={form.username} onChange={set("username")} error={Boolean(errors.username)} helperText={errors.username} autoComplete="username" fullWidth autoFocus />
        <TextField label={t("auth.email")} type="email" value={form.email} onChange={set("email")} error={Boolean(errors.email)} helperText={errors.email} autoComplete="email" fullWidth />
        <PasswordField label={t("auth.password")} value={form.password} onChange={set("password")} error={Boolean(errors.password)} helperText={errors.password ?? t("auth.register.policy")} autoComplete="new-password" fullWidth />
        <PasswordField label={t("auth.register.repeat")} value={form.confirm} onChange={set("confirm")} error={Boolean(errors.confirm)} helperText={errors.confirm} autoComplete="new-password" fullWidth />
        <Button type="submit" size="large" variant="contained" disabled={busy}>
          {busy ? t("auth.register.submitting") : t("auth.register.submit")}
        </Button>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ pt: 1 }}>
          {t("auth.register.haveAccount")}{" "}
          <Link component={RouterLink} to="/login" fontWeight={600} underline="hover">
            {t("auth.register.signIn")}
          </Link>
        </Typography>
      </Stack>
    </AuthLayout>
  );
}
