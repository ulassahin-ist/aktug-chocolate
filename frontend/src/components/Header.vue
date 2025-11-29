<template>
  <header class="header">
    <div class="logo">
      <img src="/logoname.png" alt="Logo" />
    </div>

    <nav class="nav-links">
      <router-link to="/">Menü</router-link>
      <router-link v-if="isAdmin || isStaff" to="/admin">Panel</router-link>
      <router-link v-if="!token" to="/login">Giriş</router-link>
      <router-link v-if="!token" to="/register">Üye Ol</router-link>
      <a v-if="token" href="#" @click.prevent="logout">Çıkış</a>
    </nav>
  </header>
</template>

<script setup>
import { useGlobal } from "@/composables";
const { isAdmin, isStaff, token, logout } = useGlobal();
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(
    180deg,
    var(--espresso) 0%,
    var(--espresso-dark) 100%
  );
  color: var(--cream);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-xl);
  border-bottom: 2px solid var(--gold2);
}

/* LOGO */
.logo {
  display: flex;
  align-items: center;
  max-width: 186px;
  height: 24px;
  overflow: hidden;
}

.logo img {
  height: 100%;
  object-fit: cover;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

/* NAVIGATION */
.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-links a {
  color: var(--cream);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-base);
  padding: 0.5rem 0;
  font-size: 16px;
  white-space: nowrap;
  position: relative;
}

/* Hover effect with underline */
.nav-links a::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--gold), var(--gold2));
  transition: width var(--transition-base);
}

.nav-links a:hover::after {
  width: 100%;
}

.nav-links a:hover {
  color: var(--gold);
  transform: translateY(-1px);
}

/* Active route */
.router-link-active {
  color: var(--gold);
  font-weight: 600;
}

.router-link-active::after {
  width: 100%;
}

@media (max-width: 700px) {
  .header {
    padding: 1rem;
    box-shadow: var(--shadow-lg);
  }

  .nav-links {
    gap: 0.75rem;
  }

  .nav-links a {
    font-size: 14px;
    padding: 0.4rem 0;
  }

  .logo {
    padding: 2.5px 0;
    max-width: 150px;
    height: 20px;
  }
}
</style>
