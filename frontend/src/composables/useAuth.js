// frontend/src/composables/useAuth.js
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

export function useAuth() {
  const store = useStore();
  const router = useRouter();

  // --- state / derived state ---
  const token = computed(() => store.state.token);
  const user = computed(() => store.state.user);
  const role = computed(() => store.state.role);

  const isLoggedIn = computed(() => !!store.state.token);
  const isAdmin = computed(() => store.state.role === "admin");
  const isStaff = computed(() => store.state.role === "staff");
  const isStaffOrAdmin = computed(() =>
    ["admin", "staff"].includes(store.state.role)
  );
  const isCustomer = computed(() => !isStaffOrAdmin.value);

  // --- actions that wrap store / routing ---

  const login = async (username, password) => {
    return await store.dispatch("login", { username, password });
  };

  const logout = () => {
    store.commit("logout");
    store.commit("basket/clearBasket");
    window.$toast?.("Çıkış yapıldı.", "success");
    router.push("/");
  };

  // optional: if you have such an action
  const validateToken = async () => {
    if (!store.dispatch) return;
    return await store.dispatch("validateToken");
  };

  // Permissions helpers
  const requireAdmin = (showToast = true) => {
    if (!isAdmin.value) {
      if (showToast) {
        window.$toast?.("Bu işlem için yönetici yetkisi gerekli", "error");
      }
      return false;
    }
    return true;
  };

  const requireStaffOrAdmin = (showToast = true) => {
    if (!isStaffOrAdmin.value) {
      if (showToast) {
        window.$toast?.("Bu işlem için personel yetkisi gerekli", "error");
      }
      return false;
    }
    return true;
  };

  return {
    // state
    token,
    user,
    role,
    isLoggedIn,
    isAdmin,
    isStaff,
    isStaffOrAdmin,
    isCustomer,

    // actions
    login,
    logout,
    validateToken,
    requireAdmin,
    requireStaffOrAdmin,
  };
}
