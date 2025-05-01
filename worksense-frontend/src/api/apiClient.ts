// src/apiClient.ts (or a similar location)
import axios from "axios";
import { authService } from "../services/auth.ts";
import { API_URL } from "../../config/env.config.ts"

const FULL_API_URL = API_URL + "/api/v1";

const apiClient = axios.create({
  baseURL: FULL_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers["auth-token"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error("Unauthorized! Redirecting to login...");
      authService.logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
