import axios from "axios";
import environment from "../Enviroments";
const baseUrlConfig = {
  baseUrl: environment().baseServiceUrl,
};
// eslint-disable-next-line import/no-anonymous-default-export
export default {
  service: (useAuth, contentType) => {
    const instance = axios.create({
      baseURL: baseUrlConfig.baseUrl,
      withCredentials: true,
    });
    instance.defaults.headers.common["Content-Type"] = contentType;
    if (useAuth) {
      instance.interceptors.request.use(
        async (config) => {
          const token = sessionStorage.getItem("auth");
          if (token) {
            const parsedToken = JSON.parse(token);
           
            config.headers = {
              ...config.headers,
              Authorization: `Bearer ${parsedToken.jwt}`,
            };
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );
    }
    return instance;
  },
};
