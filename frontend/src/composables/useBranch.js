// composables/useBranch.js
import { computed } from "vue";
import { useStore } from "vuex";

export function useBranch() {
  const store = useStore();

  const branchId = computed(() => store.state.branchId || 1);
  const tableId = computed(() => store.state.tableId ?? null);

  const setBranch = (id) => {
    store.commit("setBranch", Number(id) || 1);
  };

  const setTableId = (id) => {
    const n = Number(id);
    if (!Number.isNaN(n) && n > 0) {
      store.commit("setTableId", n);
    }
  };

  const getBranchId = () => branchId.value;

  const tableIdText = computed(() =>
    tableId.value ? `Masa ${tableId.value}` : "Masa bilgisi yok"
  );

  // 🔹 settings module getters
  const branchSettings = computed(
    () => store.getters["branchSettings/settings"]
  );

  const menuDefaultStock = computed(
    () => store.getters["branchSettings/menuDefaultStock"]
  );
  const menuDefaultPrice = computed(
    () => store.getters["branchSettings/menuDefaultPrice"]
  );

  const stockWarnEnabled = computed(
    () => store.getters["branchSettings/stockWarnEnabled"]
  );
  const stockWarnThreshold = computed(
    () => store.getters["branchSettings/stockWarnThreshold"]
  );

  const showInactiveMenuItems = computed(
    () => store.getters["branchSettings/showInactiveMenuItems"]
  );
  const showOutOfStockItems = computed(
    () => store.getters["branchSettings/showOutOfStockItems"]
  );

  const ordersAutoRefreshEnabled = computed(
    () => store.getters["branchSettings/ordersAutoRefreshEnabled"]
  );
  const ordersAutoRefreshSeconds = computed(
    () => store.getters["branchSettings/ordersAutoRefreshSeconds"]
  );

  // 🔹 fetch action
  const fetchBranchSettings = async (force = false) => {
    return await store.dispatch("branchSettings/fetchSettings", force);
  };

  return {
    branchId,
    tableId,
    tableIdText,
    setBranch,
    setTableId,
    getBranchId,

    // settings
    branchSettings,
    menuDefaultStock,
    menuDefaultPrice,
    stockWarnEnabled,
    stockWarnThreshold,
    showInactiveMenuItems,
    showOutOfStockItems,
    ordersAutoRefreshEnabled,
    ordersAutoRefreshSeconds,
    fetchBranchSettings,
  };
}
