<template>
  <div>
    <LteAppContentHeader title="Driver Verifications" subtitle="Review and approve new driver applications">
      <span class="badge bg-warning fs-6">{{ drivers.length }} pending</span>
    </LteAppContentHeader>

    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading&hellip;</div>
    <div v-else-if="!drivers.length" class="card shadow-sm">
      <div class="card-body text-center py-5"><p class="text-body-secondary mb-1">No pending verifications</p><small class="text-body-tertiary">All driver applications have been processed.</small></div>
    </div>
    <div v-else class="row g-3">
      <div v-for="d in drivers" :key="d.uuid" class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div class="d-flex align-items-center gap-3">
                <img v-if="d.photo_url" :src="d.photo_url" class="rounded-circle" width="48" height="48" style="object-fit:cover;" />
                <div v-else class="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style="width:48px;height:48px;font-weight:600;">{{ d.name?.charAt(0) }}</div>
                <div><h5 class="card-title mb-0">{{ d.name }}</h5><small class="text-body-secondary">{{ d.email }}</small></div>
              </div>
              <span class="badge bg-warning">{{ d.status }}</span>
            </div>
            <div class="row small mb-3">
              <div class="col-sm-6"><span class="text-body-secondary">Phone:</span> {{ d.phone }}</div>
              <div class="col-sm-6"><span class="text-body-secondary">Applied:</span> {{ d.created_at }}</div>
            </div>
            <div class="border-top pt-3 mb-3"><h6 class="small fw-medium mb-2">Verification Documents</h6>
              <div class="row g-2 small">
                <div class="col-4"><small class="text-body-secondary d-block">Driver's License</small>
                  <a v-if="d.license_url" :href="d.license_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i>View</a>
                  <span v-else class="text-danger small">Not uploaded</span>
                </div>
                <div class="col-4"><small class="text-body-secondary d-block">Vehicle Registration</small>
                  <a v-if="d.vehicle_registration_url" :href="d.vehicle_registration_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i>View</a>
                  <span v-else class="text-danger small">Not uploaded</span>
                </div>
                <div class="col-4"><small class="text-body-secondary d-block">Insurance</small>
                  <a v-if="d.insurance_url" :href="d.insurance_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i>View</a>
                  <span v-else class="text-danger small">Not uploaded</span>
                </div>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button @click="verify(d.uuid, 'approve')" class="btn btn-success btn-sm flex-fill">Approve Driver</button>
              <button @click="rejectPrompt(d)" class="btn btn-outline-danger btn-sm flex-fill">Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="rejecting" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);">
      <div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Reject {{ rejecting.name }}?</h5><button type="button" class="btn-close" @click="rejecting=null"></button></div><div class="modal-body"><p class="small text-body-secondary">The driver will be notified of the rejection.</p><textarea v-model="rejectReason" class="form-control" rows="3" placeholder="Reason for rejection&hellip;"></textarea></div><div class="modal-footer"><button @click="rejecting=null" class="btn btn-secondary btn-sm">Cancel</button><button @click="doReject" class="btn btn-danger btn-sm">Reject Driver</button></div></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../stores/api';

const loading = ref(true);
const drivers = ref([]);
const rejecting = ref(null);
const rejectReason = ref('');

onMounted(async () => {
  const { data } = await api.get('/admin/drivers/pending');
  drivers.value = data.data || [];
  loading.value = false;
});

async function verify(uuid, action) {
  await api.post(`/admin/drivers/${uuid}/verify`, { action, reason: rejectReason.value });
  drivers.value = drivers.value.filter(d => d.uuid !== uuid);
}
function rejectPrompt(d) { rejecting.value = d; rejectReason.value = ''; }
async function doReject() { await verify(rejecting.value.uuid, 'reject'); rejecting.value = null; }
</script>
