<template>
  <div class="admin-menu">
    <div class="menu-header">
      <h2>Aktif Siparişler</h2>
    </div>

    <!-- 🔹 Wrap table for horizontal scroll on small screens -->
    <div class="scroll-wrapper">
      <table class="data-table">
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
            <td>{{ o.tableId || "-" }}</td>

            <!-- pills-cell + inner items-list like the other table -->
            <td class="pills-cell">
              <div class="items-list">
                <span v-for="i in o.items" :key="i.itemId" class="item-pill">
                  {{ i.name }} x{{ i.qty }}
                </span>
              </div>
            </td>

            <td>{{ formatPrice(o.total) }}</td>
            <td>{{ formatDate(o.orderTime) }}</td>

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

    const res = await api.get(`/orders/active`, {
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

    await api.put(`/orders/complete`, { orderId: id, branchId });

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

.scroll-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* ✅ Complete button style */
.done-btn {
  background: var(--gold);
  color: white;
  letter-spacing: 1.3px;
  font-size: 16px;
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(201, 162, 39, 0.35);
  transition: 0.2s;
  white-space: nowrap;
}

.done-btn:hover {
  background: var(--gold2);
  box-shadow: 0 3px 8px rgba(164, 126, 59, 0.4);
}

/* 🌱 Mobile tweaks – COPY of the other table's style */
@media (max-width: 700px) {
  .admin-menu {
    padding: 0.5rem;
  }

  .menu-header h2 {
    font-size: 18px;
    margin-bottom: 10px;
  }

  /* Make the action button thumb-friendly */
  .done-btn {
    padding: 0.4rem 0.6rem;
    font-size: 0.8rem;
    min-width: 72px;
  }
}
</style>
