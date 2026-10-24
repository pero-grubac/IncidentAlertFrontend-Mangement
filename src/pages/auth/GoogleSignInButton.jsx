import { Box } from "@mui/material";
import { GoogleLogin } from "@react-oauth/google";
import { useI18n } from "../../i18n";

/**
 * Google Identity Services button. It hands back an ID token ("credential") signed by Google,
 * which the API verifies itself — the browser never tells the API who the user is.
 * Rendered only when VITE_GOOGLE_CLIENT_ID is set (it needs <GoogleOAuthProvider>).
 */
export default function GoogleSignInButton({ disabled, onCredential, onError }) {
  const { t, language } = useI18n();
  return (
    <Box sx={{ display: "flex", justifyContent: "center", opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : "auto" }}>
      <GoogleLogin
        onSuccess={({ credential }) => (credential ? onCredential(credential) : onError(new Error(t("auth.login.googleNoToken"))))}
        onError={() => onError(new Error(t("auth.login.googleCancelled")))}
        text="continue_with"
        shape="rectangular"
        width="400"
        locale={language}
      />
    </Box>
  );
}
