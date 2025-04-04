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
      // Ensure headers object exists
      config.headers = config.headers || {};
      // Add the auth token header
      // Use 'auth-token' as requested.
      // If using the standard, it would be: config.headers['Authorization'] = `Bearer ${token}`;
      config.headers["auth-token"] = token;
    }
    return config; // Return the modified config
  },
  (error) => {
    // Handle request error (e.g., network issue before sending)
    return Promise.reject(error);
  }
);

// Optional: Response Interceptor (useful for handling global errors like 401)
apiClient.interceptors.response.use(
  (response) => {
    // Any successful status code lies within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access globally (e.g., redirect to login, clear token)
      console.error("Unauthorized! Redirecting to login...");
      // window.location.href = '/login'; // Example redirect
      // clearToken(); // You might have a function to clear the token
    }
    // Do something with response error
    return Promise.reject(error);
  }
);

export default apiClient;
