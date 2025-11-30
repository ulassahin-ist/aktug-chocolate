<template>
  <!-- QRGuard component - shows warning for customers without tableId -->
  <QRGuard />

  <Header />
  <router-view />
  <Modals />
  <Basket />
</template>

<script setup>
import { onMounted } from "vue";
import Header from "./components/Header.vue";
import Modals from "./components/Modals.vue";
import Basket from "./components/Basket.vue";
import QRGuard from "./components/QRGuard.vue";

import { useGlobal } from "@/composables";
const {
  setBranch,
  setTableId,
  getBranchId,
  validateBasket,
  fetchBranchSettings,
} = useGlobal();

onMounted(async () => {
  // 🔹 1) Read branchId and tableId from URL (QR code)
  const params = new URLSearchParams(window.location.search);

  let urlBranchId = params.get("branchId");
  let urlTableId = params.get("tableId");
  // Set branchId
  if (urlBranchId) {
    urlBranchId = Number(urlBranchId);
    if (!Number.isNaN(urlBranchId)) {
      setBranch(urlBranchId);
    }
  } else if (!getBranchId) {
    // 🔹 2) Fallback default branch if nothing set at all
    setBranch(1);
  }

  if (urlTableId) {
    urlTableId = Number(urlTableId);
    if (!Number.isNaN(urlTableId) && urlTableId > 0) {
      setTableId(urlTableId);
    }
  }

  // 🔹 3) Now validate basket, AFTER branch has been decided
  const result = await validateBasket();
  if (result === "UPDATED") {
    window.$toast(
      "Sepet güncellendi — bazı ürünler stok dışı veya silindi.",
      "warning"
    );
  }

  await fetchBranchSettings(false);
});
</script>
