<template>
  <div class="admin-settings">
    <div class="scroll-wrapper">
      <!-- 🔹 Branch Selector -->
      <div class="setting-card">
        <h3>Seçili Şube</h3>
        <p class="description">Diğer Şubeleri yönetmek için şube seçin.</p>

        <div class="branch-selector">
          <select v-model="selectedBranchId" @change="changeBranch">
            <option
              v-for="branch in branches"
              :key="branch.id"
              :value="branch.id"
            >
              {{ branch.name }} ({{ branch.code }})
            </option>
          </select>
        </div>

        <div v-if="currentBranch" class="branch-info">
          <p><strong>Ülke:</strong> {{ currentBranch.country }}</p>
          <p><strong>Para Birimi:</strong> {{ currentBranch.currency }}</p>
          <p><strong>Zaman Dilimi:</strong> {{ currentBranch.timezone }}</p>
        </div>
      </div>

      <!-- 🔹 Category Order -->
      <div class="setting-card">
        <div class="category-order">
          <div>
            <h3>Kategori Sıralaması</h3>
            <p class="description">
              Kategorileri sürükleyip bırakarak yeniden sıralayın ve ardından
              kaydedin.
            </p>
          </div>
          <div>
            <button
              class="save-btn"
              @click="saveCategoryOrder"
              :disabled="!orderChanged || saving"
            >
              {{ saving ? "Kaydediliyor..." : "Kaydet" }}
            </button>
          </div>
        </div>

        <div v-if="loadingCategories" class="loading">
          Loading categories...
        </div>

        <div v-else class="category-list">
          <div
            v-for="(cat, index) in categories"
            :key="cat.id"
            class="category-item"
            draggable="true"
            @dragstart="dragStart(index)"
            @dragover.prevent
            @drop="drop(index)"
          >
            <span class="drag-handle"><Icons name="menu" /></span>
            <span class="category-name">{{ cat.name }}</span>
            <span class="item-count">{{ cat.itemCount || 0 }} ürün</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import api from "@/config/api";
import { useGlobal } from "@/composables";

const { setBranch, getBranchId } = useGlobal();

// local state for this component
const branches = ref([]);
const selectedBranchId = ref(null);
const categories = ref([]);
const originalOrder = ref([]);
const loadingCategories = ref(false);
const saving = ref(false);
const draggedIndex = ref(null);

// Get current branch info
const currentBranch = computed(() =>
  branches.value.find((b) => b.id === selectedBranchId.value)
);

// Check if category order has changed
const orderChanged = computed(() => {
  if (categories.value.length !== originalOrder.value.length) return false;
  return !categories.value.every(
    (cat, idx) => cat.id === originalOrder.value[idx].id
  );
});

// 🔹 Fetch all branches
const fetchBranches = async () => {
  try {
    const res = await api.get(`/branches`);
    branches.value = res.data;

    // use current branch from composable, fallback to first branch
    selectedBranchId.value = getBranchId() || branches.value[0]?.id || null;
  } catch (err) {
    console.error("❌ Failed to load branches:", err?.response?.data || err);
    window.$toast?.("Branches yüklenemedi", "error");
  }
};

// 🔹 Fetch categories for current branch
const fetchCategories = async () => {
  try {
    loadingCategories.value = true;

    const current = selectedBranchId.value || getBranchId();

    const res = await api.get(`/categories`, {
      params: { branchId: current },
    });

    categories.value = res.data;
    originalOrder.value = JSON.parse(JSON.stringify(res.data));
  } catch (err) {
    console.error("❌ Failed to load categories:", err?.response?.data || err);
    window.$toast?.("Kategoriler yüklenemedi", "error");
  } finally {
    loadingCategories.value = false;
  }
};

// 🔹 Change active branch
const changeBranch = async () => {
  // update global branch via composable
  if (selectedBranchId.value) {
    setBranch(selectedBranchId.value);
  }
  window.$toast?.("Branch değiştirildi!", "success");

  await fetchCategories();
};

// 🔹 Drag & Drop handlers
const dragStart = (index) => {
  draggedIndex.value = index;
};

const drop = (dropIndex) => {
  if (draggedIndex.value === null) return;

  const draggedItem = categories.value[draggedIndex.value];
  categories.value.splice(draggedIndex.value, 1);
  categories.value.splice(dropIndex, 0, draggedItem);

  draggedIndex.value = null;
};

const saveCategoryOrder = async () => {
  try {
    saving.value = true;

    const current = selectedBranchId.value || getBranchId();
    const order = categories.value.map((cat) => cat.id);

    await api.post(`/categories/reorder`, {
      order,
      branchId: current,
    });

    window.$toast?.("Kategori sırası kaydedildi!", "success");
    originalOrder.value = JSON.parse(JSON.stringify(categories.value));
  } catch (err) {
    console.error(
      "❌ Failed to save category order:",
      err?.response?.data || err
    );
    window.$toast?.("Sıra kaydedilemedi", "error");
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await fetchBranches();
  await fetchCategories();
});
</script>

<style scoped>
.admin-settings {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 1rem;
  height: 100%;
  background: var(--cream-light);
  color: var(--espresso);
}

.setting-card {
  border: 1px solid var(--gold2);
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
}

.setting-card h3 {
  margin-bottom: 0.5rem;
  color: var(--espresso);
}

.description {
  color: rgba(62, 44, 39, 0.7);
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

/* Branch Selector */
.branch-selector {
  margin: 1rem 0;
}

.branch-selector select {
  width: 100%;
  max-width: 400px;
  padding: 0.75rem;
  border: 1px solid var(--gold2);
  background: var(--cream);
  color: var(--espresso);
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.branch-selector select:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(201, 162, 39, 0.15);
}

.branch-info {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--beige);
  color: var(--espresso);
  border-radius: 8px;
}

.branch-info p {
  margin: 0.5rem 0;
  color: #5a4038;
}

/* Category List */
.loading {
  text-align: center;
  padding: 2rem;
  color: rgba(62, 44, 39, 0.7);
}
.category-order {
  display: flex;
  justify-content: space-between;
  align-items: first baseline;
}
.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
  max-height: 400px;
  overflow-y: auto;
  position: relative;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--cream);
  border: 1px solid var(--highlight);
  border-radius: 8px;
  cursor: move;
  transition: all 0.2s;
  max-width: 96%;
}

.category-item:hover {
  background: #ffffff;
  border-color: var(--gold2);
  box-shadow: 0 2px 6px rgba(62, 44, 39, 0.08);
}

.drag-handle {
  font-size: 1.2rem;
  color: var(--gold2);
  cursor: grab;
}

.category-item:active .drag-handle {
  cursor: grabbing;
}

.category-name {
  flex: 1;
  font-weight: 600;
  color: var(--espresso);
}

.item-count {
  color: var(--gold);
  font-size: 0.9rem;
}

.save-btn {
  background: var(--gold);
  color: white;
  letter-spacing: 1.3px;
  font-size: 16px;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(201, 162, 39, 0.35);
  transition: 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: var(--gold2);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--highlight);
  border-color: var(--highlight);
}

/* Scrollbar styling */
.category-list::-webkit-scrollbar {
  width: 8px;
}

.category-list::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

.category-list::-webkit-scrollbar-thumb:hover {
  background: #aaa;
}

@media (max-width: 700px) {
  .admin-settings {
    padding: 2px;
  }
  .save-btn {
    font-size: 14px;
    padding: 0.5rem 1rem;
    font-weight: 400;
  }
}
</style>
