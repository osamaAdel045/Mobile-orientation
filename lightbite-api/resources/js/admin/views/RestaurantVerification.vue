<template>
  <div>
    <LteAppContentHeader title="Restaurant Verifications" subtitle="Review and approve new restaurant applications">
      <span class="badge bg-warning fs-6">{{ restaurants.length }} pending</span>
    </LteAppContentHeader>

    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading&hellip;</div>
    <div v-else-if="!restaurants.length" class="card shadow-sm">
      <div class="card-body text-center py-5"><p class="text-body-secondary mb-1">No pending verifications</p><small class="text-body-tertiary">All restaurant applications have been processed.</small></div>
    </div>
    <div v-else class="row g-3">
      <div v-for="r in restaurants" :key="r.uuid" class="col-12">
        <div class="card shadow-sm">
          <div class="card-body">
            <div class="d-flex justify-content-between mb-3">
              <div><h5 class="card-title mb-1">{{ r.name }}</h5><p class="text-body-secondary small mb-0">{{ r.cuisine_types?.join(', ') }}</p></div>
              <small class="text-body-tertiary">{{ r.created_at }}</small>
            </div>
            <div class="row small mb-3">
              <div class="col-sm-6"><span class="text-body-secondary">Address:</span> {{ r.address }}</div>
              <div class="col-sm-6"><span class="text-body-secondary">Phone:</span> {{ r.phone }}</div>
              <div class="col-sm-6"><span class="text-body-secondary">Owner:</span> {{ r.owner_name }}</div>
              <div class="col-sm-6"><span class="text-body-secondary">Email:</span> {{ r.owner_email }}</div>
            </div>
            <div v-if="r.description" class="bg-light rounded p-3 small mb-3">{{ r.description }}</div>
            <div class="border-top pt-3 mb-3"><h6 class="small fw-medium mb-2">Verification Documents</h6>
              <div class="row g-2 small">
                <div class="col-sm-6"><small class="text-body-secondary d-block">Trade License</small>
                  <a v-if="r.trade_license_url" :href="r.trade_license_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i>View Document</a>
                  <span v-else class="text-danger small">Not uploaded</span>
                </div>
                <div class="col-sm-6"><small class="text-body-secondary d-block">Food Safety Certificate</small>
                  <a v-if="r.food_safety_cert_url" :href="r.food_safety_cert_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i>View Document</a>
                  <span v-else class="text-danger small">Not uploaded</span>
                </div>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button @click="verify(r.uuid, 'approve')" class="btn btn-success btn-sm flex-fill">Approve Restaurant</button>
              <button @click="rejectPrompt(r)" class="btn btn-outline-danger btn-sm flex-fill">Reject</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="rejecting" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);">
      <div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Reject {{ rejecting.name }}?</h5><button type="button" class="btn-close" @click="rejecting=null"></button></div><div class="modal-body"><p class="small text-body-secondary">This action cannot be undone. The restaurant owner will be notified.</p><textarea v-model="rejectReason" class="form-control" rows="3" placeholder="Reason for rejection&hellip;"></textarea></div><div class="modal-footer"><button @click="rejecting=null" class="btn btn-secondary btn-sm">Cancel</button><button @click="doReject" class="btn btn-danger btn-sm">Reject Restaurant</button></div></div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../stores/api';

const loading = ref(true);
const restaurants = ref([]);
const rejecting = ref(null);
const rejectReason = ref('');

onMounted(async () => {
  const { data } = await api.get('/admin/restaurants/pending');
  restaurants.value = data.data || [];
  loading.value = false;
});

async function verify(uuid, action) {
  await api.post(`/admin/restaurants/${uuid}/verify`, { action, reason: rejectReason.value });
  restaurants.value = restaurants.value.filter(r => r.uuid !== uuid);
}
function rejectPrompt(r) { rejecting.value = r; rejectReason.value = ''; }
async function doReject() { await verify(rejecting.value.uuid, 'reject'); rejecting.value = null; }
</script>
