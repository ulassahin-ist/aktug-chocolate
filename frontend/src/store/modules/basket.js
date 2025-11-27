// frontend/src/store/modules/basket.js
import api from "@/config/api";

export default {
  namespaced: true,

  state: () => ({
    items: JSON.parse(localStorage.getItem("basket") || "[]"),
  }),

  getters: {
    items(state) {
      return state.items;
    },
    totalItems(state) {
      return state.items.reduce((sum, i) => sum + i.qty, 0);
    },
    totalPrice(state) {
      return state.items.reduce((sum, i) => sum + i.qty * i.price, 0);
    },
  },

  mutations: {
    setBasket(state, items) {
      state.items = items;
      localStorage.setItem("basket", JSON.stringify(items));
    },

    addItem(state, item) {
      const found = state.items.find((i) => i.id === item.id);

      // ✅ Respect stock limit
      if (found) {
        if (found.qty < item.stock) found.qty++;
      } else {
        state.items.push({ ...item, qty: 1, stock: item.stock });
      }

      localStorage.setItem("basket", JSON.stringify(state.items));
    },

    increaseQty(state, id) {
      const i = state.items.find((i) => i.id === id);
      if (!i) return;

      // ✅ Respect stock limit
      if (i.qty < i.stock) {
        i.qty++;
        localStorage.setItem("basket", JSON.stringify(state.items));
      } else {
        window.$toast("Bu ürün stokta daha fazla yok", "error");
      }
    },

    decreaseQty(state, id) {
      const i = state.items.find((i) => i.id === id);
      if (!i) return;

      i.qty--;
      if (i.qty <= 0) state.items = state.items.filter((x) => x.id !== id);
      localStorage.setItem("basket", JSON.stringify(state.items));
    },

    removeItem(state, id) {
      state.items = state.items.filter((i) => i.id !== id);
      localStorage.setItem("basket", JSON.stringify(state.items));
    },

    clearBasket(state) {
      state.items = [];
      localStorage.removeItem("basket");
    },
  },

  actions: {
    async validateBasket({ state, commit, rootState }) {
      if (!state.items.length) return "EMPTY";

      const branchId = rootState.branchId || 1;

      try {
        const res = await api.get(`/api/menu`, {
          params: { branchId },
          // ⚠️ DON'T send auth header - basket validation should work for guests
          validateStatus: (status) => status < 500, // Accept 4xx errors
        });

        // If we got 401/403, it means auth is required but token is invalid
        // DON'T clear the basket, just return error
        if (res.status === 401 || res.status === 403) {
          console.warn("Auth required for menu, skipping basket validation");
          return "ERROR";
        }

        const menu = res.data;
        let updated = [];
        let changed = false;

        for (const item of state.items) {
          const dbItem = menu.find((m) => m.id === item.id);

          if (!dbItem) {
            changed = true;
            continue; // item was deleted
          }

          if (!dbItem.available || dbItem.stock <= 0) {
            changed = true;
            continue; // item not available
          }

          if (dbItem.stock < item.qty) {
            item.qty = dbItem.stock;
            item.stock = dbItem.stock; // Update stock info
            changed = true;
          }

          // Update price if it changed
          if (item.price !== dbItem.price) {
            item.price = dbItem.price;
            changed = true;
          }

          updated.push(item);
        }

        if (changed) {
          commit("setBasket", updated);
          return "UPDATED";
        }

        return "OK";
      } catch (err) {
        console.error("❌ validateBasket error:", err?.response?.data || err);

        // ⚠️ CRITICAL: Don't clear basket on network errors
        // Just return error status
        return "ERROR";
      }
    },

    addItem({ commit }, item) {
      commit("addItem", item);
    },
    removeItem({ commit }, id) {
      commit("removeItem", id);
    },
    clearBasket({ commit }) {
      commit("clearBasket");
    },
  },
};
