<template>
  <div class="checkout-container">
    <h1 class="title">Siparişi Tamamla</h1>

    <!-- ✅ Empty Cart -->
    <div v-if="items.length === 0" class="empty-box">
      <p>Sepetiniz boş.</p>
      <router-link to="/menu" class="back-btn">Menüye Dön</router-link>
    </div>

    <!-- ✅ Checkout Form -->
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
        <!-- Table Display Only -->
        <label>Masa</label>
        <input type="text" :value="tableIdText" disabled />

        <label>Not (isteğe bağlı)</label>
        <textarea
          v-model="notes"
          placeholder="Örn: Fındık olmasın, çatal gönder..."
        ></textarea>

        <button class="checkout-btn" @click="submitOrder" :disabled="loading">
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
  tableIdText,
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
  height: calc(100vh - var(--scroll-offset));
  color: var(--espresso);
  max-width: 1500px;
  overflow-y: auto;
  position: relative;
}

.title {
  text-align: center;
  font-size: 2.2rem;
  margin-bottom: 1.5rem;
}

/* ✅ Empty state */
.empty-box {
  text-align: center;
  background: var(--cream);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(62, 44, 39, 0.12);
  border: 1px solid var(--gold2);
  max-width: 400px;
  margin: auto;
}

.back-btn {
  display: inline-block;
  margin-top: 1rem;
  background: var(--gold);
  color: var(--espresso);
  padding: 0.6rem 1.2rem;
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

/* ✅ Main Checkout Grid */
.checkout-wrapper {
  display: flex;
  gap: 36px;
  align-items: flex-start;
  width: 100%;
  max-height: 100%;
  overflow: hidden;
}

/* ✅ Summary Box */
.summary-box {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(62, 44, 39, 0.1);
  border: 1px solid var(--gold2);
  position: relative;
  box-sizing: border-box;
  padding-bottom: 70px;
  width: 40%;
  display: flex;
  flex-direction: column;
}

.summary-box h2 {
  margin-bottom: 1rem;
  color: var(--espresso);
  text-align: center;
  border-bottom: 1px solid var(--highlight);
}

.scroll-wrapper {
  max-height: 400px;
  overflow-y: auto;
  padding-bottom: 30px;
}

.item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}

.thumb {
  width: 55px;
  height: 55px;
  border-radius: 10px;
  object-fit: cover;
  margin-right: 10px;
  box-shadow: 0 2px 6px rgba(62, 44, 39, 0.2);
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.name {
  font-weight: 600;
  color: var(--espresso);
}

.qty {
  font-size: 0.9rem;
  color: rgba(62, 44, 39, 0.7);
}

.price {
  font-weight: bold;
  color: var(--espresso);
}

/* ✅ Total line */
.total-line {
  position: absolute;
  bottom: 10px;
  border-top: 1px solid var(--highlight);
  background: white;
  width: calc(100% - 48px);
  margin-top: 1rem;
  padding-top: 0.8rem;
  display: flex;
  justify-content: space-between;
  font-size: 1.15rem;
  color: var(--espresso);
}

/* ✅ Form Box */
.form-box {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(62, 44, 39, 0.1);
  border: 1px solid var(--gold2);
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  width: 60%;
}

input,
textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--gold2);
  padding: 0.7rem;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  background: var(--cream);
  color: var(--espresso);
}

input:focus,
textarea:focus {
  border-color: var(--gold);
  box-shadow: 0 0 4px rgba(201, 162, 39, 0.4);
}

textarea {
  min-height: 80px;
  resize: none;
}

/* Checkout button */
.checkout-btn {
  background: var(--gold);
  color: white;
  border: none;
  padding: 0.9rem;
  border-radius: 10px;
  font-size: 1.1rem;
  cursor: pointer;
  margin-top: 5px;
  transition: background 0.2s, box-shadow 0.2s;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(201, 162, 39, 0.45);
}

.checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--highlight);
  box-shadow: none;
}

.checkout-btn:hover:not(:disabled) {
  background: var(--gold2);
  box-shadow: 0 4px 12px rgba(164, 126, 59, 0.5);
}

/* ✅ Mobile responsive */
@media (max-width: 700px) {
  .title {
    text-align: center;
    font-size: 1.6rem;
    margin-bottom: 0.5rem;
  }
  .checkout-container {
    padding: 1rem;
  }

  .checkout-wrapper {
    flex-direction: column;
  }

  .summary-box {
    width: 100%;
    max-height: calc(100% - 513px);
  }
  .form-box {
    width: 100%;
  }

  .scroll-wrapper {
    max-height: calc(50vh - 120px);
  }

  .summary-box,
  .form-box {
    padding: 1.2rem;
  }
  .total-line {
    width: calc(100% - 37px);
  }
}
</style>
