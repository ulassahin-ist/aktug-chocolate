// frontend/src/store/index.js
import { createStore } from "vuex";
import axios from "axios";
import basketModule from "./modules/basket";

const store = createStore({
  state: {
    token: localStorage.getItem("token") || "",
    role: localStorage.getItem("role") || "",
    user: JSON.parse(localStorage.getItem("user") || "null"),
    branchId: parseInt(localStorage.getItem("branchId")) || null,
    tableId: parseInt(localStorage.getItem("tableId")) || null,
  },

  mutations: {
    setTableId(state, tableId) {
      state.tableId = tableId;
      if (tableId != null) {
        localStorage.setItem("tableId", tableId);
      } else {
        localStorage.removeItem("tableId");
      }
    },

    setBranch(state, branchId) {
      state.branchId = branchId;
      if (branchId != null) {
        localStorage.setItem("branchId", branchId);
      } else {
        localStorage.removeItem("branchId");
      }
    },

    setAuth(state, { token, role, user, branchId }) {
      state.token = token;
      state.role = role;
      state.user = user;

      // Use branchId from login params, NOT from user object
      if (branchId != null) {
        state.branchId = branchId;
      }

      // Persist to localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("user", JSON.stringify(user));
      if (state.branchId != null) {
        localStorage.setItem("branchId", state.branchId);
      }

      // Set default Authorization header
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    },

    logout(state) {
      state.token = "";
      state.role = "";
      state.user = null;
      // ⚠️ DON'T clear branchId or tableId - keep them for QR session

      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("user");
      delete axios.defaults.headers.common["Authorization"];
    },
  },

  actions: {
    async login({ state, commit }, { username, password }) {
      try {
        const branchId = state.branchId || 1;

        const res = await axios.post("/api/auth/login", {
          username,
          password,
          branchId,
        });

        commit("setAuth", {
          token: res.data.token,
          role: res.data.user.role,
          user: res.data.user,
          branchId: branchId,
        });

        return true;
      } catch (err) {
        console.error("Login failed:", err?.response?.data || err);
        return false;
      }
    },

    async validateToken({ state, commit }) {
      if (!state.token) return false;

      try {
        await axios.get("/api/menu", {
          params: { branchId: state.branchId || 1 },
          headers: { Authorization: `Bearer ${state.token}` },
        });
        return true;
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.warn("Token expired or invalid, logging out");
          commit("logout");
          return false;
        }
        return true;
      }
    },
  },

  modules: {
    basket: basketModule,
  },
});

// Set axios default header on store creation if token exists
if (store.state.token) {
  axios.defaults.headers.common[
    "Authorization"
  ] = `Bearer ${store.state.token}`;
}

export default store;
