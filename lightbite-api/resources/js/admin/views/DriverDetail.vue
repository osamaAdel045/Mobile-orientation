<template>
  <div>
    <router-link to="/admin/drivers" class="btn btn-sm btn-outline-secondary mb-3">&larr; Back to Drivers</router-link>
    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading&hellip;</div>
    <template v-else-if="d">
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
            <div class="d-flex align-items-center gap-3">
              <img v-if="d.photo_url" :src="d.photo_url" class="rounded-circle border" width="64" height="64" style="object-fit:cover;" />
              <div v-else class="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style="width:64px;height:64px;font-size:24px;font-weight:700;">{{ d.name?.charAt(0) }}</div>
              <div>
                <h4 class="mb-1">{{ d.name }}</h4>
                <p class="text-body-secondary small mb-1">{{ d.email }} &middot; {{ d.phone }}</p>
                <div class="d-flex gap-1">
                  <span class="badge text-capitalize" :class="statusBadge(d.status)">{{ formatStatus(d.status) }}</span>
                  <span v-if="d.driver_location?.is_online" class="badge bg-success">Online</span>
                </div>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button v-if="d.status !== 'suspended'" @click="doSuspend" class="btn btn-warning btn-sm">Suspend</button>
              <button v-if="d.status === 'suspended'" @click="doUnsuspend" class="btn btn-success btn-sm">Reactivate</button>
              <button v-if="d.status !== 'deactivated'" @click="doDeactivate" class="btn btn-outline-danger btn-sm">Deactivate</button>
            </div>
          </div>
          <div class="row mt-3 pt-3 border-top">
            <div class="col-4"><small class="text-body-secondary">Total Deliveries</small><p class="fs-4 fw-bold mb-0">{{ d.stats?.total_deliveries }}</p></div>
            <div class="col-4"><small class="text-body-secondary">Total Earnings</small><p class="fs-4 fw-bold mb-0">AED {{ d.stats?.total_earnings }}</p></div>
            <div class="col-4"><small class="text-body-secondary">Disputes</small><p class="fs-4 fw-bold mb-0">{{ d.stats?.disputes_involved }}</p></div>
          </div>
        </div>
      </div>

      <!-- Docs + Location -->
      <div class="row mb-3">
        <div class="col-md-6 mb-3"><div class="card shadow-sm"><div class="card-header"><h6 class="card-title mb-0">Documents</h6></div><div class="card-body small"><div v-if="hasDocs" class="vstack gap-2"><a v-if="d.documents?.license_url" :href="d.documents.license_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-file-text me-1"></i>Driver's License</a><a v-if="d.documents?.vehicle_registration_url" :href="d.documents.vehicle_registration_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-truck me-1"></i>Vehicle Registration</a><a v-if="d.documents?.insurance_url" :href="d.documents.insurance_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-shield-check me-1"></i>Insurance</a></div><p v-else class="text-body-secondary mb-0">No documents uploaded</p></div></div></div>

        <div class="col-md-6 mb-3"><div class="card shadow-sm"><div class="card-header"><h6 class="card-title mb-0">Location</h6></div><div class="card-body small"><div v-if="d.driver_location?.lat && d.driver_location.lat > 0"><p class="small mb-1">Lat: {{ d.driver_location.lat.toFixed(5) }}</p><p class="small mb-1">Lng: {{ d.driver_location.lng.toFixed(5) }}</p><small class="text-body-secondary">{{ d.driver_location.is_online ? 'Currently online' : 'Last known' }}</small></div><p v-else class="text-body-secondary mb-0">No location data</p></div></div></div>
      </div>

      <div v-if="d.recent_deliveries?.length" class="card shadow-sm mb-3"><div class="card-header"><h6 class="card-title mb-0">Recent Deliveries</h6></div><div class="table-responsive"><table class="table table-hover mb-0"><thead class="table-light"><tr><th>Order #</th><th>Restaurant</th><th>Earnings</th></tr></thead><tbody><tr v-for="del in d.recent_deliveries" :key="del.uuid"><td class="font-monospace small">{{ del.order_number }}</td><td class="small">{{ del.restaurant }}</td><td class="small fw-medium">AED {{ del.earnings || '—' }}</td></tr></tbody></table></div></div>

      <!-- Suspended/Deactivate modal -->
      <div v-if="showModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);">
        <div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">{{ modalTitle }}</h5><button type="button" class="btn-close" @click="showModal=false"></button></div><div class="modal-body"><textarea v-model="reason" class="form-control" rows="2" placeholder="Reason required&hellip;"></textarea></div><div class="modal-footer"><button @click="showModal=false" class="btn btn-secondary btn-sm">Cancel</button><button @click="doAction" :disabled="!reason" class="btn btn-sm text-white" :class="action==='suspend'?'btn-warning':'btn-danger'">{{ action === 'suspend' ? 'Suspend' : 'Deactivate' }}</button></div></div></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../stores/api';

const route = useRoute();
const loading = ref(true); const d = ref(null);
const showModal = ref(false); const action = ref(''); const reason = ref('');
const modalTitle = computed(() => action.value === 'suspend' ? 'Suspend Driver' : 'Deactivate Driver');
const hasDocs = computed(() => d.value?.documents && (d.value.documents.license_url || d.value.documents.vehicle_registration_url || d.value.documents.insurance_url));

onMounted(async () => {
  try {
    const { data } = await api.get(`/admin/users/${route.params.uuid}`);
    d.value = data.data;
  } catch(e) { console.error(e); }
  loading.value = false;
});

function doSuspend() { action.value = 'suspend'; reason.value = ''; showModal.value = true; }
function doDeactivate() { action.value = 'deactivate'; reason.value = ''; showModal.value = true; }
async function doUnsuspend() {
  await api.post(`/admin/users/${route.params.uuid}/unsuspend`);
  d.value.status = 'verified';
}
async function doAction() {
  const ep = action.value === 'suspend' ? 'suspend' : 'deactivate';
  await api.post(`/admin/users/${route.params.uuid}/${ep}`, { reason: reason.value });
  d.value.status = action.value === 'suspend' ? 'suspended' : 'deactivated';
  showModal.value = false;
}

function statusBadge(s) {
  return { verified:'bg-success', pending_verification:'bg-warning', suspended:'bg-warning text-dark', deactivated:'bg-secondary' }[s] || 'bg-secondary';
}
function formatStatus(s) { return s?.replace(/_/g, ' ') || ''; }
</script>
