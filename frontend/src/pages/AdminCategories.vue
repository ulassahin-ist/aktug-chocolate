<template>
  <div class="admin-menu">
    <div class="menu-header">
      <div class="menu-header-left">
        <h2>Kategoriler</h2>
        <span class="menu-count" v-if="categories.length">
          ({{ categories.length }} kategori)
        </span>
        <span
          v-if="uncategorizedCount > 0"
          class="uncategorized-pill"
          title="Bu ürünlerin kategorisi yok, menü düzeninde görünmeyebilir."
        >
          {{ uncategorizedCount }} ürün kategorisiz
        </span>
      </div>

      <div class="menu-header-right">
        <input
          v-model="search"
          type="text"
          class="search-input"
          placeholder="Kategori ara..."
        />

        <button class="btn-secondary" @click="addNewCategory">＋ Ekle</button>
      </div>
    </div>

    <div class="scroll-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>İsim</th>
            <th>Tanımlı Ürün</th>
            <th>Sil</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="cat in filteredCategories" :key="cat.id">
            <!-- Name -->
            <td @dblclick="startEdit(cat)">
              <input
                v-if="isEditing(cat)"
                v-model="cat.name"
                class="inline-input"
                @blur="saveCategory(cat)"
                @keyup.enter="handleEnter($event)"
              />
              <span v-else class="cell-text">
                {{ cat.name }}
              </span>
            </td>

            <!-- Item count -->
            <td>
              <span
                class="count-pill"
                :class="{ 'count-pill-zero': !cat.itemCount }"
              >
                {{ cat.itemCount || 0 }}
              </span>
            </td>

            <!-- Delete -->
            <td class="actions-cell">
              <button
                class="icon-btn danger"
                type="button"
                :disabled="cat.itemCount > 0"
                :title="
                  cat.itemCount > 0
                    ? 'Bu kategoriye bağlı ürünler var, silemezsiniz.'
                    : 'Sil'
                "
                @click="deleteCategory(cat)"
              >
                <Icons name="trash" :size="18" />
              </button>
            </td>
          </tr>

          <tr v-if="filteredCategories.length === 0">
            <td colspan="3" class="empty-row">
              Filtreye uygun kategori bulunamadı.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from "vue";
import api from "@/config/api";
import Icons from "@/components/Icons.vue";
import { useGlobal } from "@/composables";

const { getBranchId } = useGlobal();

const categories = ref([]);
const editingId = ref(null);
const search = ref("");
const uncategorizedCount = ref(0);

// 🔹 Fetch all categories (for current branch)
const fetchCategories = async () => {
  try {
    const branchId = getBranchId();
    const res = await api.get(`/categories`, {
      params: { branchId },
    });

    categories.value = (res.data || []).slice().sort((a, b) => {
      const soA = a.sortOrder ?? 9999;
      const soB = b.sortOrder ?? 9999;
      if (soA !== soB) return soA - soB;
      return a.name.localeCompare(b.name, "tr-TR");
    });
  } catch (err) {
    console.error("❌ Failed to load categories:", err?.response?.data || err);
    window.$toast?.("Kategoriler yüklenemedi", "error");
  }
};
const fetchUncategorizedCount = async () => {
  try {
    const branchId = getBranchId();
    const res = await api.get("/categories/uncategorized-count", {
      params: { branchId },
    });

    uncategorizedCount.value = res.data.count || 0;
  } catch (err) {
    console.error("Failed to load uncategorized count:", err);
  }
};

// 🔍 Filtered list
const filteredCategories = computed(() => {
  if (!search.value.trim()) return categories.value;

  const q = search.value.toLowerCase();
  return categories.value.filter((c) =>
    (c.name || "").toLowerCase().includes(q)
  );
});

// ➕ Add new category
const addNewCategory = async () => {
  try {
    const branchId = getBranchId();

    // Generate a unique placeholder name
    const baseName = "Yeni Kategori";
    let name = baseName;
    let counter = 1;

    while (categories.value.some((c) => c.name === name)) {
      name = `${baseName} (${counter++})`;
    }

    const res = await api.post(`/categories`, {
      name,
      branchId,
    });

    const newCat = res.data;
    categories.value.push(newCat);

    await nextTick();
    editingId.value = newCat.id;
  } catch (err) {
    if (err.response?.status === 409) {
      alert("Bu isimde bir kategori zaten var.");
    } else {
      console.error("❌ Failed to add category:", err?.response?.data || err);
      window.$toast?.("Kategori eklenemedi", "error");
    }
  }
};

