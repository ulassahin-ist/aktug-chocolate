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

  const valid = await validateBasket();
  if (valid === "UPDATED") {
    window.$toast("Sepet güncellendi — stok değişti!", "warning");
    loading.value = false;
    return;
  }

  try {
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
  }

  loading.value = false;
};
</script>

<style scoped>
.checkout-container {
  margin: 0 auto;
  padding: 2rem 1.5rem;
  font-family: "Poppins", sans-serif;
  background: var(--cream);
  height: calc(100dvh - var(--scroll-offset));
  color: var(--espresso);
  max-width: 1500px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.title {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
  color: var(--espresso);
  flex-shrink: 0;
}

/* Empty state */
.empty-box {
  text-align: center;
  background: white;
  border-radius: 16px;
  padding: 3rem 2rem;
  box-shadow: 0 5px 15px rgba(62, 44, 39, 0.12);
  border: 1px solid var(--gold2);
  max-width: 400px;
  margin: 2rem auto;
}

.empty-box p {
  font-size: 1.1rem;
  color: var(--espresso);
  margin-bottom: 1.5rem;
}

.back-btn {
  display: inline-block;
  background: var(--gold);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(201, 162, 39, 0.4);
  transition: 0.2s;
}

.back-btn:hover {
  background: var(--gold2);
  box-shadow: 0 3px 8px rgba(164, 126, 59, 0.45);
}

/* Main Checkout Grid */
.checkout-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
  box-shadow: 0 4px 12px rgba(62, 44, 39, 0.1);
  border: 1px solid var(--gold2);
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
  border-bottom: 2px solid var(--highlight);
  flex-shrink: 0;
}

.scroll-wrapper {
  flex: 1;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-bottom: 0;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--highlight);
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
}

.qty {
  font-size: 0.85rem;
  color: rgba(62, 44, 39, 0.7);
}

.price {
  font-weight: bold;
  color: var(--espresso);
  white-space: nowrap;
}

/* Total line */
.total-line {
  flex-shrink: 0;
  background: white;
  border-top: 2px solid var(--highlight);
  padding: 1rem 0;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  color: var(--espresso);
}

/* Form Box */
.form-box {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(62, 44, 39, 0.1);
  border: 1px solid var(--gold2);
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

label {
  font-weight: 600;
  color: var(--espresso);
  font-size: 0.95rem;
}

input,
textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--gold2);
  padding: 0.75rem;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  background: var(--cream);
  color: var(--espresso);
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:disabled {
  background: var(--highlight);
  cursor: not-allowed;
  opacity: 0.7;
}

input:focus,
textarea:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.15);
}

textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

/* Mobile responsive */
@media (max-width: 900px) {
  .checkout-container {
    padding: 1rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 20px));
    height: calc(100dvh - var(--scroll-offset));
  }

  .title {
    font-size: 1.75rem;
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

  .form-box {
    position: sticky;
    bottom: 0;
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
    margin-top: 0;
    font-size: 1.1rem;
    padding: 0.75rem 0;
    padding-bottom: 0;
  }

  .form-box {
    padding: 1.25rem;
  }

  textarea {
    min-height: 60px;
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
    margin-bottom: 0rem;
  }
  .summary-box {
    padding: 0.5rem;
  }
  .form-box {
    padding: 0.5rem;
    gap: 0.5rem;
  }
}
</style>
