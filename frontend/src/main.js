// Add to frontend/src/main.js
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./style.css";
import Icons from "./components/Icons.vue";

const app = createApp(App);
app.use(store);
app.use(router);
app.component("Icons", Icons);

// 🔍 Debug token persistence
window.addEventListener("storage", (e) => {
  if (e.key === "token") {
    console.warn(
      "⚠️ Token changed in localStorage:",
      e.oldValue,
      "->",
      e.newValue
    );
  }
});

// 🔍 Catch axios errors globally
import axios from "axios";
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error("🚫 Auth error detected:", error.config.url);
      // Don't auto-logout here - let the router handle it
    }
    return Promise.reject(error);
  }
);

app.mount("#app");
