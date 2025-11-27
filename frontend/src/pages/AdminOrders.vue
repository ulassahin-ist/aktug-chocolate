<template>
  <div class="admin-menu">
    <div class="menu-header">
      <h2>Aktif Siparişler</h2>
    </div>

    <table class="menu-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Masa</th>
          <th>Ürünler</th>
          <th>Toplam</th>
          <th>Saat</th>
          <th>İşlem</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="o in orders" :key="o.id">
          <td>{{ o.id }}</td>
          <td>{{ o.tableNumber || "-" }}</td>

          <td class="items-cell">
            <span v-for="i in o.items" :key="i.itemId" class="item-pill">
              {{ i.name }} x{{ i.qty }}
            </span>
          </td>

          <td>{{ formatPrice(o.total) }}</td>
          <td>{{ formatTime(o.orderTime) }}</td>

          <td>
            <button class="done-btn" @click="complete(o.id)">Tamamla</button>
          </td>
        </tr>

        <tr v-if="orders.length === 0">
          <td colspan="6" style="color: #555; padding: 1.2rem">
            Henüz aktif sipariş yok.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/config/api";
import { useGlobal } from "@/composables";

const { getBranchId, formatPrice, formatDate } = useGlobal();

const orders = ref([]);

// 🔹 Fetch active orders for current branch
const fetchOrders = async () => {
  try {
    const branchId = getBranchId();

    const res = await api.get(`/api/orders/active`, {
      params: { branchId },
    });

    orders.value = res.data;
  } catch (err) {
    console.error("❌ Failed to load orders:", err?.response?.data || err);
    window.$toast?.("Siparişler yüklenemedi", "error");
  }
};

// 🔹 Complete an order
const complete = async (id) => {
  try {
    const branchId = getBranchId();

    await api.put(`/api/orders/complete`, { orderId: id, branchId });

    window.$toast("Sipariş tamamlandı!", "success");
    fetchOrders();
  } catch (err) {
    console.error("❌ Failed to complete order:", err?.response?.data || err);
    window.$toast?.("Sipariş tamamlanamadı", "error");
  }
};

onMounted(fetchOrders);
</script>

<style scoped>
.admin-menu {
  background: white;
  color: var(--espresso);
}
.menu-header h2 {
  font-size: 24px;
  color: var(--espresso);
  margin-bottom: 16px;
}
/* ✅ Order Table = Menu Table */
.menu-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--cream);
  border-radius: 10px;
  border: 1px solid var(--gold2);
  box-shadow: 0 4px 12px rgba(62, 44, 39, 0.08);
}

.menu-table th,
.menu-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--highlight);
  text-align: center;
  font-size: 0.95rem;
  color: var(--espresso);
}

.menu-table th {
  background: var(--espresso);
  color: var(--cream);
  font-weight: 600;
}

/* Ürünler hücresi */
.items-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  justify-content: center;
}

/* ✅ Small product pills */
.item-pill {
  background: var(--gold);
  color: var(--espresso);
  padding: 3px 8px;
  font-size: 0.8rem;
  border-radius: 6px;
}

/* ✅ Complete button style */
.done-btn {
  background: var(--gold);
  color: var(--espresso);
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(201, 162, 39, 0.35);
}

.done-btn:hover {
  background: var(--gold2);
  box-shadow: 0 3px 8px rgba(164, 126, 59, 0.4);
}
</style>
