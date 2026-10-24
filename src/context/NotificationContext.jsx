import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const NotificationContext = createContext(() => {});

/** App-wide toast: `notify("Saved", "success")`. */
export function NotificationProvider({ children }) {
  const [toast, setToast] = useState(null);

  const notify = useCallback((message, severity = "info") => {
    setToast({ message, severity, key: Date.now() });
  }, []);

  const close = (_event, reason) => {
    if (reason !== "clickaway") setToast(null);
  };

  const value = useMemo(() => notify, [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        key={toast?.key}
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {toast ? (
          <Alert onClose={close} severity={toast.severity} variant="filled" sx={{ boxShadow: 4 }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export const useNotify = () => useContext(NotificationContext);
