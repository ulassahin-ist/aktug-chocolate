<template>
  <div class="menu-container">
    <header class="menu-header">
      <h1>MENU</h1>
      <p>L'amour dans chaque bouchée...</p>

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

    <div v-if="loading" class="loading">Yükleniyor...</div>

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
          </div>

          <div class="menu-info">
            <h3>{{ item.name }}</h3>
            <p class="desc">{{ item.description }}</p>

            <div class="price-row">
              <span class="price">{{ item.price }}₺</span>
              <span v-if="item.stock <= 3" class="low-stock">
                {{
                  item.stock > 0 ? "Son " + item.stock + " adet!" : "Tükendi"
                }}
              </span>
              <button
                class="add-btn"
                @click="handleAddToBasket(item)"
                :disabled="
                  item.stock <= 0 ||
                  !item.available ||
                  getItemQty(item.id) >= item.stock
                "
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api, { API_BASE } from "@/config/api";
import { useGlobal } from "@/composables";

const { getBranchId, addItem, items: basketItems } = useGlobal();

const menu = ref([]);
const loading = ref(true);

onMounted(async () => {
  try {
    const branchId = getBranchId();

    const res = await api.get(`/api/menu`, {
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

// ✅ Group by category with sortOrder support
const grouped = computed(() => {
  // Map: categoryName -> { name, sortOrder, items: [] }
  const map = new Map();

  menu.value.forEach((item) => {
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

  // Convert to array and sort by sortOrder, then name
  return Array.from(map.values()).sort((a, b) => {
    if (a.sortOrder === b.sortOrder) {
      return a.name.localeCompare(b.name, "tr-TR");
    }
    return a.sortOrder - b.sortOrder;
  });
});

// ✅ Smooth scroll to section
const scrollTo = (categoryName) => {
  const el = document.getElementById(`cat-${categoryName}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};
</script>

<style scoped>
.menu-container {
  padding: 2rem;
  font-family: "Poppins", sans-serif;
  background-color: var(--cream);
  color: var(--espresso);
  height: calc(100vh - var(--scroll-offset));
  overflow-y: auto;
}

.menu-header {
  text-align: center;
  margin-bottom: 1rem;
}

.menu-header h1 {
  font-size: 2.5rem;
  color: var(--espresso);
  letter-spacing: 1px;
}

.menu-header p {
  color: rgba(62, 44, 39, 0.7);
}

/* ✅ CATEGORY SCROLL */
.category-scroll {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin-top: 1rem;
  padding-bottom: 0.5rem;
  white-space: nowrap;
  scrollbar-width: none;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.cat-btn {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1px solid var(--gold2);
  background: white;
  cursor: pointer;
  font-size: 0.9rem;
  transition: 0.2s;
  color: var(--espresso);
}

.cat-btn:hover {
  background: var(--gold);
  color: white;
}

/* ✅ CATEGORY SECTION TITLE */
.category-title {
  font-size: 1.6rem;
  margin: 1.5rem 0 0.5rem;
  color: var(--espresso);
  border-bottom: 2px solid var(--gold2);
  display: inline-block;
  padding-bottom: 4px;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.menu-card {
  background: var(--cream);
  border-radius: 16px;
  box-shadow: 0 5px 15px rgba(62, 44, 39, 0.12);
  overflow: hidden;
  transition: transform 0.2s ease;
}

.menu-card.disabled {
  opacity: 0.45;
  pointer-events: none;
  filter: grayscale(100%);
}

.menu-card:hover {
  transform: translateY(-5px);
}

/* Low stock badge */
.low-stock {
  display: inline-block;
  background: var(--gold);
  color: var(--espresso);
  padding: 2px 6px;
  font-size: 0.75rem;
  border-radius: 6px;
  margin-top: 6px;
}

/* Image */
.img-wrap {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.menu-card:hover img {
  transform: scale(1.05);
}

.menu-info {
  padding: 1rem;
}

.desc {
  font-size: 0.9rem;
  color: rgba(62, 44, 39, 0.7);
  min-height: 40px;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
}

.price {
  font-weight: bold;
  font-size: 1.1rem;
  color: var(--espresso);
}

/* Add button */
.add-btn {
  background-color: var(--gold);
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  cursor: pointer;
  font-size: 1.2rem;
  box-shadow: 0 2px 6px rgba(201, 162, 39, 0.4);
}

.add-btn:hover:not(:disabled) {
  background-color: white;
  color: var(--gold2);
  border: 1px solid var(--gold2);
  box-shadow: 0 3px 8px rgba(164, 126, 59, 0.45);
}

.add-btn:active {
  transform: scale(1.15);
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  box-shadow: none;
}
@media (max-width: 700px) {
  .menu-container {
    padding-bottom: 70px;
  }
}
</style>
