// ============================================
// frontend/vite.config.js
// ============================================
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  server: {
    port: 5173,
    proxy: {
      // 🔹 Forward all /api requests to LOCAL backend
      "/api": {
        target: "http://localhost:5000", // ✅ Use localhost in dev
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        // Optionally log requests for debugging:
        configure: (proxy, options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(
              "🔄 Proxying:",
              req.method,
              req.url,
              "→",
              options.target + req.url.replace(/^\/api/, "")
            );
          });
        },
      },
    },
  },
});

// ============================================
// How it works:
// ============================================
//
// Frontend makes request:
// api.get("/api/menu")
//          ↓
// Vite proxy intercepts /api/* requests
//          ↓
// Strips /api prefix
//          ↓
// Forwards to: http://84.247.20.171:5000/menu
//          ↓
// Backend receives: GET /menu
