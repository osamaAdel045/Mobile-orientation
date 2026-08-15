<template>
  <div>
    <LteAppContentHeader title="Platform Configuration" subtitle="Configure platform-wide economics, delivery, and order settings">
      <template #actions>
        <div class="d-flex align-items-center gap-2">
          <button @click="resetForm" :disabled="!dirty || saving" class="btn btn-sm btn-outline-secondary"><i class="bi bi-arrow-counterclockwise me-1"></i>Reset</button>
          <button @click="saveSettings" :disabled="!dirty || saving || !formValid" class="btn btn-sm btn-warning">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span><i v-else class="bi bi-check-lg me-1"></i>Save Settings
          </button>
        </div>
      </template>
    </LteAppContentHeader>

    <div v-if="loading" class="card shadow-sm" style="max-width: 900px;">
      <div class="card-body placeholder-glow py-5">
        <div class="placeholder col-4 mb-4"></div>
        <div class="placeholder col-8 mb-3"></div>
        <div class="placeholder col-8 mb-3"></div>
        <div class="placeholder col-6"></div>
      </div>
    </div>

    <div v-else class="card shadow-sm" style="max-width: 900px;">
      <div class="card-body">
        <!-- Save confirmation -->
        <div v-if="toast.show" class="alert py-2 small" :class="toast.error ? 'alert-danger' : 'alert-success'">
          <i class="bi" :class="toast.error ? 'bi-exclamation-triangle' : 'bi-check-circle'"></i> {{ toast.message }}
        </div>

        <form @submit.prevent="saveSettings" novalidate>
          <!-- 1. Platform & Economics -->
          <h6 class="text-body-secondary text-uppercase small fw-bold border-bottom pb-2 mb-3"><i class="bi bi-cash-stack me-1"></i>Platform &amp; Economics</h6>
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <label class="form-label small">Commission Rate (%)</label>
              <input v-model.number="form.commission_rate" type="number" step="0.1" min="0" max="50" class="form-control form-control-sm" :class="{ 'is-invalid': errors.commission_rate }" />
              <div v-if="errors.commission_rate" class="invalid-feedback">{{ errors.commission_rate }}</div>
              <small class="text-body-secondary">Platform commission per order (0–50%)</small>
            </div>
            <div class="col-md-4">
              <label class="form-label small">Tax Rate (%)</label>
              <input v-model.number="form.tax_rate" type="number" step="0.1" min="0" max="30" class="form-control form-control-sm" :class="{ 'is-invalid': errors.tax_rate }" />
              <div v-if="errors.tax_rate" class="invalid-feedback">{{ errors.tax_rate }}</div>
              <small class="text-body-secondary">VAT applied to orders (0–30%)</small>
            </div>
            <div class="col-md-4">
              <label class="form-label small">Minimum Order (AED)</label>
              <input v-model.number="form.min_order" type="number" step="0.5" min="0" class="form-control form-control-sm" :class="{ 'is-invalid': errors.min_order }" />
              <div v-if="errors.min_order" class="invalid-feedback">{{ errors.min_order }}</div>
            </div>
          </div>

          <!-- 2. Delivery Fees -->
          <h6 class="text-body-secondary text-uppercase small fw-bold border-bottom pb-2 mb-3"><i class="bi bi-truck me-1"></i>Delivery Fees</h6>
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <label class="form-label small">Base Fee (AED)</label>
              <input v-model.number="form.delivery_base_fee" type="number" step="0.5" min="0" class="form-control form-control-sm" :class="{ 'is-invalid': errors.delivery_base_fee }" />
              <div v-if="errors.delivery_base_fee" class="invalid-feedback">{{ errors.delivery_base_fee }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small">Per KM Rate (AED)</label>
              <input v-model.number="form.delivery_per_km" type="number" step="0.1" min="0" class="form-control form-control-sm" :class="{ 'is-invalid': errors.delivery_per_km }" />
              <div v-if="errors.delivery_per_km" class="invalid-feedback">{{ errors.delivery_per_km }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small">Included KM</label>
              <input v-model.number="form.delivery_included_km" type="number" step="0.5" min="0" class="form-control form-control-sm" :class="{ 'is-invalid': errors.delivery_included_km }" />
              <div v-if="errors.delivery_included_km" class="invalid-feedback">{{ errors.delivery_included_km }}</div>
              <small class="text-body-secondary">Distance covered by the base fee</small>
            </div>
          </div>

          <!-- 3. Driver Pay & Assignment -->
          <h6 class="text-body-secondary text-uppercase small fw-bold border-bottom pb-2 mb-3"><i class="bi bi-bicycle me-1"></i>Driver Pay &amp; Assignment</h6>
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <label class="form-label small">Driver Base Pay (AED)</label>
              <input v-model.number="form.driver_base_pay" type="number" step="0.5" min="0" class="form-control form-control-sm" :class="{ 'is-invalid': errors.driver_base_pay }" />
              <div v-if="errors.driver_base_pay" class="invalid-feedback">{{ errors.driver_base_pay }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small">Driver Per KM (AED)</label>
              <input v-model.number="form.driver_per_km" type="number" step="0.1" min="0" class="form-control form-control-sm" :class="{ 'is-invalid': errors.driver_per_km }" />
              <div v-if="errors.driver_per_km" class="invalid-feedback">{{ errors.driver_per_km }}</div>
            </div>
            <div class="col-md-4">
              <label class="form-label small">Driver Offer Timeout (seconds)</label>
              <input v-model.number="form.driver_timeout" type="number" step="1" min="5" max="120" class="form-control form-control-sm" :class="{ 'is-invalid': errors.driver_timeout }" />
              <div v-if="errors.driver_timeout" class="invalid-feedback">{{ errors.driver_timeout }}</div>
              <small class="text-body-secondary">How long a job offer stays open (5–120s)</small>
            </div>
          </div>

          <!-- 4. Order Processing -->
          <h6 class="text-body-secondary text-uppercase small fw-bold border-bottom pb-2 mb-3"><i class="bi bi-hourglass-split me-1"></i>Order Processing</h6>
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <label class="form-label small">Order Expiry (minutes)</label>
              <input v-model.number="form.order_expiry" type="number" step="1" min="1" max="30" class="form-control form-control-sm" :class="{ 'is-invalid': errors.order_expiry }" />
              <div v-if="errors.order_expiry" class="invalid-feedback">{{ errors.order_expiry }}</div>
              <small class="text-body-secondary">Minutes before an unaccepted order expires (1–30)</small>
            </div>
          </div>

          <div class="pt-3 border-top d-flex align-items-center gap-3">
            <button type="submit" class="btn btn-warning" :disabled="!dirty || saving || !formValid">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span><i v-else class="bi bi-check-lg me-1"></i>Save Settings
            </button>
            <span v-if="!dirty" class="text-body-secondary small">No unsaved changes</span>
            <span v-else-if="formValid" class="text-warning small"><i class="bi bi-exclamation-circle me-1"></i>Unsaved changes</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import api from '../stores/api';

const loading = ref(true);
const saving = ref(false);
const dirty = ref(false);
const toast = ref({ show: false, message: '', error: false });
let toastTimer = null;
let original = null;

const form = reactive({
  commission_rate: 12, delivery_base_fee: 5, delivery_per_km: 1.5, delivery_included_km: 3,
  driver_base_pay: 8, driver_per_km: 2, tax_rate: 5, min_order: 20,
  driver_timeout: 30, order_expiry: 2,
});

const errors = reactive({});

// Client-side validation mirrors AdminController::updateSettings rules.
const rules = {
  commission_rate: v => (!isFinite(v) ? 'Required' : v < 0 || v > 50 ? 'Must be 0–50' : ''),
  delivery_base_fee: v => (!isFinite(v) ? 'Required' : v < 0 ? 'Must be ≥ 0' : ''),
  delivery_per_km: v => (!isFinite(v) ? 'Required' : v < 0 ? 'Must be ≥ 0' : ''),
  delivery_included_km: v => (!isFinite(v) ? 'Required' : v < 0 ? 'Must be ≥ 0' : ''),
  driver_base_pay: v => (!isFinite(v) ? 'Required' : v < 0 ? 'Must be ≥ 0' : ''),
  driver_per_km: v => (!isFinite(v) ? 'Required' : v < 0 ? 'Must be ≥ 0' : ''),
  tax_rate: v => (!isFinite(v) ? 'Required' : v < 0 || v > 30 ? 'Must be 0–30' : ''),
  min_order: v => (!isFinite(v) ? 'Required' : v < 0 ? 'Must be ≥ 0' : ''),
  driver_timeout: v => (!isFinite(v) ? 'Required' : !Number.isInteger(v) || v < 5 || v > 120 ? 'Integer 5–120' : ''),
  order_expiry: v => (!isFinite(v) ? 'Required' : !Number.isInteger(v) || v < 1 || v > 30 ? 'Integer 1–30' : ''),
};

const formValid = computed(() => {
  for (const key of Object.keys(rules)) {
    if (rules[key](form[key])) return false;
  }
  return true;
});

function validate() {
  let valid = true;
  for (const key of Object.keys(rules)) {
    const err = rules[key](form[key]);
    errors[key] = err;
    if (err) valid = false;
  }
  return valid;
}

function isEqual(a, b) {
  return Object.keys(rules).every(k => String(a[k]) === String(b[k]));
}

watch(form, () => {
  if (original) dirty.value = !isEqual(form, original);
}, { deep: true });

function showToast(message, error = false) {
  clearTimeout(toastTimer);
  toast.value = { show: true, message, error };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 4000);
}

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/settings');
    if (data.data) {
      Object.assign(form, data.data);
      original = JSON.parse(JSON.stringify(form));
    }
  } catch (e) { /* defaults */ }
  loading.value = false;
});

function resetForm() {
  Object.assign(form, original);
  dirty.value = false;
  showToast('Changes reverted.', true);
}

async function saveSettings() {
  if (!validate()) {
    showToast('Please fix the highlighted fields.', true);
    return;
  }
  saving.value = true;
  try {
    const { data } = await api.put('/admin/settings', { ...form });
    original = JSON.parse(JSON.stringify(form));
    dirty.value = false;
    showToast(data.data?.message || 'Settings saved.');
  } catch (e) {
    const msg = e.response?.data?.message || 'Failed to save settings.';
    showToast(msg, true);
  }
  saving.value = false;
}
</script>
