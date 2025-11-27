<template>
  <div class="admin-menu">
    <div class="menu-header">
      <h2>Categories</h2>
      <button class="add-btn" @click="addNewCategory">＋ Add Category</button>
    </div>

    <table class="menu-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Item Count</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="cat in categories" :key="cat.id">
          <td @dblclick="editField(cat)">
            <input
              v-if="editing === cat"
              v-model="cat.name"
              @blur="saveCategory(cat)"
              @keyup.enter="handleEnter($event, cat)"
            />
            <span v-else>{{ cat.name }}</span>
          </td>
          <td>{{ cat.itemCount ? cat.itemCount : "0" }}</td>
          <td>
            <button
              :disabled="cat.itemCount > 0"
              @click="deleteCategory(cat.id)"
              :title="
                cat.itemCount > 0 ? 'Cannot delete: category in use' : 'Delete'
              "
            >
              🗑️
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "@/config/api";

import { useGlobal } from "@/composables";

const { getBranchId } = useGlobal();

const categories = ref([]);
const editing = ref(null);

// 🔹 Fetch all categories (for current branch)
const fetchCategories = async () => {
  try {
    const branchId = getBranchId();
    const res = await api.get(`/categories`, {
      params: { branchId },
    });
    categories.value = res.data;
  } catch (err) {
    console.error("❌ Failed to load categories:", err?.response?.data || err);
    window.$toast?.("Kategoriler yüklenemedi", "error");
  }
};

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

    // Send to backend (branch-aware)
    const res = await api.post(`/categories`, {
      name,
      branchId,
    });

    categories.value.push(res.data);
  } catch (err) {
    if (err.response?.status === 409) {
      alert("Bu isimde bir kategori zaten var.");
    } else {
      console.error("❌ Failed to add category:", err?.response?.data || err);
      window.$toast?.("Kategori eklenemedi", "error");
    }
  }
};

const editField = (cat) => {
  editing.value = cat;
};

// Save category (update)
const saveCategory = async (cat) => {
  try {
    editing.value = null;
    const branchId = getBranchId();

    await api.post(`/categories`, {
      id: cat.id,
      name: cat.name,
      branchId,
    });

    // Update local list
    const idx = categories.value.findIndex((c) => c.id === cat.id);
    if (idx !== -1) {
      categories.value[idx].name = cat.name;
    }
  } catch (err) {
    console.error("❌ Failed to save category:", err?.response?.data || err);
    window.$toast?.("Kategori güncellenemedi", "error");
  }
};

// Handle Enter key to blur input (trigger @blur -> saveCategory)
const handleEnter = (event, cat) => {
  if (event.key === "Enter") event.target.blur();
};

// 🗑 Delete category
const deleteCategory = async (id) => {
  try {
    const branchId = getBranchId();

    await api.delete(`/categories/${id}`, {
      params: { branchId },
    });

    categories.value = categories.value.filter((c) => c.id !== id);
  } catch (err) {
    console.error("❌ Failed to delete category:", err?.response?.data || err);
    const msg =
      err.response?.data?.error || "Kategori silinemedi. Ürün bağlı olabilir.";
    window.$toast?.(msg, "error");
  }
};

onMounted(fetchCategories);
</script>

<style scoped>
.admin-menu {
  width: 100%;
  overflow-x: auto;
  background: var(--cream-light);
  color: var(--espresso);
}

.menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}
.menu-header h2 {
  font-size: 24px;
  color: var(--espresso);
}
/* Add button */
.add-btn {
  background: var(--gold);
  color: var(--cream);
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
  box-shadow: 0 2px 6px rgba(201, 162, 39, 0.35);
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
  border-bottom: 1px solid var(--highlight);
  text-align: center;
  color: var(--espresso);
  background: white;
}

.menu-table th {
  background: var(--espresso);
  color: var(--cream);
  font-weight: 600;
}

/* Inputs */
.menu-table input {
  border: 1px solid var(--gold2);
  padding: 0.25rem 0.4rem;
  border-radius: 4px;
  font-size: 0.95rem;
  background: var(--cream);
  color: var(--espresso);
}

.menu-table input:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 4px rgba(201, 162, 39, 0.4);
}

/* Delete button */
td button {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--espresso);
  transition: 0.2s;
}

td button:hover:not(:disabled) {
  color: var(--gold);
}

td button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
