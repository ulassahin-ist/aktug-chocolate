<template>
  <div class="verify-page">
    <div class="verify-card">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <h2>Doğrulanıyor...</h2>
        <p>Lütfen bekleyin</p>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="success-state">
        <div class="icon-circle success">✓</div>
        <h1>Başarılı!</h1>
        <p class="message">
          E-posta adresiniz başarıyla doğrulandı. Artık giriş yapabilirsiniz.
        </p>
        <button class="action-btn" @click="goToLogin">Giriş Yap</button>
      </div>

      <!-- Error State -->
      <div v-else class="error-state">
        <div class="icon-circle error">✕</div>
        <h1>Doğrulama Başarısız</h1>
        <p class="message">{{ errorMessage }}</p>
        <div class="action-buttons">
          <button class="action-btn secondary" @click="goToRegister">
            Tekrar Kayıt Ol
          </button>
          <button class="action-btn" @click="goToHome">Ana Sayfa</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import api from "@/config/api";

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const success = ref(false);
const errorMessage = ref("");

onMounted(async () => {
  const token = route.query.token;

  if (!token) {
    loading.value = false;
    errorMessage.value = "Doğrulama token'ı bulunamadı.";
    return;
  }

  try {
    const res = await api.get(`/auth/verify`, {
      params: { token },
    });

    if (res.data.success) {
      success.value = true;
      window.$toast?.(res.data.message, "success");
    }
  } catch (err) {
    const msg =
      err.response?.data?.error ||
      "Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.";
    errorMessage.value = msg;
    window.$toast?.(msg, "error");
  } finally {
    loading.value = false;
  }
});

const goToLogin = () => router.push("/login");
const goToRegister = () => router.push("/register");
const goToHome = () => router.push("/");
</script>

<style scoped>
.verify-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--bg-gradient);
  padding: 20px;
}

.verify-card {
  background: #ffffff;
  border-radius: 24px;
  padding: 60px 50px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(62, 44, 39, 0.2);
  animation: slideUp 0.5s ease;
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

/* Loading State */
.loading-state {
  padding: 20px;
}

.loading-state h2 {
  color: var(--espresso);
  margin-bottom: 10px;
  font-size: 1.8rem;
}

.loading-state p {
  color: rgba(62, 44, 39, 0.7);
  font-size: 1rem;
}

/* Icon Circles */
.icon-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  margin: 0 auto 30px;
  font-weight: bold;
  animation: scaleIn 0.5s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.icon-circle.success {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(76, 175, 80, 0.4);
}

.icon-circle.error {
  background: linear-gradient(135deg, #e74c3c 0%, #ef5350 100%);
  color: white;
  box-shadow: 0 8px 24px rgba(231, 76, 60, 0.4);
}

/* Content */
h1 {
  color: var(--espresso);
  margin-bottom: 20px;
  font-size: 2rem;
}

.message {
  color: rgba(62, 44, 39, 0.8);
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 40px;
}

/* Buttons */
.action-btn {
  background: linear-gradient(135deg, #c9a227 0%, #a47e3b 100%);
  color: white;
  border: none;
  padding: 16px 40px;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(201, 162, 39, 0.4);
  margin: 0 10px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(201, 162, 39, 0.5);
}

.action-btn:active {
  transform: translateY(0);
}

.action-btn.secondary {
  background: var(--cream);
  color: var(--espresso);
  border: 2px solid var(--gold2);
  box-shadow: 0 4px 12px rgba(62, 44, 39, 0.1);
}

.action-btn.secondary:hover {
  background: var(--highlight);
  box-shadow: 0 6px 16px rgba(62, 44, 39, 0.15);
}

.action-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 15px;
}

@media (max-width: 600px) {
  .verify-card {
    padding: 40px 30px;
  }

  h1 {
    font-size: 1.6rem;
  }

  .message {
    font-size: 1rem;
  }

  .action-btn {
    padding: 14px 30px;
    font-size: 1rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>
