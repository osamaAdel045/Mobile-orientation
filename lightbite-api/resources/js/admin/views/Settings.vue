<template>
  <div>
    <LteAppContentHeader title="Platform Configuration" subtitle="Configure platform-wide settings" />

    <div class="card shadow-sm" style="max-width: 700px;">
      <div v-if="loading" class="card-body text-center py-5 text-body-secondary">Loading settings&hellip;</div>
      <div v-else class="card-body">
        <div class="vstack gap-4">
          <div class="row">
            <div class="col-sm-4"><label class="form-label small">Commission Rate (%)</label><input v-model.number="settings.commission_rate" type="number" step="0.1" class="form-control form-control-sm" style="max-width:120px;" /><small class="text-body-secondary">Default commission per order</small></div>
          </div>
          <div class="row g-3">
            <div class="col-sm-4"><label class="form-label small">Delivery Base Fee (AED)</label><input v-model.number="settings.delivery_base_fee" type="number" step="0.5" class="form-control form-control-sm" /></div>
            <div class="col-sm-4"><label class="form-label small">Per KM Rate (AED)</label><input v-model.number="settings.delivery_per_km" type="number" step="0.1" class="form-control form-control-sm" /></div>
            <div class="col-sm-4"><label class="form-label small">Included KM</label><input v-model.number="settings.delivery_included_km" type="number" class="form-control form-control-sm" /></div>
          </div>
          <div class="row g-3">
            <div class="col-sm-6"><label class="form-label small">Driver Base Pay (AED)</label><input v-model.number="settings.driver_base_pay" type="number" step="0.5" class="form-control form-control-sm" /></div>
            <div class="col-sm-6"><label class="form-label small">Driver Per KM Rate (AED)</label><input v-model.number="settings.driver_per_km" type="number" step="0.1" class="form-control form-control-sm" /></div>
          </div>
          <div class="row g-3">
            <div class="col-sm-6"><label class="form-label small">Tax Rate (%)</label><input v-model.number="settings.tax_rate" type="number" step="0.1" class="form-control form-control-sm" style="max-width:120px;" /></div>
            <div class="col-sm-6"><label class="form-label small">Minimum Order (AED)</label><input v-model.number="settings.min_order" type="number" class="form-control form-control-sm" style="max-width:120px;" /></div>
          </div>
          <div class="row g-3">
            <div class="col-sm-6"><label class="form-label small">Driver Timeout (seconds)</label><input v-model.number="settings.driver_timeout" type="number" class="form-control form-control-sm" style="max-width:120px;" /></div>
            <div class="col-sm-6"><label class="form-label small">Order Expiry (minutes)</label><input v-model.number="settings.order_expiry" type="number" class="form-control form-control-sm" style="max-width:120px;" /></div>
          </div>
        </div>
        <div class="mt-4 pt-3 border-top d-flex align-items-center gap-3">
          <button @click="saveSettings" class="btn btn-warning">Save Settings</button>
          <span v-if="saved" class="text-success small">✓ Settings saved</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../stores/api';

const loading = ref(true);
const saved = ref(false);
const settings = ref({
  commission_rate: 12, delivery_base_fee: 5, delivery_per_km: 1.5, delivery_included_km: 3,
  driver_base_pay: 8, driver_per_km: 2, tax_rate: 5, min_order: 20,
  driver_timeout: 30, order_expiry: 2,
});

onMounted(async () => {
  try {
    const { data } = await api.get('/admin/settings');
    if (data.data) Object.assign(settings.value, data.data);
  } catch (e) { /* Use defaults */ }
  loading.value = false;
});

async function saveSettings() {
  try {
    await api.put('/admin/settings', settings.value);
    saved.value = true;
    setTimeout(() => saved.value = false, 3000);
  } catch (e) { alert('Failed to save settings.'); }
}
</script>
