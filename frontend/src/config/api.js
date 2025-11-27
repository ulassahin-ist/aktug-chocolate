// ============================================
// frontend/src/config/api.js
// ============================================
import axios from "axios";

// 🔹 Backend base URL - ONLY for static assets (images, uploads)
// Use localhost in development, server IP in production
const isDev = import.meta.env.DEV;
export const API_BASE = isDev
  ? "http://localhost:5000" // ✅ Local development
  : "http://84.247.20.171:5000"; // ✅ Production

// 🔹 API client uses RELATIVE URLs (Vite proxy will forward to backend)
const api = axios.create({
  baseURL: "/api", // ✅ Relative - Vite proxy handles this
});

// 🔹 Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 Handle auth errors
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

// ============================================
// Usage Examples:
// ============================================
//
// API calls (relative):
// await api.get("/menu")  → Vite proxy → http://84.247.20.171:5000/api/menu
//
// Images (absolute):
// <img :src="API_BASE + item.photo" />  → http://84.247.20.171:5000/uploads/photo.jpg
