<template>
  <div>
    <router-link to="/admin/restaurants" class="btn btn-sm btn-outline-secondary mb-3">&larr; Back to Restaurants</router-link>
    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading&hellip;</div>
    <template v-else-if="r">
      <!-- Header -->
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
            <div class="d-flex align-items-center gap-3">
              <img v-if="r.logo_url" :src="r.logo_url" class="rounded" width="64" height="64" style="object-fit:cover;" />
              <div v-else class="rounded bg-light d-flex align-items-center justify-content-center" style="width:64px;height:64px;font-size:24px;">🍽</div>
              <div>
                <h4 class="mb-1">{{ r.name }}</h4>
                <p class="text-body-secondary small mb-1">{{ r.cuisine?.join(', ') }} &middot; {{ r.address }}</p>
                <span class="badge text-capitalize" :class="statusBadge(r.status)">{{ formatStatus(r.status) }}</span>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button v-if="r.status !== 'suspended'" @click="doSuspend" class="btn btn-warning btn-sm">Suspend</button>
              <button v-if="r.status === 'suspended'" @click="doUnsuspend" class="btn btn-success btn-sm">Reactivate</button>
            </div>
          </div>
          <div class="row mt-3 pt-3 border-top small">
            <div class="col-6 col-md"><small class="text-body-secondary">Phone</small><p class="fw-medium mb-0">{{ r.phone }}</p></div>
            <div class="col-6 col-md"><small class="text-body-secondary">Owner</small><p class="fw-medium mb-0">{{ r.owner?.name }}</p></div>
            <div class="col-6 col-md"><small class="text-body-secondary">Commission</small><p class="fw-medium mb-0">{{ (r.commission * 100).toFixed(0) }}%</p></div>
            <div class="col-6 col-md"><small class="text-body-secondary">Accepting</small><p class="fw-medium mb-0" :class="r.accepting ? 'text-success' : 'text-danger'">{{ r.accepting ? 'Yes' : 'No' }}</p></div>
            <div class="col-6 col-md"><small class="text-body-secondary">Prep Avg</small><p class="fw-medium mb-0">{{ r.prep_avg_min }} min</p></div>
          </div>
          <div class="mt-3 pt-3 border-top d-flex align-items-end gap-3">
            <div><label class="form-label small mb-1">Commission Rate</label><input v-model.number="commission" type="number" step="0.1" min="0" max="100" class="form-control form-control-sm" style="width:100px;" /></div>
            <button @click="saveCommission" class="btn btn-sm btn-warning">Save</button>
            <span v-if="saved" class="text-success small">✓ Saved</span>
          </div>
        </div>
      </div>

      <!-- Stats -->
      <div class="row mb-3">
        <div class="col-6 col-md mb-3" v-for="(stat, i) in [{label:'Total Orders',val:r.stats?.total_orders},{label:'Today',val:r.stats?.orders_today},{label:'Revenue Today',val:'AED '+r.stats?.revenue_today},{label:'Avg Rating',val:r.stats?.avg_rating+' ⭐'},{label:'Menu Items',val:r.stats?.menu_items}]" :key="i">
          <div class="card shadow-sm text-center"><div class="card-body"><p class="fs-4 fw-bold mb-1">{{ stat.val }}</p><small class="text-body-secondary">{{ stat.label }}</small></div></div>
        </div>
      </div>

      <!-- Documents -->
      <div class="card shadow-sm mb-3"><div class="card-header"><h6 class="card-title mb-0">Documents</h6></div><div class="card-body small"><div class="d-flex gap-3"><a v-if="r.trade_license_url" :href="r.trade_license_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-file-text me-1"></i>Trade License</a><a v-if="r.food_safety_url" :href="r.food_safety_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-shield-check me-1"></i>Food Safety Certificate</a><span v-if="!r.trade_license_url && !r.food_safety_url" class="text-body-secondary">No documents uploaded</span></div></div></div>

      <!-- Description -->
      <div v-if="r.description" class="card shadow-sm"><div class="card-header"><h6 class="card-title mb-0">Description</h6></div><div class="card-body small"><p class="mb-0">{{ r.description }}</p></div></div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../stores/api';

const route = useRoute();
const loading = ref(true);
const r = ref(null);
const commission = ref(0);
const saved = ref(false);

onMounted(async () => {
  try {
    const { data } = await api.get(`/admin/restaurants/${route.params.uuid}`);
    r.value = data.data;
    commission.value = (data.data.commission * 100).toFixed(0);
  } catch(e) { console.error(e); }
  loading.value = false;
});

async function saveCommission() {
  await api.patch(`/admin/restaurants/${route.params.uuid}`, { commission_rate: commission.value / 100 });
  r.value.commission = commission.value / 100;
  saved.value = true; setTimeout(() => saved.value = false, 2000);
}
async function doSuspend() {
  if (!confirm('Suspend this restaurant and its owner?')) return;
  await api.post(`/admin/restaurants/${route.params.uuid}/suspend`, { reason: 'Admin action.' });
  r.value.status = 'suspended';
}
async function doUnsuspend() {
  await api.post(`/admin/restaurants/${route.params.uuid}/unsuspend`);
  r.value.status = 'active';
}

function statusBadge(s) {
  return { active:'bg-success', pending_verification:'bg-warning', rejected:'bg-danger', suspended:'bg-warning text-dark' }[s] || 'bg-secondary';
}
function formatStatus(s) { return s?.replace(/_/g, ' ') || ''; }
</script>
