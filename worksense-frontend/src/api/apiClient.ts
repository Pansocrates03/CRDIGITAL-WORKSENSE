// src/apiClient.ts (or a similar location)
import axios from "axios";
import { authService } from "../services/auth.ts"; // Adjust path as needed

const API_URL = "your_api_base_url"; // Define your API base URL

const apiClient = axios.create({
  baseURL: API_URL, // Set base URL for all requests using this instance
  headers: {
    "Content-Type": "application/json", // Example default header
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
      window.location.href = "/login"; // You might have a function to clear the token
    }
    // Do something with response error
    return Promise.reject(error);
  }
);

export default apiClient;
