// frontend/src/store/modules/branchSettings.js
import api from "@/config/api";

export default {
  namespaced: true,

  state: () => ({
    // Current branch settings (loaded from backend)
    settings: null,

    // Loading state
    loading: false,

    // Error state
    error: null,

    // Last fetch timestamp
    lastFetched: null,

    // Cache duration (5 minutes)
    cacheDuration: 5 * 60 * 1000,
  }),

  getters: {
    // Get all settings
    settings: (state) => state.settings,

    // Individual setting getters with fallbacks
    menuDefaultStock: (state) => state.settings?.menuDefaultStock ?? 20,
    menuDefaultPrice: (state) => state.settings?.menuDefaultPrice ?? 400,
    stockWarnEnabled: (state) => !!state.settings?.stockWarnEnabled,
    stockWarnThreshold: (state) => state.settings?.stockWarnThreshold ?? 5,
    showInactiveMenuItems: (state) => !!state.settings?.showInactiveMenuItems,
    showOutOfStockItems: (state) => !!state.settings?.showOutOfStockItems,
    ordersAutoRefreshEnabled: (state) =>
      state.settings?.ordersAutoRefreshEnabled ?? true,
    ordersAutoRefreshSeconds: (state) =>
      state.settings?.ordersAutoRefreshSeconds ?? 15,

    // Check if settings are loaded
    isLoaded: (state) => state.settings !== null,

    // Check if cache is still valid
    isCacheValid: (state) => {
      if (!state.lastFetched) return false;
      return Date.now() - state.lastFetched < state.cacheDuration;
    },

    // Loading state
    isLoading: (state) => state.loading,

    // Error state
    hasError: (state) => state.error !== null,
    error: (state) => state.error,
  },

  mutations: {
    SET_SETTINGS(state, settings) {
      state.settings = settings;
      state.lastFetched = Date.now();
      state.error = null;
    },

    SET_LOADING(state, loading) {
      state.loading = loading;
    },

    SET_ERROR(state, error) {
      state.error = error;
      state.loading = false;
    },

    CLEAR_SETTINGS(state) {
      state.settings = null;
      state.lastFetched = null;
      state.error = null;
    },

    UPDATE_SETTING(state, { key, value }) {
      if (state.settings) {
        state.settings[key] = value;
      }
    },
  },

  actions: {
    /**
     * Fetch branch settings from backend
     * @param {boolean} force - Force refresh even if cache is valid
     */
    async fetchSettings({ commit, getters, rootState }, force = false) {
      // Skip if cache is valid and not forcing refresh
      if (!force && getters.isCacheValid) {
        return getters.settings;
      }

      const branchId = rootState.branchId;
      if (!branchId) {
        commit("SET_ERROR", "No branch ID available");
        return null;
      }

      commit("SET_LOADING", true);
      commit("SET_ERROR", null);

      try {
        const res = await api.get(`/branches/${branchId}`);
        const settings = res.data;

        commit("SET_SETTINGS", settings);
        return settings;
      } catch (err) {
        const errorMsg =
          err.response?.data?.error || "Failed to load branch settings";
        commit("SET_ERROR", errorMsg);
        console.error("❌ Failed to fetch branch settings:", err);

        // Return default settings on error
        return {
          menuDefaultStock: 20,
          menuDefaultPrice: 400,
          stockWarnEnabled: true,
          stockWarnThreshold: 5,
          showInactiveMenuItems: false,
          showOutOfStockItems: false,
          ordersAutoRefreshEnabled: true,
          ordersAutoRefreshSeconds: 15,
        };
      } finally {
        commit("SET_LOADING", false);
      }
    },

    /**
     * Update a single setting
     */
    async updateSetting({ commit, rootState }, { key, value }) {
      const branchId = rootState.branchId;
      if (!branchId) {
        throw new Error("No branch ID available");
      }

      try {
        await api.post(`/branches/${branchId}/settings`, {
          [key]: value,
        });

        commit("UPDATE_SETTING", { key, value });
        return true;
      } catch (err) {
        console.error(`❌ Failed to update setting ${key}:`, err);
        throw err;
      }
    },

    /**
     * Update multiple settings at once
     */
    async updateSettings({ commit, dispatch, rootState }, settings) {
      const branchId = rootState.branchId;
      if (!branchId) {
        throw new Error("No branch ID available");
      }

      try {
        await api.post(`/branches/${branchId}/settings`, settings);

        // Refresh settings from backend to ensure consistency
        await dispatch("fetchSettings", true);
        return true;
      } catch (err) {
        console.error("❌ Failed to update settings:", err);
        throw err;
      }
    },

    /**
     * Clear settings (e.g., on logout or branch change)
     */
    clearSettings({ commit }) {
      commit("CLEAR_SETTINGS");
    },
  },
};
