<template>
  <div class="menu-container">
    <header class="menu-header">
      <h1>MENÜ</h1>
      <p class="tagline"><i>Her ısırıkla farklı mutluluk...</i></p>

      <!-- CATEGORY SCROLL BAR -->
      <div class="category-scroll">
        <button
          v-for="section in grouped"
          :key="section.name"
          class="cat-btn"
          @click="scrollTo(section.name)"
        >
          {{ section.name }}
        </button>
      </div>
    </header>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Menü yükleniyor...</p>
    </div>

    <!-- RENDER GROUPED SECTIONS -->
    <section
      v-else
      class="menu-section"
      v-for="section in grouped"
      :key="section.name"
      :id="'cat-' + section.name"
    >
      <h2 class="category-title">{{ section.name }}</h2>

      <div class="menu-grid">
        <div
          v-for="item in section.items"
          :key="item.id"
          :class="{ disabled: !item.available || item.stock <= 0 }"
          class="menu-card"
        >
          <div class="img-wrap">
            <img
              :src="
                item.photo ? API_BASE + item.photo : '/menu-placeholder.png'
              "
              :alt="item.name"
            />

            <!-- out of stock badge (only if we show them) -->
            <div
              v-if="item.stock <= 0 && showOutOfStockItems"
              class="stock-badge out-of-stock"
            >
              Tükendi
            </div>

            <div
              v-else-if="
                stockWarnEnabled &&
                item.stock > 0 &&
                item.stock <= stockWarnThreshold
              "
              class="stock-badge low-stock"
            >
              Son {{ item.stock }}!
            </div>
          </div>

          <div class="menu-info">
            <div>
              <h3>{{ item.name }}</h3>
              <p class="desc">{{ item.description }}</p>
            </div>

            <div class="price-row">
              <span class="price">{{ item.price }}₺</span>
              <button
                class="btn-add"
                @click="handleAddToBasket(item)"
                :disabled="
                  item.stock <= 0 ||
                  !item.available ||
                  getItemQty(item.id) >= item.stock
                "
              >
                <Icons name="plus" :size="20" color="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.menu-container {
  padding: 2rem 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--cream);
  color: var(--espresso);
  height: calc(100dvh - var(--scroll-offset));
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.menu-container::-webkit-scrollbar {
  width: 0;
  height: 0;
}
.menu-header {
  text-align: center;
  margin-bottom: 2rem;
}

/* Main "MENÜ" title */
.menu-header h1 {
  font-family: "Playfair Display", "Raleway", system-ui, -apple-system,
    BlinkMacSystemFont, sans-serif;
  font-weight: 600;
  font-size: clamp(2rem, 4vw, 2.6rem);
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--espresso);
  margin-bottom: 0.6rem;
  position: relative;
  display: inline-block;
  padding-inline: 0.4em;
}

/* Gold underline accent under MENÜ */
.menu-header h1::after {
  content: "";
  position: absolute;
  left: 15%;
  right: 15%;
  bottom: -0.4rem;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, transparent, var(--gold), transparent);
}

/* Tagline under title */
.tagline {
  font-family: var(--font-body);
  font-style: italic;
  color: rgba(62, 44, 39, 0.7);
  font-size: 0.95rem;
  margin-top: 0.8rem;
  margin-bottom: 1.8rem;
}

/* Optional “quote” styling around tagline text */
.tagline::before,
.tagline::after {
  font-style: normal;
  color: rgba(62, 44, 39, 0.45);
}

.tagline::before {
  content: "“";
  margin-right: 0.15rem;
}

.tagline::after {
  content: "”";
  margin-left: 0.15rem;
}
/* Category scroll */
.category-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding: 0.4rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(164, 126, 59, 0.18);
  justify-content: flex-start;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.cat-btn {
  padding: 0.45rem 1.1rem;
  border-radius: 999px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all var(--transition-base);
  color: var(--espresso);
  white-space: nowrap;
  flex-shrink: 0;
}

.cat-btn:hover {
  background: var(--gold);
  color: white;
  border-color: var(--gold);
}

/* Menu sections */
.menu-section {
  margin-bottom: 3rem;
}

.category-title {
  font-size: 1.5rem;
  margin: 2rem 0 1rem;
  color: var(--espresso);
  border-bottom: 1px solid rgba(164, 126, 59, 0.2);
  padding-bottom: 0.5rem;
  font-weight: 600;
}

/* Menu grid */
.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.menu-card {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--transition-base);
  border: 1px solid rgba(164, 126, 59, 0.08);
  display: flex;
  flex-direction: column;
}

