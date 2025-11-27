<template>
  <!-- 🟤 Toast Notifications -->
  <transition-group name="toast-fade" tag="div" class="toast-container">
    <div
      v-for="toast in state.toasts"
      :key="toast.id"
      :class="['toast', toast.type]"
    >
      {{ toast.message }}
    </div>
  </transition-group>

  <!-- 🔶 Alert Modal -->
  <div v-if="state.alert.visible" class="modal-overlay">
    <div class="modal-box">
      <h3>🟤 {{ state.alert.title }}</h3>
      <p>{{ state.alert.message }}</p>
      <div class="actions actions-center">
        <button class="btn-ok" @click="closeAlert">Tamam</button>
      </div>
    </div>
  </div>

  <!-- 🔶 Confirm Modal -->
  <div v-if="state.confirm.visible" class="modal-overlay">
    <div class="modal-box">
      <h3>🟤 {{ state.confirm.title }}</h3>
      <p>{{ state.confirm.message }}</p>
      <div class="actions">
        <button class="btn-cancel" @click="cancelConfirm">Cancel</button>
        <button class="btn-ok" @click="confirmConfirm">OK</button>
      </div>
    </div>
  </div>

  <!-- 🔶 Input / Prompt Modal -->
  <div v-if="state.prompt.visible" class="modal-overlay">
    <div class="modal-box">
      <h3>🟤 {{ state.prompt.title }}</h3>
      <p v-if="state.prompt.message">{{ state.prompt.message }}</p>
      <input
        v-model="state.prompt.value"
        type="text"
        class="modal-input"
        @keyup.enter="confirmPrompt"
        autofocus
      />
      <div class="actions">
        <button class="btn-cancel" @click="cancelPrompt">Cancel</button>
        <button class="btn-ok" @click="confirmPrompt">OK</button>
      </div>
    </div>
  </div>
</template>

<script>
// Example usage:
//
// window.$toast("Saved successfully!", "success");
// window.$alert("You must enter a name before saving.");
//
// const ok = await window.$confirm("Delete this item?", "Confirm delete");
// if (ok) {
//   window.$toast("Deleted", "success");
// }
//
// const name = await window.$prompt("Enter a name:", "Name input", "Default");
// if (name !== null) {
//   window.$toast("You entered: " + name, "info");
// }
</script>

<script setup>
import { reactive } from "vue";

const state = reactive({
  toasts: [],
  alert: { visible: false, title: "", message: "" },
  confirm: { visible: false, title: "", message: "", resolve: null },
  prompt: {
    visible: false,
    title: "",
    message: "",
    value: "",
    resolve: null,
  },
});

//  Toast
function toast(message, type = "info", duration = 3000) {
  const id = Date.now();
  state.toasts.push({ id, message, type });
  setTimeout(() => {
    const index = state.toasts.findIndex((t) => t.id === id);
    if (index !== -1) state.toasts.splice(index, 1);
  }, duration);
}

//  Alert
function alert(message, title = "Alert") {
  state.alert = { visible: true, title, message };
}
function closeAlert() {
  state.alert.visible = false;
}

//  Confirm
function confirm(message, title = "Confirm") {
  return new Promise((resolve) => {
    state.confirm = { visible: true, title, message, resolve };
  });
}
function confirmConfirm() {
  if (!state.confirm.visible) return;
  state.confirm.visible = false;
  state.confirm.resolve(true);
}
function cancelConfirm() {
  if (!state.confirm.visible) return;
  state.confirm.visible = false;
  state.confirm.resolve(false);
}

//  Prompt (Input Modal)
function prompt(message, title = "Input", defaultValue = "") {
  return new Promise((resolve) => {
    state.prompt = {
      visible: true,
      title,
      message,
      value: defaultValue,
      resolve,
    };
  });
}
function confirmPrompt() {
  if (!state.prompt.visible) return;
  state.prompt.visible = false;
  state.prompt.resolve(state.prompt.value);
}
function cancelPrompt() {
  if (!state.prompt.visible) return;
  state.prompt.visible = false;
  state.prompt.resolve(null);
}

// 🌍 Global Access
window.$toast = toast;
window.$alert = alert;
window.$confirm = confirm;
window.$prompt = prompt;
</script>

<style scoped>
/* ===========================
   🧁 Toasts (unchanged)
   =========================== */
.toast-container {
  position: fixed;
  top: 20px;
  right: 50%;
  transform: translateX(50%);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  z-index: 9999;
}

.toast {
  padding: 0.75rem 1.2rem;
  border-radius: 8px;
  color: var(--cream);
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(62, 44, 39, 0.2);
  background: var(--espresso);
}

/* Info = espresso */
.toast.info {
  background-color: var(--espresso);
}

/* Success = keep green for clarity */
.toast.success {
  background-color: #4caf50;
}

/* Error = keep red for clarity */
.toast.error {
  background-color: #e74c3c;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 900px) {
  .toast-container {
    width: 90%;
  }
}

/* ===========================
   💬 Modals (unified styling)
   =========================== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
}

.modal-box {
  background: var(--cream);
  border-radius: 16px;
  padding: 1.7rem 2.2rem;
  max-width: 90vw;
  width: min(480px, 90vw);
  text-align: left;
  box-shadow: 0 6px 16px rgba(62, 44, 39, 0.25);
  border: 1px solid var(--gold2);
  color: var(--espresso);
}

.modal-overlay h3 {
  font-size: 1.6rem;
  margin-bottom: 0.6rem;
}

.modal-overlay p {
  font-size: 1.05rem;
  line-height: 1.5;
}

/* Input field in prompt modal */
.modal-input {
  width: 100%;
  margin-top: 1rem;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--gold2);
  background: var(--cream-light);
  color: var(--espresso);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.modal-input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 2px rgba(201, 162, 39, 0.25);
  background: var(--cream-warm);
}

/* Buttons row */
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.3rem;
}

.actions-center {
  justify-content: center;
}

/* OK button = primary gold */
.btn-ok {
  background: var(--gold);
  color: var(--espresso);
  border: none;
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(201, 162, 39, 0.4);
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
}

.btn-ok:hover {
  background: var(--gold2);
  box-shadow: 0 3px 8px rgba(164, 126, 59, 0.45);
  transform: translateY(-1px);
}

.btn-ok:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(164, 126, 59, 0.35);
}

/* Cancel = soft neutral */
.btn-cancel {
  background: var(--cream);
  color: var(--espresso);
  border: 1px solid var(--gold2);
  padding: 0.6rem 1.4rem;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.15s ease, border-color 0.15s ease,
    transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-cancel:hover {
  background: var(--highlight);
  border-color: var(--gold);
  box-shadow: 0 2px 6px rgba(164, 126, 59, 0.2);
  transform: translateY(-1px);
}

.btn-cancel:active {
  transform: translateY(0);
  box-shadow: none;
}
</style>
