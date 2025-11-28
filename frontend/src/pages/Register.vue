<template>
  <div class="login-page">
    <div class="login-card">
      <div class="logo">
        <img src="/logo.png" alt="Logo" />
      </div>

      <form @submit.prevent="submit">
        <div class="input-wrapper">
          <div class="icon"></div>
          <input
            type="text"
            v-model="fullName"
            placeholder="Ad Soyad"
            required
          />
        </div>

        <div class="input-wrapper">
          <div class="icon"></div>
          <input
            type="text"
            v-model="username"
            placeholder="E-Posta"
            required
          />
        </div>

        <div class="input-wrapper">
          <div class="icon"></div>
          <input type="text" v-model="phone" placeholder="Telefon" required />
        </div>

        <div class="input-wrapper">
          <div class="icon"></div>
          <input
            type="password"
            v-model="password"
            placeholder="Şifre"
            required
          />
        </div>

        <div class="error" v-if="error">{{ error }}</div>

        <button
          type="submit"
          :disabled="
            loading ||
            fullName.length < 2 ||
            username.length < 2 ||
            phone.length < 2 ||
            password.length < 2
          "
        >
          {{ loading ? "Kayıt Yapılıyor..." : "Kayıt Ol" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "@/config/api";
import { useRouter } from "vue-router";

const router = useRouter();

const fullName = ref("");
const username = ref("");
const phone = ref("");
const password = ref("");

const loading = ref(false);
const error = ref("");

const submit = async () => {
  loading.value = true;
  error.value = "";

  try {
    await api.post(`/auth/register`, {
      fullName: fullName.value,
      username: username.value,
      password: password.value,
      phone: phone.value,
    });

    window.$alert(
      "Kayıt başarılı! Email adresinizden onaylayınız. Spam kutunuzu da kontrol ediniz.",
      "Başarılı"
    );
    router.push("/login");
  } catch (err) {
    error.value =
      err.response?.data?.error || "Kayıt sırasında bir hata oluştu";
    window.$toast(error.value, "error");
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
  height: 100vh;
  background: var(--bg-gradient);
}

.login-card {
  position: relative;
  background: #ffffff1f;
  padding: 2rem 2.5rem;
  border-radius: 30px;
  text-align: center;
  height: 450px;
  width: 400px;
  animation: fadeIn 0.5s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.45);
  align-content: center;
  border: 1px solid rgba(249, 247, 244, 0.3);
  backdrop-filter: blur(6px);
}

.logo {
  position: absolute;
  top: -75px;
  left: 50%;
  transform: translateX(-50%);
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: var(--espresso);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}
.logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

form {
  margin-top: 3rem;
  align-content: center;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  margin: 1rem 0;
}

.input-wrapper .icon {
  position: absolute;
  left: 0;
  width: 44px;
  height: 100%;
  background: var(--espresso);
}

.input-wrapper input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 49px;
  border: 1px solid var(--gold2);
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
  width: 80%;
  height: 50px;

  left: 50%;
  transform: translateX(-50%);
  bottom: -50px;
  z-index: -1;

  background: rgba(195, 168, 128, 0.3);
  backdrop-filter: blur(6px);

  color: rgba(255, 255, 255, 0.88);
  text-shadow: 0px 0px 6px rgba(201, 162, 39, 0.75);

  border: none;
  padding: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  font-size: 1.1rem;
  letter-spacing: 3px;

  border-bottom-right-radius: 30px;
  border-bottom-left-radius: 30px;
  border: 1px solid rgba(249, 247, 244, 0.3);
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  background: rgba(247, 213, 163, 0.3); /* brighter warm glass */
}

button:active:not(:disabled) {
  background: rgba(247, 213, 163, 0.18); /* darker warm glass */
}
button:disabled {
  background: rgba(60, 60, 60, 0.66); /* darker warm glass */
  color: rgba(177, 177, 177, 0.66);
  cursor: not-allowed;
  text-shadow: none;
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

@media (max-width: 700px) {
  .login-card {
    transform: translateY(-40%);
    padding: 2rem 2.5rem;
    height: fit-content;
    max-width: 400px;
    width: 90%;
  }
}
</style>
