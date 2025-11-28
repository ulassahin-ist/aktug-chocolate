<template>
  <div class="admin-menu">
    <div class="menu-header">
      <h2>Menü İçerikleri</h2>
      <button class="add-btn" @click="addNewItem">＋Ekle</button>
    </div>

    <div class="scroll-wrapper">
      <table class="menu-table">
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
          <tr v-for="item in items" :key="item.id">
            <td>
              <label class="upload-label">
                <img
                  :src="
                    item.photo
                      ? `${API_BASE}${item.photo}`
                      : '/menu-placeholder.png'
                  "
                  class="menu-photo"
                />
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
                v-if="editing.item === item && editing.field === 'name'"
                v-model="item.name"
                @blur="saveField(item)"
                @keyup.enter="handleEnter($event, item)"
              />
              <span v-else>{{ item.name }}</span>
            </td>

            <!-- Description -->
            <td @dblclick="editField(item, 'description')">
              <textarea
                v-if="editing.item === item && editing.field === 'description'"
                v-model="item.description"
                @blur="saveField(item)"
                @keyup.enter="handleEnter($event, item)"
              ></textarea>
              <span v-else>{{ item.description }}</span>
            </td>

            <!-- Category -->
            <td @dblclick="editField(item, 'categoryId')">
              <select
                v-if="editing.item === item && editing.field === 'categoryId'"
                v-model="item.categoryId"
                @blur="saveField(item)"
                @change="saveField(item)"
              >
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <span v-else>{{ getCategoryName(item.categoryId) }}</span>
            </td>

            <!-- Price -->
            <td @dblclick="editField(item, 'price')">
              <input
                v-if="editing.item === item && editing.field === 'price'"
                type="number"
                v-model.number="item.price"
                @blur="saveField(item)"
                @keyup.enter="handleEnter($event, item)"
              />
              <span v-else>{{ item.price }}</span>
            </td>

            <!-- Stock -->
            <td @dblclick="editField(item, 'stock')">
              <input
                v-if="editing.item === item && editing.field === 'stock'"
                type="number"
                v-model.number="item.stock"
                @blur="saveField(item)"
                @keyup.enter="handleEnter($event, item)"
              />
              <span v-else>{{ item.stock }}</span>
            </td>

            <!-- Available -->
            <td>
              <input
                type="checkbox"
                :checked="item.available == 1 || item.available === true"
                @change="
                  item.available = $event.target.checked ? 1 : 0;
                  updateItem(item);
                "
              />
            </td>

            <!-- Delete -->
            <td><button @click="deleteItem(item.id)">🗑️</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api, { API_BASE } from "@/config/api";

import { useGlobal } from "@/composables";

const { getBranchId } = useGlobal();

const items = ref([]);
const categories = ref([]);
const editing = ref({ item: null, field: null });

