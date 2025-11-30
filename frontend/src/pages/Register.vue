<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo">
        <img src="/logo.png" alt="Logo" />
      </div>

      <form @submit.prevent="submit">
        <div class="input-wrapper">
          <span class="icon"></span>
          <input
            type="text"
            v-model="fullName"
            placeholder="Ad Soyad"
            required
          />
        </div>

        <div class="input-wrapper">
          <span class="icon"></span>
          <input
            type="email"
            v-model="username"
            placeholder="E-Posta"
            required
            autocomplete="email"
          />
        </div>

        <div class="input-wrapper">
          <span class="icon"></span>
          <input type="tel" v-model="phone" placeholder="Telefon" required />
        </div>

        <div class="input-wrapper">
          <span class="icon"></span>
          <input
            type="password"
            v-model="password"
            placeholder="Şifre"
            required
            autocomplete="new-password"
          />
        </div>

        <p class="error" v-if="error">{{ error }}</p>

        <button type="submit" :disabled="isDisabled || loading">
          {{ loading ? "Kayıt Yapılıyor..." : "Kayıt Ol" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import api from "@/config/api";
import { useRouter } from "vue-router";

const router = useRouter();

const fullName = ref("");
const username = ref("");
const phone = ref("");
const password = ref("");

const loading = ref(false);
const error = ref("");

const isDisabled = computed(() => {
  return (
    fullName.value.trim().length < 2 ||
    username.value.trim().length < 5 ||
    phone.value.trim().length < 5 ||
    password.value.trim().length < 4
  );
});

const submit = async () => {
  loading.value = true;
  error.value = "";

  try {
    await api.post(`/auth/register`, {
      fullName: fullName.value.trim(),
      username: username.value.trim(),
      password: password.value,
      phone: phone.value.trim(),
    });

    window.$alert(
      "Kayıt başarılı! Lütfen e-posta adresinizden onaylayınız. Spam kutunuzu da kontrol ediniz.",
      "Başarılı"
    );
    router.push("/login");
  } catch (err) {
    const msg = err.response?.data?.error || "Kayıt sırasında bir hata oluştu";
    error.value = msg;
    window.$toast?.(msg, "error");
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100dvh;
  background: var(--bg-gradient);
  padding: 1.5rem;
}

.login-card {
  position: relative;
  background: rgba(255, 255, 255, 0.15);
  padding: 2.5rem 2.5rem 3rem;
  border-radius: 30px;
  text-align: center;
  width: 100%;
  max-width: 420px;
  animation: fadeIn 0.5s ease;
  backdrop-filter: blur(14px) saturate(140%);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35),
    0 4px 10px rgba(255, 255, 255, 0.15) inset;
  border: 1px solid rgba(255, 255, 255, 0.28);
}

/* circular logo badge */
.logo {
  position: absolute;
  top: -75px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(12px) saturate(160%);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35),
    0 0 0 2px rgba(255, 255, 255, 0.25);
  overflow: hidden;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

form {
  margin-top: 3rem;
}

/* input row */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin: 0.8rem 0;
}

/* left icon strip */
.input-wrapper .icon {
  position: absolute;
  left: 0;
  width: 44px;
  height: 100%;
  background: var(--espresso);
  border-radius: 4px 0 0 4px;
}

/* inputs */
.input-wrapper input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 49px;
  border: 1px solid var(--gold2);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: rgba(249, 247, 244, 0.9);
  color: var(--espresso);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 6px rgba(201, 162, 39, 0.7);
}

/* bottom big button */
button {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  bottom: -50px;

  width: 80%;
  height: 50px;

  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px) saturate(150%);

  color: #ffffff;
  text-shadow: 0 0 6px rgba(255, 255, 255, 0.4);

  border: 1px solid rgba(255, 255, 255, 0.28);
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;

  font-weight: 500;
  cursor: pointer;
  font-size: 1.05rem;
  letter-spacing: 3px;

  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
  transition: all 0.25s ease;
}

button:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.23);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

button:active:not(:disabled) {
  background: rgba(255, 255, 255, 0.15);
  transform: translateX(-50%) translateY(2px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.35);
}

button:disabled {
  background: rgba(200, 200, 200, 0.22);
  color: rgba(220, 220, 220, 0.8);
  cursor: not-allowed;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
}

.error {
  color: #c62828;
  margin-top: 0.6rem;
  font-size: 0.9rem;
}

/* entrance animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* mobile */
@media (max-width: 700px) {
  .login-card {
    padding: 2.3rem 1.9rem 3rem;
    max-width: 380px;
  }

  .logo {
    width: 130px;
    height: 130px;
    top: -65px;
  }

  button {
    height: 46px;
    font-size: 1rem;
    letter-spacing: 2px;
  }
}
</style>
