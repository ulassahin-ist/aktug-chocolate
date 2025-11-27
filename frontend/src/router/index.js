// frontend/src/router/index.js
import { createRouter, createWebHistory } from "vue-router";
import store from "../store";

import Menu from "../pages/Menu.vue";
import Login from "../pages/Login.vue";
import Register from "../pages/Register.vue";
import Verify from "../pages/Verify.vue";
import Waiter from "../pages/Waiter.vue";
import AdminTabs from "../components/AdminTabs.vue";
import AdminOrders from "../pages/AdminOrders.vue";
import AdminMenu from "../pages/AdminMenu.vue";
import AdminDashboard from "../pages/AdminDashboard.vue";
import AdminCategories from "../pages/AdminCategories.vue";
import AdminReports from "../pages/AdminReports.vue";
import AdminSettings from "../pages/AdminSettings.vue";
import Checkout from "../pages/Checkout.vue";

const routes = [
  // ✅ Customer routes - require tableId
  {
    path: "/",
    component: Menu,
    meta: { requiresTable: true },
  },
  {
    path: "/menu",
    component: Menu,
    meta: { requiresTable: true },
  },
  {
    path: "/checkout",
    component: Checkout,
    meta: { requiresTable: true },
  },

  // Public routes - no tableId required
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/verify", component: Verify },

  // Staff routes - no tableId required
  { path: "/waiter", component: Waiter },

  // Admin routes - no tableId required
  {
    path: "/admin",
    component: AdminTabs,
    beforeEnter: (to, from, next) => {
      if (to.path === "/admin") {
        const last = localStorage.getItem("lastAdminRoute");

        if (last && last.startsWith("/admin/")) {
          return next(last);
        }
        return next("/admin/dashboard");
      }

      next();
    },
    children: [
      { path: "", component: AdminDashboard },
      { path: "orders", component: AdminOrders },
      { path: "menu", component: AdminMenu },
      { path: "categories", component: AdminCategories },
      { path: "reports", component: AdminReports },
      { path: "settings", component: AdminSettings },
      { path: "dashboard", component: AdminDashboard },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

//
// 🔒 NAVIGATION GUARD
//
router.beforeEach((to, from, next) => {
  const { token, role, tableId } = store.state;

  // Block admin routes unless logged in as admin
  if (to.path.startsWith("/admin") && (!token || role !== "admin")) {
    return next("/login");
  }

  // Prevent logged-in users from visiting login/register
  if ((to.path === "/login" || to.path === "/register") && token) {
    if (role === "admin") return next("/admin/orders");
    if (role === "waiter") return next("/waiter");
    return next("/");
  }

  // ✅ Log warning for customer routes without tableId
  // (QRGuard component will handle showing the actual warning)
  if (to.meta.requiresTable) {
    const isStaffOrAdmin = ["admin", "staff"].includes(role);
    const hasValidTable = tableId != null && tableId > 0;

    if (!isStaffOrAdmin && !hasValidTable) {
      console.warn(
        "⚠️ Customer accessing page without tableId - QRGuard will show"
      );
    }
  }

  next();
});

export default router;
