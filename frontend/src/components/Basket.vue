<template>
  <!-- Floating Basket Button -->
  <div v-if="itemCount > 0" class="basket-float" @click="open = true">
    🛒 {{ itemCount }}
  </div>

  <!-- Basket Drawer -->
  <transition name="basket-slide">
    <div v-if="open" class="basket-drawer" @click.self="open = false">
      <div class="basket-panel">
        <header>
          <h2>Sepetiniz</h2>
          <button class="close-btn" @click="open = false">✕</button>
        </header>

        <div class="basket-content">
          <div v-for="item in items" :key="item.id" class="basket-item">
            <img :src="API_BASE + item.photo" />
            <div class="details">
              <h4>{{ item.name }}</h4>
              <p>{{ formatPrice(item.price) }}</p>

              <div class="qty-controls">
                <button @click="decreaseQty(item.id)">−</button>
                <span>{{ item.qty }}</span>
                <button @click="increaseQty(item.id)">+</button>
              </div>
            </div>
            <div class="remove" @click="removeItem(item.id)">🗑</div>
          </div>
        </div>

        <footer>
          <div class="total-line">
            <span>Toplam:</span>
            <strong>{{ formatPrice(total) }}</strong>
          </div>

          <button
            class="checkout-btn"
            @click="goCheckout"
            :disabled="!itemCount"
          >
            Siparişi Tamamla
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup>
// frontend/src/components/Basket.vue
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGlobal } from "@/composables";

const {
  items,
  total,
  itemCount,
  increaseQty,
  decreaseQty,
  removeItem,
  validateBasket,
  formatPrice,
} = useGlobal();

const router = useRouter();
import { API_BASE } from "@/config/api";

const open = ref(false);

const goCheckout = async () => {
  const status = await validateBasket();

  if (status === "UPDATED") {
    window.$toast("Sepet güncellendi, lütfen tekrar kontrol edin!", "warning");
    return;
  }

  open.value = false;
  router.push("/checkout");
};
</script>

<style scoped>
/* Floating Button */
.basket-float {
  position: fixed;
  right: 20px;
  bottom: 20px;
  background: var(--espresso);
  color: var(--cream);
  padding: 12px 20px;
  border-radius: 50px;
  font-weight: bold;
  cursor: pointer;
  z-index: 9998;
  box-shadow: 0 5px 15px rgba(201, 162, 39, 0.45);
}

/* Drawer Overlay */
.basket-drawer {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(2px);
  z-index: 9999;
}

/* Drawer Panel */
.basket-panel {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 380px;
  max-width: 100%;
  height: 100%;
  background: var(--cream);
  backdrop-filter: blur(10px);
  border-radius: 16px 0 0 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s ease forwards;
  box-shadow: -4px 0 18px rgba(62, 44, 39, 0.28);
  border-left: 2px solid var(--gold2);
}

@media (max-width: 900px) {
  .basket-panel {
    width: 100%;
    height: 65%;
    border-radius: 20px 20px 0 0;
    bottom: 0;
    right: 0;
    left: 0;
    border-left: none;
    border-top: 2px solid var(--gold2);
  }
}

/* Header */
header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--espresso);
}

header h2 {
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--espresso);
}

/* Items */
.basket-content {
  flex: 1;
  overflow-y: auto;
  margin: 15px 0;
}

.basket-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--highlight);
}

.basket-item img {
  width: 65px;
  height: 65px;
  border-radius: 12px;
  object-fit: cover;
  margin-right: 12px;
  box-shadow: 0 2px 8px rgba(62, 44, 39, 0.25);
}

.details {
  flex: 1;
  color: var(--espresso);
}

.details h4 {
  margin: 0 0 4px;
}

.details p {
  margin: 0 0 6px;
}

/* Quantity controls */
.qty-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-controls button {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: none;
  background: var(--gold);
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: 0.15s;
}

.qty-controls button:hover {
  background: var(--gold2);
}

/* Remove icon */
.remove {
  cursor: pointer;
  color: #c33;
  font-size: 18px;
}

/* Footer */
.total-line {
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  margin-bottom: 10px;
  color: var(--espresso);
}

.checkout-btn {
  width: 100%;
  padding: 14px;
  background: var(--gold);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 17px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(201, 162, 39, 0.4);
}

.checkout-btn:hover:enabled {
  background: var(--gold2);
  box-shadow: 0 4px 12px rgba(164, 126, 59, 0.45);
}

.checkout-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: var(--highlight);
  box-shadow: none;
}

/* Animation */
.basket-slide-enter-active,
.basket-slide-leave-active {
  transition: opacity 0.25s;
}
.basket-slide-enter-from,
.basket-slide-leave-to {
  opacity: 0;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}
@media (max-width: 900px) {
  @keyframes slideInRight {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
}
</style>
