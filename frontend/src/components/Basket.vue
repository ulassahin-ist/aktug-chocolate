<template>
  <!-- 🛒 Floating Basket Button - Premium Design -->
  <div
    v-if="itemCount > 0"
    class="basket-float"
    :class="{ pulse: isPulsing }"
    @click="open = true"
    role="button"
    aria-label="Sepeti aç"
  >
    <Icons name="shopping-cart" :size="24" color="var(--cream)" />
    <span class="basket-float-count">{{ itemCount }}</span>
  </div>

  <!-- Basket Drawer -->
  <transition name="basket-slide">
    <div v-if="open" class="basket-drawer" @click.self="open = false">
      <div class="basket-panel">
        <header class="basket-header">
          <h2>Sepetiniz</h2>
          <button class="btn-icon" @click="open = false">
            <Icons name="close" :size="24" />
          </button>
        </header>

        <div class="basket-content">
          <div v-for="item in items" :key="item.id" class="basket-item">
            <img
              :src="
                item.photo ? API_BASE + item.photo : '/menu-placeholder.png'
              "
              class="basket-item-img"
              alt=""
            />

            <div class="basket-item-details">
              <h4>{{ item.name }}</h4>
              <p class="basket-item-price">{{ formatPrice(item.price) }}</p>

              <div class="qty-controls">
                <button class="qty-btn" @click="decreaseQty(item.id)">
                  <Icons name="minus" :size="16" color="currentColor" />
                </button>
                <span class="qty-display">{{ item.qty }}</span>
                <button class="qty-btn" @click="increaseQty(item.id)">
                  <Icons name="plus" :size="16" color="currentColor" />
                </button>
              </div>
            </div>

            <button class="basket-item-remove" @click="removeItem(item.id)">
              <Icons name="trash" :size="20" color="red" />
            </button>
          </div>
        </div>

        <footer class="basket-footer">
          <div class="basket-total">
            <span>Toplam:</span>
            <strong>{{ formatPrice(total) }}</strong>
          </div>

          <button
            class="btn-primary btn-checkout"
            @click="goCheckout"
            :disabled="!itemCount"
          >
            <Icons name="check-circle" :size="20" color="currentColor" />
            Siparişi Tamamla
          </button>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useGlobal } from "@/composables";
import Icons from "./Icons.vue";
import { API_BASE } from "@/config/api";

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

const open = ref(false);

/* 🔔 Pulse state for floating basket */
const isPulsing = ref(false);
let pulseTimeoutId = null;

watch(
  itemCount,
  (newVal, oldVal) => {
    // Pulse when count increases and is > 0
    if (newVal > 0 && newVal > (oldVal ?? 0)) {
      if (pulseTimeoutId) {
        clearTimeout(pulseTimeoutId);
      }
      isPulsing.value = true;
      pulseTimeoutId = setTimeout(() => {
        isPulsing.value = false;
        pulseTimeoutId = null;
      }, 350); // matches CSS animation duration
    }
  },
  { flush: "post" }
);

onBeforeUnmount(() => {
  if (pulseTimeoutId) clearTimeout(pulseTimeoutId);
});

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
/* ============================================
   🛒 FLOATING BASKET BUTTON
   ============================================ */
.basket-float {
  position: fixed;
  right: 20px;
  bottom: 24px;
  z-index: 9998;

  width: 56px;
  height: 56px;
  border-radius: 999px;

  background: linear-gradient(135deg, #3e2c27 0%, #2a1f1c 100%);
  box-shadow: 0 6px 18px rgba(62, 44, 39, 0.4);

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

/* Count badge now floats on top of the circle */
.basket-float-count {
  position: absolute;
  top: -4px;
  right: -4px;

  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  color: var(--espresso);

  min-width: 22px;
  height: 22px;
  border-radius: 999px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  font-weight: 700;
  font-size: 12px;

  box-shadow: 0 2px 6px rgba(201, 162, 39, 0.45);
  text-shadow: none;
}

/* Hover - subtle lift */
.basket-float:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(62, 44, 39, 0.55);
}

/* Active state */
.basket-float:active {
  transform: translateY(-1px);
}

/* Pulse animation when items added (keep your class hook) */
@keyframes basket-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.08);
  }
}

.basket-float.pulse {
  animation: basket-pulse 0.35s ease-out;
}