.menu-card:hover:not(.disabled) {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.menu-card.disabled {
  opacity: 0.4;
  pointer-events: none;
  filter: grayscale(100%);
}

/* Image */
.img-wrap {
  width: 100%;
  height: 180px;
  overflow: hidden;
  position: relative;
  background: var(--cream-light);
}

.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.menu-card:hover:not(.disabled) .img-wrap img {
  transform: scale(1.05);
}

/* Stock badges */
.stock-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.low-stock {
  background: rgba(255, 152, 0, 0.9);
  color: white;
}

.out-of-stock {
  background: rgba(231, 76, 60, 0.9);
  color: white;
}

/* Card content */
.menu-info {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.menu-info h3 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: var(--espresso);
  font-weight: 600;
}

.desc {
  font-size: 0.875rem;
  color: rgba(62, 44, 39, 0.6);
  min-height: 38px;
  line-height: 1.4;
  margin-bottom: 0.75rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--espresso);
}

/* Loading */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.loading-state p {
  font-size: 1rem;
  color: rgba(62, 44, 39, 0.6);
}

@media (max-width: 900px) {
  .menu-container {
    padding: 1.5rem 1rem;
    padding-bottom: calc(100px + env(safe-area-inset-bottom, 20px));
  }
  .menu-header {
    margin-bottom: 0;
  }

  .menu-header h1 {
    font-size: 1.75rem;
  }

  .tagline {
    font-size: 0.9rem;
  }

  .category-title {
    font-size: 1.25rem;
    margin-top: 10px;
  }

  .menu-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
  .menu-grid:has(> .menu-card:only-child) {
    grid-template-columns: 1fr;
  }
  .img-wrap {
    height: 140px;
  }

  .menu-info {
    padding: 0.875rem;
  }

  .menu-info h3 {
    font-size: 0.95rem;
  }

  .desc {
    font-size: 0.8rem;
    min-height: 32px;
  }

  .price {
    font-size: 1rem;
  }
}
</style>

<script setup>
import { ref, computed, onMounted } from "vue";
import api, { API_BASE } from "@/config/api";
import { useGlobal } from "@/composables";

const {
  getBranchId,
  addItem,
  items: basketItems,
  showInactiveMenuItems,
  showOutOfStockItems,
  stockWarnEnabled,
  stockWarnThreshold,
  fetchBranchSettings,
} = useGlobal();

const menu = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const branchId = getBranchId();

    // 1️⃣ Make sure settings are loaded (cached, so cheap after first call)
    await fetchBranchSettings(false);

    // 2️⃣ Then load menu
    const res = await api.get(`/menu`, {
      params: { branchId },
    });
    menu.value = res.data || [];
  } catch (err) {
    console.error("Menu load error:", err?.response?.data || err);
    window.$toast?.("Menü yüklenemedi", "error");
  } finally {
    loading.value = false;
  }
});

// ✅ Get current quantity of item in basket
const getItemQty = (itemId) => {
  const found = basketItems.value.find((i) => i.id === itemId);
  return found ? found.qty : 0;
};

// ✅ Add to basket with validation
const handleAddToBasket = (item) => {
  if (!item.available || item.stock <= 0) {
    window.$toast?.("Bu ürün stokta yok", "error");
    return;
  }

  const currentQty = getItemQty(item.id);
  if (currentQty >= item.stock) {
    window.$toast?.("Stok limiti aşıldı", "error");
    return;
  }

  addItem({
    id: item.id,
    name: item.name,
    price: item.price,
    photo: item.photo,
    stock: item.stock,
  });
};

// 🔎 Apply visibility rules from branch settings
const visibleMenu = computed(() => {
  return menu.value.filter((item) => {
    // hide inactive items if setting is off
    if (!showInactiveMenuItems.value && !item.available) return false;

    // hide out-of-stock if setting is off
    if (!showOutOfStockItems.value && item.stock <= 0) return false;

    return true;
  });
});

// ✅ Group by category with sortOrder support, using visibleMenu
const grouped = computed(() => {
  const map = new Map();

  visibleMenu.value.forEach((item) => {
    const catName = item.categoryName || "Diğer";
    const sortOrder =
      item.categorySortOrder !== null && item.categorySortOrder !== undefined
        ? item.categorySortOrder
        : 9999; // uncategorized go to the end

    if (!map.has(catName)) {
      map.set(catName, { name: catName, sortOrder, items: [] });
    }
    map.get(catName).items.push(item);
  });

  return Array.from(map.values()).sort((a, b) => {
    if (a.sortOrder === b.sortOrder) {
      return a.name.localeCompare(b.name, "tr-TR");
    }
    return a.sortOrder - b.sortOrder;
  });
});

const scrollTo = (categoryName) => {
  const el = document.getElementById(`cat-${categoryName}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
</script>
