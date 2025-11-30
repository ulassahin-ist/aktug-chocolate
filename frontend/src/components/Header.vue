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

  /* Less shouty, more premium */
  background: radial-gradient(
      circle at top left,
      rgba(247, 213, 163, 0.18),
      transparent 55%
    ),
    linear-gradient(
      120deg,
      var(--espresso-dark) 0%,
      var(--espresso) 45%,
      var(--espresso-dark) 100%
    );

  color: var(--cream);
  padding: 0.9rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;

  /* softer, more realistic shadow */
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.22);
  border-bottom: 1px solid rgba(0, 0, 0, 0.55); /* no more gold bar */
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
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45));
}

/* NAVIGATION */
.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

/* keep it simple, less “behaviour” */
.nav-links a {
  color: var(--cream);
  text-decoration: none;
  font-weight: 500;
  padding: 0.35rem 0;
  font-size: 15px;
  white-space: nowrap;
  position: relative;
  letter-spacing: 0.03em;

  transition: color var(--transition-base), opacity var(--transition-base);
}

/* thinner, centered underline */
.nav-links a::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--gold), var(--gold2));
  transition: width var(--transition-base);
}

.nav-links a:hover::after {
  width: 60%;
}

.nav-links a:hover {
  color: var(--gold);
}

/* Active route: color + underline, nothing crazy */
.router-link-active {
  color: var(--gold);
  font-weight: 600;
}

.router-link-active::after {
  width: 60%;
}

@media (max-width: 700px) {
  .header {
    padding: 0.8rem 1.1rem;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.22);
  }

  .nav-links {
    gap: 0.85rem;
  }

  .nav-links a {
    font-size: 13px;
  }

  .logo {
    padding: 2px 0;
    max-width: 150px;
    height: 20px;
  }
}
</style>
