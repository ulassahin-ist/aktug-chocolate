<template>
  <div class="reports">
    <!-- 🔹 Filter Bar -->
    <div class="filters">
      <div class="filters-left">
        <label>
          Başlangıç:
          <input type="date" v-model="startDate" />
        </label>
        <label>
          Bitiş:
          <input type="date" v-model="endDate" />
        </label>
      </div>

      <div class="filters-right">
        <button @click="setQuickRange('today')">Bugün</button>
        <button @click="setQuickRange('yesterday')">Dün</button>
        <button @click="setQuickRange('last7')">Son 7 Gün</button>
        <button @click="clearFilters">Tümü</button>
      </div>
    </div>

    <!-- 🔹 Summary -->
    <div class="summary" v-if="orders.length">
      <span>
        Gösterilen: <strong>{{ filteredOrders.length }}</strong> sipariş
      </span>
      <span>
        Toplam Tutar: <strong>{{ formatPrice(totalAmount) }}</strong>
      </span>
    </div>

    <div class="scroll-wrapper">
      <table class="menu-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Masa</th>
            <th>Toplam</th>
            <th>Tarih</th>
            <th>Ürünler</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="(order, idx) in paginated" :key="order.id">
            <td>{{ idx + 1 + (page - 1) * perPage }}</td>
            <td>{{ order.tableNumber || "-" }}</td>
            <td>{{ formatPrice(order.total) }}</td>
            <td>{{ formatDate(order.orderTime) }}</td>
            <td>
              <div class="items-list">
                <span
                  v-for="item in order.items"
                  :key="item.itemId"
                  class="item-pill"
                >
                  {{ item.name }} x{{ item.qty }}
                </span>
              </div>
            </td>
          </tr>

          <tr v-if="!filteredOrders.length">
            <td colspan="5" style="padding: 2rem; color: #999">
              Seçilen tarihlerde tamamlanmış sipariş yok
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="filteredOrders.length" class="pagination">
      <button :disabled="page === 1" @click="page--">←</button>
      <span>Sayfa {{ page }} / {{ totalPages }}</span>
      <button :disabled="page === totalPages" @click="page++">→</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import api from "@/config/api";
import { useGlobal } from "@/composables";

const { formatPrice, formatDate } = useGlobal();

const orders = ref([]);
const page = ref(1);
const perPage = 10;

// 🔹 Date filters (YYYY-MM-DD from <input type="date">)
const startDate = ref("");
const endDate = ref("");

// Fetch all completed orders once; filter on frontend
const fetchOrders = async () => {
  try {
    const res = await api.get(`/api/orders/completed`);
    orders.value = res.data || [];
  } catch (err) {
    console.error("Reports error:", err);
  }
};

onMounted(fetchOrders);

// 🔹 Filtered by date range
const filteredOrders = computed(() => {
  if (!startDate.value && !endDate.value) return orders.value;

  const start = startDate.value
    ? new Date(startDate.value + "T00:00:00")
    : null;
  const end = endDate.value ? new Date(endDate.value + "T23:59:59.999") : null;

  return orders.value.filter((o) => {
    const d = new Date(o.orderTime);
    if (start && d < start) return false;
    if (end && d > end) return false;
    return true;
  });
});

// If filter changes, go back to page 1
watch([startDate, endDate, orders], () => {
  page.value = 1;
});

// 🔹 Pagination uses filteredOrders
const totalPages = computed(() => {
  if (!filteredOrders.value.length) return 1;
  return Math.ceil(filteredOrders.value.length / perPage);
});

const paginated = computed(() => {
  const start = (page.value - 1) * perPage;
  return filteredOrders.value.slice(start, start + perPage);
});

// 🔹 Summary: total amount for current filter
const totalAmount = computed(() =>
  filteredOrders.value.reduce((sum, o) => sum + Number(o.total || 0), 0)
);

// 🔹 Quick range helpers
const setQuickRange = (type) => {
  const today = new Date();
  const toISODate = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD

  if (type === "today") {
    const d = new Date();
    startDate.value = toISODate(d);
    endDate.value = toISODate(d);
  } else if (type === "yesterday") {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    startDate.value = toISODate(d);
    endDate.value = toISODate(d);
  } else if (type === "last7") {
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    startDate.value = toISODate(start);
    endDate.value = toISODate(end);
  }
};

const clearFilters = () => {
  startDate.value = "";
  endDate.value = "";
};
</script>

<style scoped>
.reports {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--cream-light);
  color: var(--espresso);
}

.menu-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(62, 44, 39, 0.08);
}

.menu-table th,
.menu-table td {
  padding: 0.75rem;
  text-align: center;
}

.menu-table tr {
  background: white;
  border: 1px solid var(--gold);
}

.menu-table th {
  background: var(--espresso);
  color: var(--cream);
  font-weight: 600;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
}

.item-pill {
  background: var(--highlight);
  color: var(--espresso);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--gold2);
  background: var(--cream);
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  color: var(--espresso);
}

.pagination button:hover:not(:disabled) {
  background: var(--gold);
  color: var(--espresso);
}

.pagination button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--cream-light);
  border-color: var(--cream-light);
}

.pagination span {
  font-weight: 500;
  color: var(--espresso);
}

.filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px;
  flex-wrap: wrap;
}

.filters-left label {
  margin-right: 0.5rem;
  font-size: 0.9rem;
  color: var(--espresso);
}

.filters-left input[type="date"] {
  margin-left: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--gold2);
  background: white;
  color: var(--espresso);
}

.filters-right button {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--gold2);
  background: white;
  cursor: pointer;
  font-size: 0.85rem;
  margin-left: 5px;
  color: var(--espresso);
}

.filters-right button:hover {
  background: var(--gold);
  color: white;
}

.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  color: var(--espresso);
}

.summary strong {
  font-weight: 600;
  color: var(--gold2);
}
</style>
