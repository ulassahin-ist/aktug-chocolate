<!-- frontend/src/components/QRGuard.vue -->
<template>
  <div v-if="showWarning" class="qr-warning-overlay">
    <div class="warning-card">
      <div class="warning-icon">⚠️</div>
      <h2>QR Kod Taraması Gerekli</h2>
      <p>Bu sayfaya erişmek için lütfen masanızdaki QR kodu okutunuz.</p>
      <p class="sub-text">QR kod, şube ve masa bilgilerinizi içerir.</p>

      <div class="info-box">
        <p><strong>QR kod nasıl taranır?</strong></p>
        <ol>
          <li>Masanızdaki QR kodu bulun</li>
          <li>Telefonunuzun kamerasıyla okutun</li>
          <li>Açılan bağlantıya tıklayın</li>
        </ol>
      </div>

      <!-- Login prompt for guests/logged-out users -->
      <div v-if="!isLoggedIn" class="login-prompt">
        <p class="prompt-text">
          Personel veya yönetici olarak giriş yapmak ister misiniz?
        </p>
        <button @click="goToLogin" class="login-btn">Giriş Yap</button>
      </div>

      <!-- Debug info for admins/staff (already logged in) -->
      <div v-else-if="isStaffOrAdmin" class="debug-info">
        <p><small>Personel/Yönetici hesabı - QR gerekmiyor</small></p>
        <button @click="bypass" class="bypass-btn">Devam Et</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useGlobal } from "@/composables";

const { isStaffOrAdmin, isLoggedIn, tableId } = useGlobal();

const route = useRoute();
const router = useRouter();
const showWarning = ref(false);

// Check if customer has valid tableId
const hasValidTable = computed(() => {
  return tableId.value != null && tableId.value > 0;
});

// Check current route path
const requiresTable = computed(() => {
  // List of routes that require tableId
  const protectedRoutes = ["/", "/menu", "/checkout"];
  return protectedRoutes.includes(route.path);
});

// Function to check if warning should show
const checkWarning = () => {
  if (requiresTable.value && !isStaffOrAdmin.value && !hasValidTable.value) {
    showWarning.value = true;
  } else {
    showWarning.value = false;
  }
};

watch(
  () => route.path,
  () => {
    checkWarning();
  },
  { immediate: true }
);

// Also watch role and tableId changes
watch([isStaffOrAdmin, hasValidTable], () => {
  checkWarning();
});

// For testing: allow staff/admin to bypass
const bypass = () => {
  showWarning.value = false;
};

// Go to login page
const goToLogin = () => {
  router.push("/login");
};
</script>

<style scoped>
.qr-warning-overlay {
  position: fixed;
  inset: 0;
  background: rgba(62, 44, 39, 0.95);
  backdrop-filter: blur(10px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow-y: auto;
}

.warning-card {
  background: var(--cream);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  border: 2px solid var(--gold2);
  animation: slideUp 0.4s ease;
  max-height: 90vh;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.warning-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.warning-card h2 {
  color: var(--espresso);
  margin-bottom: 1rem;
  font-size: 1.8rem;
  line-height: 1.3;
}

.warning-card p {
  color: var(--espresso);
  margin-bottom: 0.75rem;
  line-height: 1.6;
}

.sub-text {
  font-size: 0.9rem;
  color: rgba(62, 44, 39, 0.7);
  margin-bottom: 1.5rem;
}

.info-box {
  background: var(--highlight);
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
  text-align: left;
  border: 1px solid var(--gold2);
}

.info-box p {
  margin-bottom: 0.75rem;
  color: var(--espresso);
  font-weight: 600;
}

.info-box ol {
  margin: 0.75rem 0 0 1.25rem;
  color: var(--espresso);
  padding-left: 0.5rem;
}

.info-box li {
  margin: 0.5rem 0;
  line-height: 1.5;
}

.login-prompt {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gold2);
}

.prompt-text {
  color: var(--espresso);
  font-size: 0.95rem;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.login-btn {
  background: var(--espresso);
  color: var(--cream);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  box-shadow: 0 2px 6px rgba(62, 44, 39, 0.3);
  font-size: 1rem;
}

.login-btn:hover {
  background: var(--gold2);
  color: var(--espresso);
  box-shadow: 0 3px 8px rgba(164, 126, 59, 0.45);
  transform: translateY(-2px);
}

.login-btn:active {
  transform: translateY(0);
}

.debug-info {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gold2);
}

.debug-info p {
  margin-bottom: 0.75rem;
  color: rgba(62, 44, 39, 0.7);
}

.bypass-btn {
  background: var(--gold);
  color: var(--espresso);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  font-size: 1rem;
}

.bypass-btn:hover {
  background: var(--gold2);
  transform: translateY(-2px);
  box-shadow: 0 3px 8px rgba(164, 126, 59, 0.45);
}

.bypass-btn:active {
  transform: translateY(0);
}

/* Mobile responsive */
@media (max-width: 768px) {
  .qr-warning-overlay {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 2rem;
  }

  .warning-card {
    padding: 2rem 1.5rem;
    max-height: calc(100vh - 4rem);
    margin: auto 0;
  }

  .warning-icon {
    font-size: 3rem;
  }

  .warning-card h2 {
    font-size: 1.5rem;
  }

  .warning-card p {
    font-size: 0.95rem;
  }

  .info-box {
    padding: 1.25rem;
  }

  .info-box ol {
    margin-left: 1rem;
    padding-left: 0.25rem;
  }

  .info-box li {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .qr-warning-overlay {
    padding: 0.75rem;
    padding-top: 1.5rem;
  }

  .warning-card {
    padding: 1.75rem 1.25rem;
    border-radius: 16px;
    padding-bottom: calc(1.75rem + env(safe-area-inset-bottom, 20px));
  }

  .warning-icon {
    font-size: 2.5rem;
    margin-bottom: 0.75rem;
  }

  .warning-card h2 {
    font-size: 1.35rem;
    margin-bottom: 0.75rem;
  }

  .warning-card p {
    font-size: 0.9rem;
    margin-bottom: 0.6rem;
  }

  .sub-text {
    font-size: 0.85rem;
    margin-bottom: 1.25rem;
  }

  .info-box {
    padding: 1rem;
    margin: 1.25rem 0;
  }

  .info-box p {
    font-size: 0.9rem;
  }

  .info-box ol {
    margin-left: 0.75rem;
  }

  .info-box li {
    font-size: 0.85rem;
    margin: 0.4rem 0;
  }

  .login-prompt,
  .debug-info {
    margin-top: 1.5rem;
    padding-top: 1.25rem;
  }

  .prompt-text {
    font-size: 0.9rem;
    margin-bottom: 0.875rem;
  }

  .login-btn,
  .bypass-btn {
    padding: 0.7rem 1.25rem;
    font-size: 0.95rem;
    width: 100%;
  }
}

/* Landscape mobile fix */
@media (max-height: 600px) and (orientation: landscape) {
  .qr-warning-overlay {
    align-items: flex-start;
    padding-top: 1rem;
  }

  .warning-card {
    max-height: calc(100vh - 2rem);
    padding: 1.5rem 1.25rem;
  }

  .warning-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }

  .warning-card h2 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
  }

  .info-box {
    padding: 1rem;
    margin: 1rem 0;
  }

  .login-prompt,
  .debug-info {
    margin-top: 1rem;
    padding-top: 1rem;
  }
}
</style>
