import axios from "axios";
import { config } from "../config";
import { currentToken } from "./session";
import { translate } from "../i18n";

export const SESSION_EXPIRED = "incident-alert:session-expired";

function withAuth(instance) {
  instance.interceptors.request.use((request) => {
    const token = currentToken();
    if (token) request.headers.Authorization = `Bearer ${token}`;
    return request;
  });
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      // An expired or revoked token sends the moderator back to the sign-in page.
      if (error.response?.status === 401 && currentToken()) window.dispatchEvent(new Event(SESSION_EXPIRED));
      return Promise.reject(error);
    },
  );
  return instance;
}

export const api = withAuth(axios.create({ baseURL: config.apiUrl }));
// ML and Statistics accept the same moderator token as the Management API.
export const mlApi = withAuth(axios.create({ baseURL: config.mlUrl }));
export const statisticsApi = withAuth(axios.create({ baseURL: config.statisticsUrl }));

/** Turns an API failure into one line a person can read. */
export function errorMessage(error, fallback = translate("errors.generic")) {
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (data?.Message) return data.Message;
  if (error?.response?.status === 403) return translate("errors.forbidden");
  if (error?.code === "ERR_NETWORK") return translate("errors.network");
  return fallback;
}
