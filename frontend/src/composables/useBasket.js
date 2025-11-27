// frontend/src/composables/useBasket.js
import { computed } from "vue";
import { useStore } from "vuex";

export function useBasket() {
  const store = useStore();

  // --- Computed State ---
  const items = computed(() => store.state.basket.items || []);
  const total = computed(() => store.getters["basket/totalPrice"] || 0);
  const itemCount = computed(() => store.getters["basket/totalItems"] || 0);

  // --- Actions ---

  /**
   * Add item to basket
   * @param {Object} payload - Item to add {id, name, price, photo, stock}
   */
  const addItem = (payload) => {
    store.commit("basket/addItem", payload);
  };

  /**
   * Increase quantity of item in basket
   * @param {number} id - Item ID
   */
  const increaseQty = (id) => {
    store.commit("basket/increaseQty", id);
  };

  /**
   * Decrease quantity of item in basket
   * @param {number} id - Item ID
   */
  const decreaseQty = (id) => {
    store.commit("basket/decreaseQty", id);
  };

  /**
   * Remove item from basket
   * @param {number} id - Item ID
   */
  const removeItem = (id) => {
    store.commit("basket/removeItem", id);
  };

  /**
   * Clear entire basket
   */
  const clearBasket = () => {
    store.commit("basket/clearBasket");
  };

  /**
   * Validate basket against current menu (check stock, prices, availability)
   * @returns {Promise<string>} Status: "OK", "UPDATED", "EMPTY", or "ERROR"
   */
  const validateBasket = async () => {
    if (!store.dispatch) return null;
    return await store.dispatch("basket/validateBasket");
  };

  return {
    // State
    items,
    total,
    itemCount,

    // Actions
    addItem,
    increaseQty,
    decreaseQty,
    removeItem,
    clearBasket,
    validateBasket,
  };
}
