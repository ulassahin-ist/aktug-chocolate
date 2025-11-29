<!-- 
  frontend/src/components/Icons.vue
  Centralized icon component using Heroicons or Lucide
-->

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    :stroke="color"
    :fill="filled ? color : 'none'"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="['icon', className]"
  >
    <component :is="iconComponent" />
  </svg>
</template>

<script setup>
import { computed, defineAsyncComponent, h } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  size: {
    type: [String, Number],
    default: 24,
  },
  color: {
    type: String,
    default: "currentColor",
  },
  strokeWidth: {
    type: [String, Number],
    default: 2,
  },
  filled: {
    type: Boolean,
    default: false,
  },
  className: {
    type: String,
    default: "",
  },
});

// Icon path definitions (using Heroicons-style paths)
const icons = {
  // Shopping & Cart
  "shopping-cart": () =>
    h("path", {
      d: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    }),

  // Plus & Minus
  plus: () => h("path", { d: "M12 5v14m-7-7h14" }),
  minus: () => h("path", { d: "M5 12h14" }),
  "plus-circle": () => [
    h("circle", { cx: "12", cy: "12", r: "10" }),
    h("path", { d: "M12 8v8m-4-4h8" }),
  ],

  // Navigation
  menu: () => h("path", { d: "M4 6h16M4 12h16M4 18h16" }),
  close: () => h("path", { d: "M6 18L18 6M6 6l12 12" }),
  "chevron-left": () => h("path", { d: "M15 19l-7-7 7-7" }),
  "chevron-right": () => h("path", { d: "M9 5l7 7-7 7" }),
  "chevron-down": () => h("path", { d: "M19 9l-7 7-7-7" }),
  "arrow-left": () => h("path", { d: "M19 12H5m0 0l7 7m-7-7l7-7" }),

  // Actions
  trash: () => [
    h("path", { d: "M3 6h18" }),
    h("path", {
      d: "M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2",
    }),
    h("path", { d: "M10 11v6m4-6v6" }),
  ],
  edit: () =>
    h("path", {
      d: "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7m-1.586-3.414a2 2 0 010-2.828l-3.172-3.172a2 2 0 00-2.828 0l-3.172 3.172a2 2 0 000 2.828L17.586 21",
    }),
  check: () => h("path", { d: "M5 13l4 4L19 7" }),
  "check-circle": () => [
    h("path", { d: "M22 11.08V12a10 10 0 11-5.93-9.14" }),
    h("path", { d: "M22 4L12 14.01l-3-3" }),
  ],

  // Status & Info
  "alert-triangle": () => [
    h("path", {
      d: "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    }),
    h("path", { d: "M12 9v4m0 4h.01" }),
  ],
  info: () => [
    h("circle", { cx: "12", cy: "12", r: "10" }),
    h("path", { d: "M12 16v-4m0-4h.01" }),
  ],
  "alert-circle": () => [
    h("circle", { cx: "12", cy: "12", r: "10" }),
    h("path", { d: "M12 8v4m0 4h.01" }),
  ],

  // User & Account
  user: () => [
    h("path", { d: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" }),
    h("circle", { cx: "12", cy: "7", r: "4" }),
  ],
  "user-circle": () => [
    h("path", {
      d: "M5.121 17.804A10 10 0 1119.879 17.804M15 11a3 3 0 11-6 0 3 3 0 016 0z",
    }),
  ],
  login: () => [
    h("path", { d: "M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" }),
    h("path", { d: "M10 17l5-5-5-5m5 5H3" }),
  ],
  logout: () => [
    h("path", { d: "M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" }),
    h("path", { d: "M16 17l5-5-5-5m5 5H9" }),
  ],

  // Food & Restaurant
  coffee: () => [
    h("path", {
      d: "M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zm6-4v3m4-3v3",
    }),
  ],
  utensils: () => [
    h("path", {
      d: "M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2M7 2v20M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7",
    }),
  ],

  // Settings & Admin
  settings: () => [
    h("circle", { cx: "12", cy: "12", r: "3" }),
    h("path", {
      d: "M12 1v6m0 6v6m5.196-15.804L15.75 7.05m-7.5 7.5l-1.446 1.446m12.392 0L17.25 14.05m-10.5-7.5L5.304 5.196M23 12h-6M7 12H1m15.804 5.196L15.75 16.95m-7.5-10.5l-1.446-1.446",
    }),
  ],
  cog: () => [
    h("circle", { cx: "12", cy: "12", r: "3" }),
    h("path", {
      d: "M12 1v6m0 6v6m5.196-15.804L15.75 7.05m-7.5 7.5l-1.446 1.446m12.392 0L17.25 14.05m-10.5-7.5L5.304 5.196M23 12h-6M7 12H1m15.804 5.196L15.75 16.95m-7.5-10.5l-1.446-1.446",
    }),
  ],

  // Business
  "chart-bar": () =>
    h("path", { d: "M3 13h4v8H3v-8zm6-6h4v14H9V7zm6-4h4v18h-4V3z" }),
  "trending-up": () =>
    h("path", { d: "M23 6l-9.5 9.5-5-5L1 18m22-12h-6m6 0v6" }),
  dollar: () => [
    h("path", { d: "M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" }),
  ],

  // Communication
  bell: () => [
    h("path", {
      d: "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
    }),
  ],
  mail: () => [
    h("path", {
      d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z",
    }),
    h("path", { d: "M22 6l-10 7L2 6" }),
  ],

  // Document
  document: () => [
    h("path", { d: "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" }),
    h("path", { d: "M14 2v6h6M16 13H8m8 4H8m2-8H8" }),
  ],
  clipboard: () => [
    h("path", {
      d: "M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2",
    }),
    h("rect", { x: "8", y: "2", width: "8", height: "4", rx: "1", ry: "1" }),
  ],

  // Media
  image: () => [
    h("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
    h("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
    h("path", { d: "M21 15l-5-5L5 21" }),
  ],
  camera: () => [
    h("path", {
      d: "M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z",
    }),
    h("circle", { cx: "12", cy: "13", r: "4" }),
  ],

  // Location & Navigation
  "map-pin": () => [
    h("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" }),
    h("circle", { cx: "12", cy: "10", r: "3" }),
  ],
  home: () => [
    h("path", { d: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" }),
    h("path", { d: "M9 22V12h6v10" }),
  ],

  // Time
  clock: () => [
    h("circle", { cx: "12", cy: "12", r: "10" }),
    h("path", { d: "M12 6v6l4 2" }),
  ],
  calendar: () => [
    h("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2", ry: "2" }),
    h("path", { d: "M16 2v4M8 2v4M3 10h18" }),
  ],

  // Search & Filter
  search: () => [
    h("circle", { cx: "11", cy: "11", r: "8" }),
    h("path", { d: "M21 21l-4.35-4.35" }),
  ],
  filter: () => h("path", { d: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z" }),
};

const iconComponent = computed(() => {
  const iconDef = icons[props.name];
  return iconDef
    ? iconDef()
    : h("path", {
        d: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
      });
});

const viewBox = computed(() => "0 0 24 24");
</script>

<style scoped>
.icon {
  display: inline-block;
  vertical-align: middle;
  transition: all 0.2s ease;
}

.icon:hover {
  opacity: 0.8;
}
</style>
