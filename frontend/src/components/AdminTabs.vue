<template>
  <div class="admin-tabs">
    <nav class="tabs">
      <router-link to="/admin/dashboard" class="tab" active-class="active"
        >Dashboard</router-link
      >
      <router-link to="/admin/orders" class="tab" active-class="active"
        >Orders</router-link
      >
      <router-link to="/admin/menu" class="tab" active-class="active"
        >Menu</router-link
      >
      <router-link to="/admin/categories" class="tab" active-class="active"
        >Categories</router-link
      >
      <router-link to="/admin/reports" class="tab" active-class="active"
        >Reports</router-link
      >
      <router-link to="/admin/settings" class="tab" active-class="active"
        >Settings</router-link
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
  width: 90%;
  margin: 20px auto;
  padding: 16px;
  background: var(--cream);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(62, 44, 39, 0.1);
  height: calc(100vh - var(--scroll-offset) - 40px);
  box-sizing: border-box;
  overflow: hidden;
}

/* NAV TABS BAR */
.tabs {
  flex-shrink: 0;
  display: flex;
  gap: 0.6rem;
  border-bottom: 2px solid var(--gold2);
  padding-bottom: 0;
  overflow-x: auto;
  width: 100%;
}

/* INDIVIDUAL TAB */
.tab {
  text-decoration: none;
  color: var(--espresso);
  font-weight: 500;
  padding: 0.6rem 1rem;
  border-radius: 8px 8px 0 0;
  transition: 0.2s ease;
  background: transparent;
  border: 1px solid transparent;
}

/* Hover state */
.tab:hover {
  background: var(--beige);
  color: var(--espresso);
  border-color: var(--gold2);
}

/* Active tab state */
.tab.active {
  background: var(--gold);
  color: var(--espresso);
  font-weight: 600;
  border-color: var(--gold2);
  box-shadow: 0 -2px 6px rgba(62, 44, 39, 0.1);
}

/* CONTENT AREA */
.tab-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 45px;
  background: var(--cream-light);
  border-radius: 0 0 12px 12px;
  height: 100%;
  box-shadow: inset 0 0 10px rgba(62, 44, 39, 0.05);
}
@media (max-width: 700px) {
  .tab-content {
    padding: 5px;
  }
  .admin-tabs {
    width: 100%;
    margin: 0;
    height: calc(100vh - var(--scroll-offset));
  }
}
</style>
