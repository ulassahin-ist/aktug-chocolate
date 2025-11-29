<template>
  <div class="admin-settings">
    <div class="scroll-wrapper">
      <!-- Branch Selector Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Şube Yönetimi</h3>
            <p class="card-description">Yönetmek istediğiniz şubeyi seçin</p>
          </div>
          <div class="badge badge-primary">{{ branches.length }} Şube</div>
        </div>

        <div class="card-body">
          <div class="form-group">
            <label class="form-label">
              <span class="label-icon">🏢</span>
              Aktif Şube
            </label>
            <select
              v-model="selectedBranchId"
              @change="changeBranch"
              class="form-select"
            >
              <option
                v-for="branch in branches"
                :key="branch.id"
                :value="branch.id"
              >
                {{ branch.name }} ({{ branch.code }})
              </option>
            </select>
          </div>

          <div v-if="currentBranch" class="branch-info-grid">
            <div class="info-item">
              <div class="info-icon">🌍</div>
              <div class="info-content">
                <span class="info-label">Ülke</span>
                <span class="info-value">{{ currentBranch.country }}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">💵</div>
              <div class="info-content">
                <span class="info-label">Para Birimi</span>
                <span class="info-value">{{ currentBranch.currency }}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="info-icon">🕐</div>
              <div class="info-content">
                <span class="info-label">Zaman Dilimi</span>
                <span class="info-value">{{ currentBranch.timezone }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Order Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3 class="card-title">Kategori Sıralaması</h3>
            <p class="card-description">
              Kategorileri sürükleyip bırakarak yeniden sıralayın
            </p>
          </div>
          <button
            class="btn-secondary btn-sm"
            @click="saveCategoryOrder"
            :disabled="!orderChanged || saving"
          >
            {{ saving ? "Kaydediliyor..." : "Kaydet" }}
          </button>
        </div>

        <div class="card-body">
          <div v-if="loadingCategories" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Kategoriler yükleniyor...</p>
          </div>

          <div v-else-if="categories.length === 0" class="empty-state">
            <div class="empty-icon">📂</div>
            <h3>Kategori Bulunamadı</h3>
            <p>Bu şube için henüz kategori tanımlanmamış.</p>
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
              @dragenter="dragEnter(index)"
              @dragleave="dragLeave"
            >
              <div class="drag-handle">
                <Icons name="menu" :size="20" color="var(--gold2)" />
              </div>
              <div class="category-content">
                <span class="category-name">{{ cat.name }}</span>
                <span class="badge badge-info">
                  {{ cat.itemCount || 0 }} ürün
                </span>
              </div>
              <div class="category-order">{{ index + 1 }}</div>
            </div>
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

const branches = ref([]);
const selectedBranchId = ref(null);
const categories = ref([]);
const originalOrder = ref([]);
const loadingCategories = ref(false);
const saving = ref(false);
const draggedIndex = ref(null);
const dragOverIndex = ref(null);

const currentBranch = computed(() =>
  branches.value.find((b) => b.id === selectedBranchId.value)
);

const orderChanged = computed(() => {
  if (categories.value.length !== originalOrder.value.length) return false;
  return !categories.value.every(
    (cat, idx) => cat.id === originalOrder.value[idx].id
  );
});

const fetchBranches = async () => {
  try {
    const res = await api.get(`/branches`);
    branches.value = res.data;
    selectedBranchId.value = getBranchId() || branches.value[0]?.id || null;
  } catch (err) {
    console.error("❌ Failed to load branches:", err?.response?.data || err);
    window.$toast?.("Şubeler yüklenemedi", "error");
  }
};

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

const changeBranch = async () => {
  if (selectedBranchId.value) {
    setBranch(selectedBranchId.value);
  }
  window.$toast?.("Şube değiştirildi!", "success");
  await fetchCategories();
};

const dragStart = (index) => {
  draggedIndex.value = index;
};

const dragEnter = (index) => {
  dragOverIndex.value = index;
};

const dragLeave = () => {
  dragOverIndex.value = null;
};

const drop = (dropIndex) => {
  if (draggedIndex.value === null) return;

  const draggedItem = categories.value[draggedIndex.value];
  categories.value.splice(draggedIndex.value, 1);
  categories.value.splice(dropIndex, 0, draggedItem);

  draggedIndex.value = null;
  dragOverIndex.value = null;
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
  height: 100%;
  background: var(--cream-light);
  color: var(--espresso);
}

.card {
  margin-bottom: 2rem;
}

.card-description {
  color: rgba(62, 44, 39, 0.7);
  font-size: 0.875rem;
  margin-top: 0.25rem;
  font-weight: 400;
}

.branch-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, #fef9f0 0%, #fef5e7 100%);
  border-radius: var(--border-radius-md);
  border: 1px solid rgba(164, 126, 59, 0.15);
  transition: all var(--transition-base);
}

.info-item:hover {
  border-color: var(--gold2);
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.info-icon {
  font-size: 1.75rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-sm);
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  color: rgba(62, 44, 39, 0.7);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  color: var(--espresso);
  font-weight: 600;
}

.form-group {
  margin-bottom: 0;
}

.label-icon {
  margin-right: 0.5rem;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 500px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border: 2px solid rgba(164, 126, 59, 0.1);
  border-radius: var(--border-radius-md);
  cursor: move;
  transition: all var(--transition-base);
  position: relative;
}

.category-item:hover {
  background: linear-gradient(135deg, #fef9f0 0%, #ffffff 100%);
  border-color: var(--gold2);
  box-shadow: var(--shadow-md);
  transform: translateX(-2px);
}

.category-item:active {
  cursor: grabbing;
  opacity: 0.8;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #fef9f0 0%, #fef5e7 100%);
  border-radius: var(--border-radius-sm);
  cursor: grab;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.category-item:hover .drag-handle {
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%);
}

.category-item:hover .drag-handle :deep(svg) {
  color: white !important;
}

.category-item:active .drag-handle {
  cursor: grabbing;
}

.category-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.category-name {
  font-weight: 600;
  color: var(--espresso);
  font-size: 1rem;
}

.category-order {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--gold) 0%, var(--gold2) 100%);
  color: white;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.875rem;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--espresso);
}

.empty-state p {
  font-size: 0.875rem;
  color: rgba(62, 44, 39, 0.6);
}

.loading-state {
  text-align: center;
  padding: 3rem 2rem;
}

.loading-state p {
  margin-top: 1rem;
  color: rgba(62, 44, 39, 0.7);
}

@media (max-width: 900px) {
  .admin-settings {
    padding: 0;
  }

  .card {
    margin-bottom: 1.5rem;
    border-radius: var(--border-radius-lg);
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .branch-info-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .info-item {
    padding: 1rem;
  }

  .info-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }

  .category-list {
    max-height: 400px;
  }

  .category-item {
    padding: 1rem;
    gap: 0.75rem;
  }

  .drag-handle {
    width: 32px;
    height: 32px;
  }

  .category-name {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .info-item {
    padding: 0.875rem;
    gap: 0.75rem;
  }

  .info-icon {
    width: 36px;
    height: 36px;
    font-size: 1.25rem;
  }

  .category-item {
    padding: 0.875rem;
  }

  .category-order {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
}
</style>
