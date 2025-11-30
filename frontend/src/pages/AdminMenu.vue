<template>
  <div class="admin-menu">
    <div class="menu-header">
      <div class="menu-header-left">
        <h2>Menü İçerikleri</h2>
        <span class="menu-count" v-if="items.length">
          ({{ items.length }} ürün)
        </span>
      </div>

      <div class="menu-header-right">
        <!-- 🔍 Search & Category Filter -->
        <div class="filters">
          <input
            v-model="search"
            type="text"
            class="search-input"
            placeholder="Ürün veya açıklama ara..."
          />

          <select v-model="categoryFilter" class="filter-select">
            <option value="all">Tüm Kategoriler</option>
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="String(cat.id)"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>

        <button class="btn-secondary" @click="addNewItem">＋ Ekle</button>
      </div>
    </div>

    <div class="scroll-wrapper">
      <table class="data-table">
        <thead>
          <tr>
            <th>Görsel</th>
            <th>İsim</th>
            <th>Açıklama</th>
            <th>Kategori</th>
            <th>Fiyat</th>
            <th>Stok</th>
            <th>Aktif</th>
            <th>Sil</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="item in filteredItems" :key="item.id">
            <!-- Image -->
            <td>
              <label class="upload-label">
                <img
                  :src="
                    item.photo
                      ? `${API_BASE}${item.photo}`
                      : '/menu-placeholder.png'
                  "
                  class="menu-photo"
                  :alt="item.name"
                />
                <div class="upload-overlay">Değiştir</div>
                <input
                  type="file"
                  accept="image/*"
                  @change="onImageChange($event, item)"
                  hidden
                />
              </label>
            </td>

            <!-- Name -->
            <td @dblclick="editField(item, 'name')">
              <input
                v-if="isEditing(item, 'name')"
                v-model="item.name"
                class="inline-input"
                @blur="saveField(item)"
                @keyup.enter="handleEnter($event, item)"
              />
              <span v-else class="cell-text">
                {{ item.name || "—" }}
              </span>
            </td>

            <!-- Description -->
            <td class="desc-cell" @dblclick="editField(item, 'description')">
              <textarea
                v-if="isEditing(item, 'description')"
                v-model="item.description"
                class="inline-textarea"
                @blur="saveField(item)"
                @keyup.enter.exact="handleEnter($event, item)"
              ></textarea>
              <span
                v-else
                class="cell-text desc-text"
                :title="item.description || ''"
              >
                {{ item.description || "—" }}
              </span>
            </td>

            <!-- Category -->
            <td @dblclick="editField(item, 'categoryId')">
              <select
                v-if="isEditing(item, 'categoryId')"
                v-model="item.categoryId"
                class="inline-select"
                @blur="saveField(item)"
                @change="saveField(item)"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <span v-else class="cell-text">
                {{ getCategoryName(item.categoryId) }}
              </span>
            </td>

            <!-- Price -->
            <td class="numeric-cell" @dblclick="editField(item, 'price')">
              <input
                v-if="isEditing(item, 'price')"
                type="number"
                step="0.01"
                v-model.number="item.price"
                class="inline-input numeric"
                @blur="saveField(item)"
                @keyup.enter="handleEnter($event, item)"
              />
              <span v-else class="cell-text">
                {{ item.price != null ? Number(item.price).toFixed(2) : "—" }}
              </span>
            </td>

            <!-- Stock -->
            <td class="numeric-cell" @dblclick="editField(item, 'stock')">
              <input
                v-if="isEditing(item, 'stock')"
                type="number"
                min="0"
                step="1"
                v-model.number="item.stock"
                class="inline-input numeric"
                @blur="saveField(item)"
                @keyup.enter="handleEnter($event, item)"
              />
              <span v-else class="cell-text">
                {{ item.stock ?? 0 }}
              </span>
            </td>

            <!-- Available toggle -->
            <td class="available-cell">
              <label class="toggle-wrapper">
                <input
                  type="checkbox"
                  :checked="item.available == 1 || item.available === true"
                  @change="
                    item.available = $event.target.checked ? 1 : 0;
                    saveItem(item);
                  "
                />
                <span class="toggle-slider"></span>
              </label>
            </td>

            <!-- Delete -->
            <td class="actions-cell">
              <button
                class="icon-btn danger"
                type="button"
                @click="deleteItem(item.id)"
              >
                <Icons name="trash" :size="18" />
              </button>
            </td>
          </tr>

          <tr v-if="filteredItems.length === 0">
            <td colspan="8" class="empty-row">
              Filtreye uygun ürün bulunamadı.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from "vue";
