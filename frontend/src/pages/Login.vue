<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo">
        <img src="/logo.png" alt="Logo" />
      </div>

      <form @submit.prevent="handleLogin">
        <div class="input-wrapper">
          <span class="icon"></span>
          <input
            v-model="username"
            type="text"
            placeholder="Email"
            required
            autocomplete="username"
          />
        </div>

        <div class="input-wrapper">
          <span class="icon"></span>
          <input
            v-model="password"
            type="password"
            placeholder="Şifre"
            required
            autocomplete="current-password"
          />
        </div>

        <div class="forgot-password">Şifremi Unuttum</div>

        <button type="submit" :disabled="loading">
          {{ loading ? "Giriş yapılıyor..." : "GIRIŞ" }}
        </button>

        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useGlobal } from "@/composables";

const { isAdmin, login } = useGlobal();
const router = useRouter();

const username = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  error.value = "";

  const ok = await login(username.value, password.value);

  if (ok) {
    if (isAdmin.value) router.push("/admin/orders");
    else router.push("/");
  } else {
    error.value = "Kullanıcı adı veya şifre yanlış";
  }

  loading.value = false;
};
</script>

<style scoped>
.login-page {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100dvh; /* mobile-safe height */
  background: var(--bg-gradient);
  padding: 1.5rem;
}

.login-card {
  position: relative;
  background: rgba(255, 255, 255, 0.15); /* lighter, clearer glass */
  padding: 2rem 2.5rem;
  border-radius: 30px;
  text-align: center;
  height: 350px;
  width: 400px;
  display: flex;
  align-items: center;
  animation: fadeIn 0.5s ease;
  backdrop-filter: blur(14px) saturate(140%);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35),
    /* softer downward shadow */ 0 4px 10px rgba(255, 255, 255, 0.15) inset; /* subtle inner glow */
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
  width: 100%;
}
/* input row */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin: 1rem 0;
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

.forgot-password {
  text-align: right;
  color: var(--espresso);
  font-size: 0.9rem;
  margin-top: 0.5rem;
  cursor: pointer;
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
  font-size: 1.1rem;
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
  background: rgba(200, 200, 200, 0.18);
  color: rgba(220, 220, 220, 0.7);
  cursor: not-allowed;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
}

.error {
  color: #c62828;
  margin-top: 0.8rem;
  font-size: 0.9rem;
}

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
    padding: 2rem 1.75rem;
    max-width: 360px;
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
