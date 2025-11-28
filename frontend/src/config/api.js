// frontend/src/config/api.js
import axios from "axios";

// ALWAYS use relative /api path (works in both dev and prod with Nginx proxy)
const api = axios.create({
  baseURL: "/api",
});

//  For images only, use relative path (Nginx serves them)
export const API_BASE = "";

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("🚫 Auth error:", error.config.url);
    }
    return Promise.reject(error);
  }
);

export default api;
