<template>
  <div class="admin-orders">
    <header class="orders-header">
      <div class="orders-title-wrap">
        <h2>Aktif Siparişler</h2>
        <span class="orders-count-badge" v-if="orders.length">
          {{ orders.length }} aktif
        </span>
      </div>

      <button
        class="btn-secondary btn-refresh"
        @click="manualRefresh"
        :disabled="loading"
      >
        Yenile
      </button>
    </header>

    <!-- Table wrapper for horizontal scroll on narrow screens -->
    <div class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Masa</th>
            <th>Ürünler</th>
            <th>Not</th>
            <th>Toplam</th>
            <th>Saat</th>
            <th>İşlem</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="o in orders" :key="o.id">
            <td>{{ o.id }}</td>
            <td>{{ o.tableId || "-" }}</td>

            <!-- Ürünler – pills like other components -->
            <td class="pills-cell">
              <div class="items-list">
                <span v-for="i in o.items" :key="i.itemId" class="item-pill">
                  {{ i.name }} x{{ i.qty }}
                </span>
              </div>
            </td>

            <!-- Not -->
            <td class="note-cell">
              <span v-if="o.notes" class="note-text">{{ o.notes }}</span>
              <span v-else class="note-empty">-</span>
            </td>

            <td>{{ formatPrice(o.total) }}</td>
            <td>{{ formatDate(o.orderTime) }}</td>

            <td>
              <button
                class="done-btn"
                @click="complete(o.id)"
                :disabled="completingId === o.id"
              >
                {{ completingId === o.id ? "Tamamlanıyor..." : "Tamamla" }}
              </button>
            </td>
          </tr>

          <tr v-if="!loading && orders.length === 0">
            <td colspan="7" class="empty-row">Henüz aktif sipariş yok.</td>
          </tr>

          <tr v-if="loading && !orders.length">
            <td colspan="7" class="empty-row">Siparişler yükleniyor...</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import api from "@/config/api";
import { useGlobal } from "@/composables";

const { getBranchId, formatPrice, formatDate } = useGlobal();

const orders = ref([]);
const loading = ref(false);
const completingId = ref(null);
let pollTimer = null;

/**
 * 🔄 Fetch active orders for current branch
 * @param {boolean} silent - if true, don't show error toasts (used for polling)
 */
const fetchOrders = async (silent = false) => {
  try {
    if (!silent) loading.value = true;

    const branchId = getBranchId();
    const res = await api.get("/orders/active", {
      params: { branchId },
    });

    orders.value = res.data || [];
  } catch (err) {
    console.error("❌ Failed to load orders:", err?.response?.data || err);
    if (!silent) {
      window.$toast?.("Siparişler yüklenemedi", "error");
    }
  } finally {
    if (!silent) loading.value = false;
  }
};

// 🔘 Manual refresh button
const manualRefresh = () => {
  fetchOrders(false);
};

// ✅ Complete an order, then refetch
const complete = async (id) => {
  try {
    completingId.value = id;
    const branchId = getBranchId();

    await api.put("/orders/complete", { orderId: id, branchId });

    window.$toast?.("Sipariş tamamlandı!", "success");
    await fetchOrders(true); // silent refetch (no extra loading message)
  } catch (err) {
    console.error("❌ Failed to complete order:", err?.response?.data || err);
    window.$toast?.("Sipariş tamamlanamadı", "error");
  } finally {
    completingId.value = null;
  }
};

onMounted(() => {
  // Initial load
  fetchOrders(false);

  // 🕒 Poll every 7 seconds while tab is visible
  pollTimer = setInterval(() => {
    if (document.visibilityState === "visible") {
      fetchOrders(true); // silent
    }
  }, 30000);
});

onBeforeUnmount(() => {
  if (pollTimer) clearInterval(pollTimer);
});
</script>

<style scoped>
.admin-orders {
  background: transparent;
  color: var(--espresso);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Header */
.orders-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.orders-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.orders-header h2 {
  font-size: 1.4rem;
  margin: 0;
  font-family: var(--font-heading);
}

.orders-count-badge {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  color: var(--espresso);
  box-shadow: var(--shadow-sm);
}
/* Table wrapper */
.table-scroll {
  width: 100%;
  overflow-x: auto;
}

/* Note cell */
.note-cell {
  max-width: 260px;
}

.note-text {
  font-size: 0.9rem;
  color: rgba(62, 44, 39, 0.85);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.note-empty {
  font-size: 0.85rem;
  color: rgba(62, 44, 39, 0.5);
  font-style: italic;
}

/* Complete button */
.done-btn {
  background: var(--gold);
  color: white;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
  padding: 0.4rem 0.9rem;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(201, 162, 39, 0.35);
  transition: all var(--transition-base);
  white-space: nowrap;
}

.done-btn:hover:not(:disabled) {
  background: var(--gold2);
  box-shadow: 0 3px 8px rgba(164, 126, 59, 0.4);
  transform: translateY(-1px);
}

.done-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

/* Empty / loading rows */
.empty-row {
  color: rgba(62, 44, 39, 0.65);
  padding: 1.2rem;
  text-align: center;
  font-size: 0.95rem;
}

/* Mobile tweaks */
@media (max-width: 700px) {
  .orders-header h2 {
    font-size: 1.1rem;
  }

  .orders-count-badge {
    font-size: 0.75rem;
    padding: 3px 8px;
  }

  .btn-refresh {
    padding: 0.35rem 0.7rem;
    font-size: 0.8rem;
  }

  .done-btn {
    padding: 0.35rem 0.6rem;
    font-size: 0.78rem;
    min-width: 72px;
  }

  .note-cell {
    max-width: 180px;
  }
}
</style>
