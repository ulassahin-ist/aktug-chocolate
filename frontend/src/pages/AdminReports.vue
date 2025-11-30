<template>
  <div class="reports">
    <!-- 🔹 Header: Filters + Pagination -->
    <div class="reports-header">
      <!-- Filters -->
      <div class="filters">
        <div class="filters-dates">
          <label class="date-label">
            <span class="label-text">Başlangıç</span>
            <input type="date" v-model="startDate" />
          </label>
          <label class="date-label">
            <span class="label-text">Bitiş</span>
            <input type="date" v-model="endDate" />
          </label>
        </div>

        <div class="filters-quick">
          <button class="chip-btn" @click="setQuickRange('today')">
            Bugün
          </button>
          <button class="chip-btn" @click="setQuickRange('yesterday')">
            Dün
          </button>
          <button class="chip-btn" @click="setQuickRange('last7')">
            Son 7 Gün
          </button>
          <button class="chip-btn" @click="clearFilters">Tümü</button>
        </div>
        <!-- Pagination (only for filtered data, from backend) -->
        <div v-if="totalCount > 0" class="pagination">
          <button :disabled="page === 1 || loading" @click="goPrev">←</button>
          <span class="pagination-info">
            Sayfa {{ page }} / {{ totalPages }}
          </span>
          <button :disabled="page === totalPages || loading" @click="goNext">
            →
          </button>
        </div>
      </div>
    </div>

    <!-- 🔹 Summary -->
    <div class="summary" v-if="totalCount > 0">
      <span>
        Gösterilen:
        <strong>{{ orders.length }}</strong>
        / {{ totalCount }} sipariş
      </span>
      <span>
        Toplam Tutar:
        <strong>{{ formatPrice(totalAmount) }}</strong>
      </span>
    </div>

    <!-- 🔹 Table -->
    <div class="scroll-wrapper">
      <table class="data-table">
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
          <tr v-for="(order, idx) in orders" :key="order.id">
            <td>{{ idx + 1 + (page - 1) * perPage }}</td>
            <td>{{ order.tableId || "-" }}</td>
            <td>{{ formatPrice(order.total) }}</td>
            <td>{{ formatDate(order.orderTime) }}</td>
            <td class="pills-cell">
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

          <tr v-if="!loading && totalCount === 0">
            <td colspan="5" style="padding: 2rem; color: #999">
              Seçilen tarihlerde tamamlanmış sipariş yok
            </td>
          </tr>

          <tr v-if="loading">
            <td colspan="5" style="padding: 2rem; color: #999">
              Yükleniyor...
            </td>
          </tr>
        </tbody>
      </table>
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
const perPage = 50;
const totalCount = ref(0);
const totalAmount = ref(0);
const loading = ref(false);

// Date filters (YYYY-MM-DD)
const startDate = ref("");
const endDate = ref("");

// total pages comes from totalCount (backend)
const totalPages = computed(() => {
  if (!totalCount.value) return 1;
  return Math.ceil(totalCount.value / perPage);
});

// 🚀 Fetch only the visible page from backend
const fetchOrders = async () => {
  try {
    loading.value = true;

    const params = {
      page: page.value,
      perPage,
    };

    if (startDate.value) params.startDate = startDate.value;
    if (endDate.value) params.endDate = endDate.value;

    const res = await api.get("/orders/completed", { params });

    // expected backend response shape:
    // {
    //   orders: [...],
    //   totalCount: 123,
    //   totalAmount: 9999.99
    // }
    orders.value = res.data.orders || [];
    totalCount.value = res.data.totalCount || 0;
    totalAmount.value = Number(res.data.totalAmount || 0);

    // Cap page if filter shrinks results
    if (page.value > totalPages.value) {
      page.value = totalPages.value || 1;
    }
  } catch (err) {
    console.error("Reports error:", err?.response?.data || err);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchOrders);

// When dates change → reset to page 1 and refetch
watch([startDate, endDate], () => {
  page.value = 1;
  fetchOrders();
});

// Pagination helpers
const goPrev = () => {
  if (page.value > 1) {
    page.value--;
    fetchOrders();
  }
};

const goNext = () => {
  if (page.value < totalPages.value) {
    page.value++;
    fetchOrders();
  }
};

// Quick ranges
const setQuickRange = (type) => {
  const today = new Date();
  const toISO = (d) => d.toISOString().slice(0, 10);

  if (type === "today") {
    const d = new Date();
    startDate.value = toISO(d);
    endDate.value = toISO(d);
  } else if (type === "yesterday") {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    startDate.value = toISO(d);
    endDate.value = toISO(d);
  } else if (type === "last7") {
    const end = new Date(today);
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    startDate.value = toISO(start);
    endDate.value = toISO(end);
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

/* HEADER: filters + pagination inline */
.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

/* Filters container */
.filters {
  padding: 0 20px 0 10px;
  display: flex;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
  justify-content: space-between;
}

/* Date inputs row */
.filters-dates {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.date-label {
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
  color: var(--espresso);
}

.date-label input[type="date"] {
  margin-top: 0.15rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--gold2);
  background: white;
  color: var(--espresso);
  font-size: 0.85rem;
}

/* Quick filter chips */
.filters-quick {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: end;
}

.chip-btn {
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  border: 1px solid var(--gold2);
  background: white;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--espresso);
  white-space: nowrap;
  transition: 0.15s;
  height: 26px;
}

.chip-btn:hover {
  background: var(--gold);
  color: white;
}

/* Summary row */
.summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: var(--espresso);
  flex-shrink: 0;
}

.summary strong {
  font-weight: 600;
  color: var(--gold2);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.pagination-bottom {
  margin-top: 0.75rem;
}

.pagination button {
  padding: 0;
  width: 40px;
  height: 40px;
  font-size: 16px;
  font-weight: 700;
  border: 1px solid var(--gold2);
  background: white;
  border-radius: 50%;
  cursor: pointer;
  transition: 0.2s;
  line-height: 0;
  color: var(--espresso);
}

.pagination button:hover:not(:disabled) {
  background: var(--gold);
  color: white;
}

.pagination button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--cream-light);
  border-color: var(--cream-light);
}

.pagination-info {
  font-weight: 500;
  color: var(--espresso);
}

/* Table wrapper */
.scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  flex: 1;
}

/* Make product pills column look nice */
.pills-cell .items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

/* MOBILE */
@media (max-width: 700px) {
  .reports {
    padding: 0.5rem;
  }

  .reports-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .filters {
    gap: 0.4rem;
    flex-direction: column;
    padding: 0;
  }

  .filters-dates {
    gap: 0.4rem;
  }

  .date-label {
    flex: 1 1 0;
  }

  .filters-quick {
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .filters-quick::-webkit-scrollbar {
    height: 4px;
  }

  .filters-quick::-webkit-scrollbar-thumb {
    background: rgba(164, 126, 59, 0.4);
    border-radius: 999px;
  }

  .chip-btn {
    flex: 0 0 auto;
    font-size: 0.75rem;
    padding: 0.25rem 0.6rem;
  }

  .summary {
    font-size: 0.8rem;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  /* Make pagination more compact and hide text */
  .pagination,
  .pagination-bottom {
    gap: 0.5rem;
  }

  .pagination-info {
    display: none; /* saves vertical + visual space on small screens */
  }

  .pagination button {
    width: 34px;
    height: 34px;
    font-size: 14px;
  }
}
</style>
