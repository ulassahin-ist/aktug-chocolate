<template>
  <div class="checkout-container">
    <h1 class="title">Siparişi Tamamla</h1>

    <!-- Empty Cart -->
    <div v-if="items.length === 0" class="empty-box">
      <p>Sepetiniz boş.</p>
      <router-link to="/menu" class="back-btn">Menüye Dön</router-link>
    </div>

    <!-- Checkout Form -->
    <div v-else class="checkout-wrapper">
      <!-- SUMMARY -->
      <div class="summary-box">
        <h2>Sepet</h2>
        <div class="scroll-wrapper">
          <div class="item-row" v-for="i in items" :key="i.id">
            <img
              :src="i.photo ? API_BASE + i.photo : '/menu-placeholder.png'"
              class="thumb"
            />

            <div class="info">
              <span class="name">{{ i.name }}</span>
              <span class="qty">{{ i.qty }} adet</span>
            </div>
            <span class="price">{{ format(i.price * i.qty) }}</span>
          </div>
        </div>
        <div class="total-line">
          <strong>Toplam:</strong>
          <strong>{{ format(total) }}</strong>
        </div>
      </div>

      <!-- FORM -->
      <div class="form-box">
        <div class="notes-field">
          <label>Not (isteğe bağlı)</label>
          <textarea
            v-model="notes"
            placeholder="Örn: Fındık olmasın, çatal gönder..."
          ></textarea>
        </div>

        <button class="btn-primary" @click="submitOrder" :disabled="loading">
          {{ loading ? "Gönderiliyor..." : "Siparişi Gönder" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api, { API_BASE } from "@/config/api";
import { useRouter } from "vue-router";

const router = useRouter();

import { useGlobal } from "@/composables";
const {
  isAdmin,
  tableId,
  getBranchId,
  items,
  total,
  validateBasket,
  clearBasket,
  formatPrice,
} = useGlobal();

const format = (v) => formatPrice(v);

const notes = ref("");
const loading = ref(false);

const submitOrder = async () => {
  // Admin cannot order
  if (isAdmin.value) {
    window.$toast("Yönetici sipariş veremez", "error");
    return;
  }

  // Prevent double clicks
  if (loading.value) return;

  // Empty basket
  if (!items.value.length) {
    window.$toast("Sepet boş!", "error");
    return;
  }

  // Must have tableId (QR required)
  if (!tableId.value || tableId.value <= 0) {
    window.$toast("Masa bilgisi eksik. Lütfen QR kodu okutun.", "error");
    return;
  }

  loading.value = true;

  try {
    const valid = await validateBasket();
    if (valid === "UPDATED") {
      window.$toast("Sepet güncellendi — stok değişti!", "warning");
      return;
    }

    const branch = getBranchId();

    await api.post(`/orders/create`, {
      items: items.value,
      total: total.value,
      tableId: tableId.value,
      notes: notes.value,
      branchId: branch,
    });

    clearBasket();
    window.$toast("Sipariş alındı! 🎉", "success");
    router.push("/menu");
  } catch (err) {
    const errMsg = err.response?.data?.error || "Sipariş oluşturulamadı.";
    window.$toast(errMsg, "error");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.checkout-container {
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: var(--font-body);
  background: var(--cream);
  height: calc(100dvh - var(--scroll-offset));
  color: var(--espresso);
  max-width: 1200px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Page title */
.title {
  text-align: center;
  font-family: var(--font-heading);
  font-size: 2.2rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  color: var(--espresso);
  flex-shrink: 0;
  position: relative;
  display: inline-block;
  align-self: center;
  padding-inline: 0.4em;
}

.title::after {
  content: "";
  position: absolute;
  left: 18%;
  right: 18%;
  bottom: -0.45rem;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

/* Empty state */
.empty-box {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(164, 126, 59, 0.35);
  max-width: 420px;
  margin: 2rem auto;
}

.empty-box p {
  font-size: 1.05rem;
  color: var(--espresso);
  margin-bottom: 1.5rem;
}

.back-btn {
  display: inline-block;
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  color: var(--espresso);
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 2px 6px rgba(201, 162, 39, 0.4);
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
}

.back-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(164, 126, 59, 0.5);
}

/* Main Checkout Grid */
.checkout-wrapper {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 2rem;
  align-items: stretch;
  width: 100%;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

/* Summary Box */
.summary-box {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(164, 126, 59, 0.25);
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.summary-box h2 {
  margin: 0;
  margin-bottom: 1rem;
  color: var(--espresso);
  text-align: center;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(164, 126, 59, 0.18);
  flex-shrink: 0;
  font-family: var(--font-heading);
  font-size: 1.35rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.scroll-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-bottom: 0;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.scroll-wrapper::-webkit-scrollbar {
  width: 6px;
}
.scroll-wrapper::-webkit-scrollbar-thumb {
  background: var(--gold2);
  border-radius: 6px;
}

/* Cart item rows */
.item-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(247, 213, 163, 0.7);
}

.item-row:last-child {
  border-bottom: none;
}

.thumb {
  width: 60px;
  height: 60px;
  min-width: 60px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 2px 6px rgba(62, 44, 39, 0.2);
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.name {
  font-weight: 600;
  color: var(--espresso);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.95rem;
}

.qty {
  font-size: 0.85rem;
  color: rgba(62, 44, 39, 0.7);
}

.price {
  font-weight: 700;
  color: var(--espresso);
  white-space: nowrap;
  font-size: 0.95rem;
}

/* Total line */
.total-line {
  flex-shrink: 0;
  background: linear-gradient(135deg, #fef9f0 0%, #fdfaf6 100%);
  border-radius: 12px;
  border: 1px solid rgba(164, 126, 59, 0.25);
  padding: 0.9rem 1rem;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  font-size: 1.1rem;
  color: var(--espresso);
}

/* Form Box */
.form-box {
  background: white;
  border-radius: 16px;
  padding: 1.75rem 1.5rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid rgba(164, 126, 59, 0.25);
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  height: fit-content;
  max-height: 100%;
}

.notes-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notes-field label {
  font-weight: 600;
  color: var(--espresso);
  font-size: 0.95rem;
  letter-spacing: 0.03em;
}

textarea {
  width: 100%;
  border-radius: 10px;
  border: 1px solid rgba(164, 126, 59, 0.6);
  padding: 0.75rem 0.9rem;
  font-size: 0.95rem;
  font-family: inherit;
  outline: none;
  background: var(--cream);
  color: var(--espresso);
  transition: border-color 0.2s, box-shadow 0.2s, background-color 0.2s;
  min-height: 100px;
  resize: vertical;
}

textarea::placeholder {
  color: rgba(62, 44, 39, 0.45);
}

textarea:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.15);
  background: #fefdfb;
}

.btn-primary {
  width: 100%;
  justify-content: center;
  margin-top: 0.75rem;
}

.btn-primary[disabled] {
  opacity: 0.7;
}

/* Mobile responsive */
@media (max-width: 900px) {
  .checkout-container {
    padding: 1rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 20px));
    height: calc(100dvh - var(--scroll-offset));
  }

  .title {
    font-size: 1.7rem;
    margin-bottom: 1rem;
  }

  .checkout-wrapper {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .summary-box {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: auto;
    min-height: 200px;
    max-height: none;
  }

  .scroll-wrapper {
    max-height: 40vh;
  }

  .thumb {
    width: 50px;
    height: 50px;
    min-width: 50px;
  }

  .name {
    font-size: 0.9rem;
  }

  .qty,
  .price {
    font-size: 0.85rem;
  }

  .total-line {
    margin-top: 0.5rem;
    font-size: 1.05rem;
    padding: 0.75rem 0.9rem;
  }

  .form-box {
    padding: 1.25rem;
    position: sticky;
    bottom: 0;
    box-shadow: 0 -4px 18px rgba(62, 44, 39, 0.18);
  }

  textarea {
    min-height: 70px;
  }

  .empty-box {
    padding: 2rem 1.5rem;
    margin: 1rem auto;
  }
}

@media (max-width: 400px) {
  .checkout-container {
    padding: 0.75rem;
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 20px));
  }

  .title {
    display: none;
  }

  .checkout-wrapper {
    gap: 1rem;
  }

  .thumb {
    width: 45px;
    height: 45px;
    min-width: 45px;
  }

  .summary-box h2 {
    margin-bottom: 0.25rem;
  }

  .summary-box {
    padding: 0.85rem;
  }

  .form-box {
    padding: 0.85rem;
    gap: 0.75rem;
  }
}
</style>