const startEdit = (cat) => {
  editingId.value = cat.id;
};

const isEditing = (cat) => editingId.value === cat.id;

// 💾 Save category (update)
const saveCategory = async (cat) => {
  try {
    editingId.value = null;
    const branchId = getBranchId();

    await api.post(`/categories`, {
      id: cat.id,
      name: cat.name,
      branchId,
    });

    // local list already reactive; we just ensure name is set
    const idx = categories.value.findIndex((c) => c.id === cat.id);
    if (idx !== -1) {
      categories.value[idx].name = cat.name;
    }
  } catch (err) {
    console.error("❌ Failed to save category:", err?.response?.data || err);
    window.$toast?.("Kategori güncellenemedi", "error");
  }
};

const handleEnter = (event) => {
  if (event.key === "Enter") event.target.blur();
};

// 🗑 Delete category
const deleteCategory = async (cat) => {
  if (cat.itemCount > 0) return; // extra safety

  try {
    const branchId = getBranchId();

    await api.delete(`/categories/${cat.id}`, {
      params: { branchId },
    });

    categories.value = categories.value.filter((c) => c.id !== cat.id);
  } catch (err) {
    console.error("❌ Failed to delete category:", err?.response?.data || err);
    const msg =
      err.response?.data?.error || "Kategori silinemedi. Ürün bağlı olabilir.";
    window.$toast?.(msg, "error");
  }
};

onMounted(async () => {
  await fetchCategories();
  await fetchUncategorizedCount();
});
</script>

<style scoped>
.admin-menu {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  background: var(--cream-light);
  color: var(--espresso);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
  padding-top: 2px;
}

.menu-header-left {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.menu-header h2 {
  font-size: 24px;
  color: var(--espresso);
}

.menu-count {
  font-size: 0.9rem;
  color: rgba(62, 44, 39, 0.7);
}
.uncategorized-pill {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(231, 76, 60, 0.08);
  color: #c0392b;
  border: 1px solid rgba(192, 57, 43, 0.4);
  margin-left: 0.4rem;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.menu-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Search input same style as menu page */
.search-input {
  min-width: 180px;
  max-width: 260px;
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(164, 126, 59, 0.5);
  background: #fff;
  font-size: 0.9rem;
  outline: none;
  color: var(--espresso);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(201, 162, 39, 0.18);
}

/* Scroll wrapper (for consistency with other admin tables) */
.scroll-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* Inline edit styling */
.inline-input {
  width: 100%;
  font-size: 0.9rem;
  font-family: inherit;
  border-radius: 6px;
  border: 1px solid rgba(164, 126, 59, 0.6);
  padding: 4px 6px;
  outline: none;
  background: #fff;
  color: var(--espresso);
  box-shadow: 0 0 0 1px transparent;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.inline-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(201, 162, 39, 0.18);
}

/* Cell text truncation */
.cell-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Count pill */
.count-pill {
  display: inline-flex;
  min-width: 32px;
  padding: 2px 10px;
  justify-content: center;
  align-items: center;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(164, 126, 59, 0.12);
  color: var(--espresso);
}

.count-pill-zero {
  background: rgba(0, 0, 0, 0.03);
  color: rgba(62, 44, 39, 0.6);
}

/* Actions */
.actions-cell {
  text-align: center;
}

.icon-btn {
  border: none;
  background: transparent;
  padding: 4px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease, transform 0.12s ease, opacity 0.12s ease;
}

.icon-btn:hover:not(:disabled) {
  background: rgba(231, 76, 60, 0.08);
  transform: translateY(-1px);
}

.icon-btn.danger {
  color: #e74c3c;
}

.icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Empty row */
.empty-row {
  text-align: center;
  padding: 1.2rem;
  color: rgba(62, 44, 39, 0.7);
}

/* Mobile */
@media (max-width: 700px) {
  .menu-header {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }

  .menu-header h2 {
    font-size: 18px;
  }

  .menu-count {
    font-size: 0.8rem;
  }

  .menu-header-right {
    justify-content: space-between;
    gap: 0.5rem;
  }

  .search-input {
    min-width: 0;
    width: 100%;
  }
}
</style>
