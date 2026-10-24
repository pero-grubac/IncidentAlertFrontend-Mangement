// Build-time configuration (see .env.example).
export const config = {
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:5002",
  mlUrl: import.meta.env.VITE_ML_URL || "http://localhost:5004",
  statisticsUrl: import.meta.env.VITE_STATISTICS_URL || "http://localhost:5006",
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || "",
  googleApiKey: import.meta.env.VITE_GOOGLE_API_KEY || "",
};

export const translationEnabled = Boolean(config.googleApiKey);
export const googleSignInEnabled = Boolean(config.googleClientId);