/* ============================================
   📋 DRAWER PANEL
   ============================================ */

.basket-drawer {
  position: fixed;
  inset: 0;
  background: rgba(62, 44, 39, 0.6);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.basket-panel {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 420px;
  max-width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #fdfaf6 0%, #ffffff 100%);
  border-radius: 24px 0 0 24px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -8px 0 32px rgba(62, 44, 39, 0.3);
  border-left: 1px solid rgba(164, 126, 59, 0.2);
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

/* ============================================
   📌 HEADER
   ============================================ */

.basket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid rgba(164, 126, 59, 0.15);
  position: relative;
}

.basket-header::after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 80px;
  height: 2px;
  background: linear-gradient(90deg, var(--gold), transparent);
}

.basket-header h2 {
  margin: 0;
  color: var(--espresso);
  font-size: 1.5rem;
  font-family: var(--font-heading);
}

/* ============================================
   📦 ITEMS LIST
   ============================================ */

.basket-content {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.basket-content::-webkit-scrollbar {
  width: 6px;
}

.basket-content::-webkit-scrollbar-thumb {
  background: var(--gold2);
  border-radius: 6px;
}

.basket-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: white;
  border-radius: 16px;
  border: 1px solid rgba(164, 126, 59, 0.1);
  box-shadow: 0 2px 8px rgba(62, 44, 39, 0.05);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.basket-item:hover {
  box-shadow: 0 4px 16px rgba(62, 44, 39, 0.08);
  transform: translateX(-2px);
}

.basket-item-img {
  width: 70px;
  height: 70px;
  min-width: 70px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(62, 44, 39, 0.15);
}

.basket-item-details {
  flex: 1;
  min-width: 0;
}

.basket-item-details h4 {
  margin: 0 0 0.25rem;
  color: var(--espresso);
  font-size: 15px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.basket-item-price {
  margin: 0 0 0.5rem;
  color: var(--gold2);
  font-weight: 600;
  font-size: 14px;
}

/* ============================================
   🗑️ REMOVE BUTTON
   ============================================ */

.basket-item-remove {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: none;
  background: transparent;
  color: #e74c3c;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.basket-item-remove:hover {
  background: rgba(231, 76, 60, 0.1);
  transform: scale(1.1);
}

.basket-item-remove:active {
  transform: scale(0.95);
}

/* ============================================
   💰 FOOTER
   ============================================ */

.basket-footer {
  padding-top: 1.5rem;
  border-top: 2px solid rgba(164, 126, 59, 0.15);
}

.basket-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  font-size: 1.25rem;
  color: var(--espresso);
}

.basket-total strong {
  color: var(--gold2);
  font-size: 1.5rem;
  font-weight: 700;
}

.btn-checkout {
  width: 100%;
  padding: 1rem;
  font-size: 16px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-checkout:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ============================================
   📱 MOBILE RESPONSIVE
   ============================================ */

@media (max-width: 900px) {
  .basket-float {
    right: 16px;
    bottom: calc(16px + env(safe-area-inset-bottom, 18px));
    width: 52px;
    height: 52px;
  }

  .basket-float-count {
    min-width: 20px;
    height: 20px;
    font-size: 11px;
  }

  .basket-panel {
    width: 100%;
    height: 70%;
    border-radius: 24px 24px 0 0;
    padding: 1.5rem;
    padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 20px));
  }
  .basket-panel::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 44px;
    height: 4px;
    border-radius: 999px;
    background: rgba(62, 44, 39, 0.18);
  }

  @keyframes slideInRight {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  .basket-header h2 {
    font-size: 1.3rem;
  }

  .basket-item {
    padding: 0.875rem;
    gap: 0.75rem;
  }

  .basket-item-img {
    width: 60px;
    height: 60px;
    min-width: 60px;
  }

  .basket-item-details h4 {
    font-size: 14px;
  }

  .basket-total {
    font-size: 1.1rem;
  }

  .basket-total strong {
    font-size: 1.3rem;
  }
}

/* ============================================
   🎬 TRANSITIONS
   ============================================ */

.basket-slide-enter-active,
.basket-slide-leave-active {
  transition: opacity 250ms cubic-bezier(0.4, 0, 0.2, 1);
}

.basket-slide-enter-from,
.basket-slide-leave-to {
  opacity: 0;
}
</style>