import api, { API_BASE } from "@/config/api";
import { useGlobal } from "@/composables";
import Icons from "@/components/Icons.vue";

const { getBranchId } = useGlobal();

const items = ref([]);
const categories = ref([]);
const editing = ref({ item: null, field: null });

const search = ref("");
const categoryFilter = ref("all");

// ✅ helper to know if a cell is being edited
const isEditing = (item, field) =>
  editing.value.item === item && editing.value.field === field;

// ✅ filtered list (fix: cast categoryFilter to Number)
const filteredItems = computed(() => {
  let list = items.value || [];

  if (categoryFilter.value !== "all") {
    const selectedId = Number(categoryFilter.value);
    list = list.filter((i) => Number(i.categoryId) === selectedId);
  }

  if (search.value.trim()) {
    const q = search.value.toLowerCase();
    list = list.filter((i) => {
      const name = (i.name || "").toLowerCase();
      const desc = (i.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }

  return list;
});

// 🔄 clear editing state when filters change to avoid weird focus after clearing
watch([categoryFilter, search], () => {
  editing.value = { item: null, field: null };
});

// Fetch menu items + categories
const fetchItems = async () => {
  try {
    const branchId = getBranchId();

    const [menuRes, catRes] = await Promise.all([
      api.get("/menu", { params: { branchId } }),
      api.get("/categories", { params: { branchId } }),
    ]);

    items.value = (menuRes.data || []).sort((a, b) =>
      a.name.localeCompare(b.name, "tr-TR")
    );
    categories.value = catRes.data || [];
  } catch (err) {
    console.error(
      "❌ Failed to fetch admin menu data:",
      err?.response?.data || err
    );
    window.$toast?.("Menü verileri yüklenemedi", "error");
  }
};

const getCategoryName = (id) => {
  const cat = categories.value.find((c) => c.id === id);
  return cat ? cat.name : "Kategorisiz";
};

// ➕ Add new item (respects current category filter)
const addNewItem = async () => {
  try {
    const branchId = getBranchId();

    let categoryId = null;
    if (categoryFilter.value !== "all") {
      categoryId = Number(categoryFilter.value);
    } else if (categories.value.length) {
      categoryId = categories.value[0].id;
    }

    const res = await api.post(`/menu`, {
      branchId,
      name: "Yeni Ürün",
      description: "Açıklama",
      categoryId,
      price: 400,
      stock: 20,
      available: true,
    });

    const newItem = res.data;
    items.value.unshift(newItem);

    await nextTick();

    // Only auto-focus when all categories are visible
    if (categoryFilter.value === "all") {
      editField(newItem, "name");
    }
  } catch (err) {
    console.error("❌ Failed to add menu item:", err?.response?.data || err);
    window.$toast?.("Ürün eklenemedi", "error");
  }
};

const editField = (item, field) => {
  editing.value = { item, field };
};

const saveItem = async (item) => {
  try {
    const branchId = getBranchId();

    await api.post(`/menu`, {
      ...item,
      branchId,
    });
  } catch (err) {
    console.error("❌ Failed to save menu item:", err?.response?.data || err);
    window.$toast?.("Ürün güncellenemedi", "error");
  }
};

const saveField = async (item) => {
  editing.value = { item: null, field: null };
  await saveItem(item);
};

const handleEnter = (event, item) => {
  if (event.key === "Enter") event.target.blur();
};

const deleteItem = async (id) => {
  try {
    const branchId = getBranchId();

    await api.delete(`/menu/${id}`, {
      params: { branchId },
    });

    items.value = items.value.filter((i) => i.id !== id);
    window.$toast?.("Ürün silindi", "success");
  } catch (err) {
    console.error("❌ Failed to delete menu item:", err?.response?.data || err);
    window.$toast?.("Ürün silinemedi", "error");
  }
};

const onImageChange = async (event, item) => {
  try {
    const file = event.target.files[0];
    if (!file) return;

    const branchId = getBranchId();
    const formData = new FormData();
    formData.append("photo", file);

    const res = await api.post(`/menu/${item.id}/photo`, formData, {
      params: { branchId },
      headers: { "Content-Type": "multipart/form-data" },
    });

    item.photo = res.data.photo + `?v=${Date.now()}`;
    window.$toast?.("Görsel güncellendi", "success");
  } catch (err) {
    console.error(
      "❌ Failed to upload menu image:",
      err?.response?.data || err
    );
    window.$toast?.("Görsel yüklenemedi", "error");
  } finally {
    event.target.value = "";
  }
};

onMounted(fetchItems);
</script>

<style scoped>
.admin-menu {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--cream-light);
  color: var(--espresso);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 1rem;
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

.menu-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Filters */
.filters {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

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

.filter-select {
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(164, 126, 59, 0.5);
  background: #fff;
  font-size: 0.9rem;
  outline: none;
  color: var(--espresso);
}

/* Scroll wrapper */
.scroll-wrapper {
  width: 100%;
  overflow-x: auto;
}

/* Description cell truncation */
.data-table td:nth-child(3) {
  max-width: 220px;
}

/* Shared cell text styling */
.cell-text {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.desc-cell {
  max-width: 260px;
}

.desc-text {
  display: inline-block;
}

/* Image upload styling */
.upload-label {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

.menu-photo {
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(62, 44, 39, 0.15);
  display: block;
}

.upload-overlay {
  position: absolute;
  inset: 0;
  border-radius: 6px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.05));
  color: #fff;
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  opacity: 0;
  padding-bottom: 3px;
  transition: opacity 0.18s ease;
}

.upload-label:hover .upload-overlay {
  opacity: 1;
}

/* Inline edit inputs */
.inline-input,
.inline-textarea,
.inline-select {
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

.inline-input:focus,
.inline-textarea:focus,
.inline-select:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(201, 162, 39, 0.18);
}

.inline-textarea {
  min-height: 52px;
  resize: vertical;
}

.inline-input.numeric {
  text-align: right;
}

.numeric-cell {
  text-align: right;
}

/* Toggle switch for Available */
.available-cell {
  text-align: center;
}

.toggle-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  width: 38px;
  height: 20px;
}

.toggle-wrapper input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: rgba(62, 44, 39, 0.25);
  border-radius: 999px;
  transition: 0.2s;
}

.toggle-slider::before {
  content: "";
  position: absolute;
  height: 14px;
  width: 14px;
  left: 3px;
  top: 3px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: 0.2s;
}

.toggle-wrapper input:checked + .toggle-slider {
  background: var(--gold2);
}

.toggle-wrapper input:checked + .toggle-slider::before {
  transform: translateX(16px);
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
  transition: background 0.15s ease, transform 0.12s ease;
}

.icon-btn:hover {
  background: rgba(231, 76, 60, 0.08);
  transform: translateY(-1px);
}

.icon-btn.danger {
  color: #e74c3c;
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

  .menu-header-right {
    justify-content: space-between;
    gap: 0.5rem;
  }

  .filters {
    flex: 1;
  }

  .search-input {
    min-width: 0;
    width: 100%;
  }

  .menu-header h2 {
    font-size: 18px;
  }

  .menu-count {
    font-size: 0.8rem;
  }

  .menu-photo {
    width: 36px;
    height: 36px;
  }

  .data-table td:nth-child(3),
  .desc-cell {
    max-width: 180px;
  }
}
</style>