// 🔹 Fetch menu items + categories for current branch
const fetchItems = async () => {
  try {
    const branchId = getBranchId();

    const [menuRes, catRes] = await Promise.all([
      api.get("/menu", { params: { branchId } }),
      api.get("/categories", { params: { branchId } }),
    ]);

    items.value = menuRes.data.sort((a, b) => a.name.localeCompare(b.name));
    categories.value = catRes.data;
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

// ➕ Add new item
const addNewItem = async () => {
  try {
    const branchId = getBranchId();

    const res = await api.post(`/menu`, {
      branchId,
      name: "Yeni Ürün",
      description: "Açıklama",
      categoryId: null,
      price: 400,
      stock: 20,
      available: true,
    });

    items.value.unshift(res.data);
  } catch (err) {
    console.error("❌ Failed to add menu item:", err?.response?.data || err);
    window.$toast?.("Ürün eklenemedi", "error");
  }
};

// ✏ Start editing a field
const editField = (item, field) => {
  editing.value = { item, field };
};

//  Save full item after editing (name/price/etc.)
const saveField = async (item) => {
  try {
    editing.value = { item: null, field: null };
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

const handleEnter = (event, item) => {
  if (event.key === "Enter") event.target.blur();
};

// Optional helper if you use it in template (can reuse saveField)
const updateItem = async (item) => {
  try {
    const branchId = getBranchId();
    await api.post(`/menu`, {
      ...item,
      branchId,
    });
  } catch (err) {
    console.error("❌ Failed to update menu item:", err?.response?.data || err);
    window.$toast?.("Ürün güncellenemedi", "error");
  }
};

// 🗑 Delete item
const deleteItem = async (id) => {
  try {
    const branchId = getBranchId();

    await api.delete(`/menu/${id}`, {
      params: { branchId },
    });

    items.value = items.value.filter((i) => i.id !== id);
  } catch (err) {
    console.error("❌ Failed to delete menu item:", err?.response?.data || err);
    window.$toast?.("Ürün silinemedi", "error");
  }
};

// Image upload
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
  } catch (err) {
    console.error(
      "❌ Failed to upload menu image:",
      err?.response?.data || err
    );
    window.$toast?.("Görsel yüklenemedi", "error");
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
}
.menu-header h2 {
  font-size: 24px;
  color: var(--espresso);
}

/* Add button */
.add-btn {
  background: var(--gold);
  color: white;
  letter-spacing: 1.3px;
  font-size: 16px;
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(201, 162, 39, 0.35);
  transition: 0.2s;
}

.add-btn:hover {
  background: var(--gold2);
  box-shadow: 0 3px 8px rgba(164, 126, 59, 0.4);
}

/* Table */
.menu-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--cream);
  border-radius: 10px;
  border: 1px solid var(--gold2);
  box-shadow: 0 4px 12px rgba(62, 44, 39, 0.08);
}

.menu-table th,
.menu-table td {
  padding: 0.75rem;
  border-bottom: 1px solid var(--gold2);
  text-align: center;
  color: var(--espresso);
  background: white;
}
.menu-table td:nth-child(3) {
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.menu-table tr {
  cursor: pointer;
}
/* Table header */
.menu-table th {
  background: var(--espresso);
  color: var(--cream);
  border-bottom: 2px solid var(--gold2);
  font-weight: 600;
}

/* Inputs */
.menu-table input,
.menu-table textarea,
.menu-table select {
  border: 1px solid var(--gold2);
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  font-size: 0.95rem;
  min-width: 10px;
  background: var(--cream);
  color: var(--espresso);
}

.menu-table input:focus,
.menu-table textarea:focus,
.menu-table select:focus {
  border-color: var(--gold);
  box-shadow: 0 0 4px rgba(201, 162, 39, 0.4);
  outline: none;
}

/* Checkbox */
.menu-table input[type="checkbox"] {
  appearance: none;
  width: 24px;
  height: 24px;
  border: 2px solid var(--espresso);
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s;
  position: relative;
  background-color: var(--cream);
}

.menu-table input[type="checkbox"]:checked {
  background-color: var(--gold);
  border-color: var(--gold);
}

.menu-table input[type="checkbox"]:checked::after {
  content: "✓";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -55%);
  font-size: 1rem;
  color: white;
  font-weight: bold;
}

/* Image */
.menu-photo {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(62, 44, 39, 0.15);
}

/* Select dropdown arrow */
.menu-table select {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--espresso) 50%),
    linear-gradient(135deg, var(--espresso) 50%, transparent 50%);
  background-position: calc(100% - 20px) calc(1.1em + 2px),
    calc(100% - 15px) calc(1.1em + 2px);
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}

.menu-table select:hover {
  border-color: var(--gold);
}

.menu-table select:focus {
  border-color: var(--gold);
  box-shadow: 0 0 4px rgba(201, 162, 39, 0.4);
}

/* Delete button */
td button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--espresso);
  font-size: 1.1rem;
  transition: 0.2s;
}

td button:hover {
  color: var(--gold);
}

@media (max-width: 700px) {
  .menu-header h2 {
    font-size: 18px;
  }
  .add-btn {
    font-size: 14px;
    padding: 0.5rem 1rem;
    font-weight: 400;
  }
}
</style>
