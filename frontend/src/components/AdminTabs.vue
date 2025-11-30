<template>
  <div class="admin-tabs">
    <nav class="tabs">
      <router-link to="/admin/dashboard" class="tab" active-class="active"
        >Panel</router-link
      >
      <router-link to="/admin/orders" class="tab" active-class="active"
        >Siparişler</router-link
      >
      <router-link to="/admin/menu" class="tab" active-class="active"
        >Menü</router-link
      >
      <router-link to="/admin/categories" class="tab" active-class="active"
        >Kategoriler</router-link
      >
      <router-link to="/admin/reports" class="tab" active-class="active"
        >Raporlar</router-link
      >
      <router-link to="/admin/settings" class="tab" active-class="active"
        >Ayarlar</router-link
      >
    </nav>

    <div class="tab-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

watch(
  () => route.fullPath,
  (path) => {
    if (path.startsWith("/admin")) {
      localStorage.setItem("lastAdminRoute", path);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.admin-tabs {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  width: 100%;
  margin: 1.5rem auto;
  padding: 1.25rem 1.5rem;
  background: var(--cream);
  border-radius: 16px;
  box-shadow: var(--shadow-md);
  height: calc(100dvh - var(--scroll-offset) - 3rem);
  box-sizing: border-box;
  overflow: hidden;
}

/* NAV TABS BAR */
.tabs {
  flex-shrink: 0;
  display: flex;
  gap: 0.5rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(164, 126, 59, 0.35);
  overflow-x: auto;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  padding-top: 2px;
}

.tabs::-webkit-scrollbar {
  height: 4px;
}
.tabs::-webkit-scrollbar-thumb {
  background: var(--gold2);
  border-radius: 999px;
}
.tabs::-webkit-scrollbar-track {
  background: transparent;
}

/* INDIVIDUAL TAB */
.tab {
  text-decoration: none;
  color: var(--espresso);
  font-family: var(--font-heading);
  font-weight: 500;
  font-size: 0.85rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  padding: 0.55rem 1rem;
  border-radius: 999px;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease,
    transform 0.18s ease;
  background: transparent;
  border: 1px solid transparent;
  white-space: nowrap;
}

/* Hover state */
.tab:hover {
  background: rgba(247, 213, 163, 0.35);
  color: var(--espresso);
  border-color: rgba(164, 126, 59, 0.45);
  transform: translateY(-1px);
}

/* Active tab state */
.tab.active {
  background: linear-gradient(135deg, #d4af37 0%, #c9a227 100%);
  color: var(--espresso);
  font-weight: 600;
  border-color: var(--gold2);
  box-shadow: 0 2px 8px rgba(201, 162, 39, 0.4);
  position: relative;
}

/* Small underline accent on active tab */
.tab.active::after {
  content: "";
  position: absolute;
  left: 20%;
  right: 20%;
  bottom: -4px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

/* CONTENT AREA */
.tab-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 1.5rem;
  margin-top: 0.5rem;
  background: var(--cream-light);
  border-radius: 12px;
  height: 100%;
  box-shadow: inset 0 0 10px rgba(62, 44, 39, 0.05);
}

/* Let inner admin pages scroll, not the outer shell */
.tab-content > * {
  min-height: 0;
}

/* =============== 📱 MOBILE =============== */
@media (max-width: 700px) {
  .admin-tabs {
    width: 100%;
    margin: 0;
    padding: 0.75rem 0.5rem;
    height: calc(100dvh - var(--scroll-offset));
    border-radius: 0;
    box-shadow: none;
  }

  .tabs {
    padding: 0.25rem 0.25rem 0.5rem;
    gap: 0.4rem;
  }

  .tab {
    padding: 0.45rem 0.7rem;
    font-size: 0.78rem;
  }

  .tab-content {
    padding: 0.75rem;
    margin-top: 0.5rem;
    border-radius: 10px;
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 16px));
  }
}

/* Ultra small devices */
@media (max-width: 400px) {
  .tabs {
    gap: 0.3rem;
  }

  .tab {
    padding: 0.4rem 0.55rem;
    font-size: 0.72rem;
  }

  .tab-content {
    padding: 0.6rem;
  }
}
</style>
