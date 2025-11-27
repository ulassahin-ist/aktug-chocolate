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

  return {
    branchId,
    tableId,
    tableIdText,
    setBranch,
    setTableId,
    getBranchId,
  };
}
