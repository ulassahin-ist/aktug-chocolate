<template>
  <header class="header">
    <div class="logo">
      <div class="logo">
        <img src="/logoname.png" alt="Logo" />
      </div>
    </div>

    <nav class="nav-links">
      <router-link to="/">Menu</router-link>
      <router-link v-if="isAdmin || isStaff" to="/admin">Panel</router-link>
      <router-link v-if="!token" to="/login">Login</router-link>
      <router-link v-if="!token" to="/register">Register</router-link>

      <a v-if="token" href="#" @click.prevent="logout"> Logout </a>
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
  background-color: var(--espresso);
  color: var(--cream);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;

  /* Softer premium shadow */
  box-shadow: 0 8px 24px rgba(62, 44, 39, 0.35);
}

/* LOGO */

.logo {
  display: flex;
  align-items: center;
  height: 24px;
  background: var(--espresso);
  overflow: hidden;
}
.logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* NAVIGATION */
.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-links a {
  color: var(--cream);
  text-decoration: none;
  font-weight: 500;
  transition: 0.25s ease;
  padding-bottom: 2px;
}

/* Hover = gold */
.nav-links a:hover {
  color: var(--gold);
}

/* Active route */
.router-link-active {
  color: var(--gold);
  border-bottom: 2px solid var(--gold);
}
</style>
