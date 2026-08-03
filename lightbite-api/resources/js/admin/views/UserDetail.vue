<template>
  <div>
    <router-link to="/admin/users" class="btn btn-sm btn-outline-secondary mb-3">&larr; Back to Users</router-link>

    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading user&hellip;</div>

    <template v-else-if="user">
      <!-- Header Card -->
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
            <div class="d-flex align-items-center gap-3">
              <img v-if="user.photo_url" :src="user.photo_url" class="rounded-circle border" width="64" height="64" style="object-fit:cover;" />
              <div v-else class="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style="width:64px;height:64px;font-size:24px;font-weight:700;">{{ user.name?.charAt(0) }}</div>
              <div>
                <h4 class="mb-1">{{ user.name }}</h4>
                <p class="text-body-secondary mb-1 small">{{ user.email }}</p>
                <div class="d-flex gap-1">
                  <span class="badge" :class="roleBadge(user.role)">{{ user.role }}</span>
                  <span class="badge" :class="statusBadge(user.status)">{{ formatStatus(user.status) }}</span>
                </div>
              </div>
            </div>
            <div class="d-flex gap-2">
              <button v-if="user.status !== 'suspended'" @click="suspend" class="btn btn-warning btn-sm">Suspend</button>
              <button v-if="user.status === 'suspended'" @click="unsuspend" class="btn btn-success btn-sm">Reactivate</button>
              <button v-if="user.status !== 'deactivated'" @click="confirmDeactivate" class="btn btn-outline-danger btn-sm">Deactivate</button>
            </div>
          </div>
          <div class="row mt-3 pt-3 border-top small">
            <div class="col-6 col-md-3"><small class="text-body-secondary">Phone</small><p class="fw-medium mb-0">{{ user.phone || '—' }}</p></div>
            <div class="col-6 col-md-3"><small class="text-body-secondary">Locale</small><p class="fw-medium mb-0">{{ user.locale || 'en' }}</p></div>
            <div class="col-6 col-md-3"><small class="text-body-secondary">Joined</small><p class="fw-medium mb-0">{{ formatDate(user.created_at) }}</p></div>
            <div class="col-6 col-md-3"><small class="text-body-secondary">User ID</small><p class="font-monospace small text-body-secondary mb-0 text-truncate">{{ user.uuid }}</p></div>
          </div>
        </div>
      </div>

      <!-- Customer Stats -->
      <div v-if="user.role === 'customer'" class="row mb-3">
        <div class="col-lg-4 mb-3"><div class="card shadow-sm"><div class="card-header"><h6 class="card-title mb-0">Customer Stats</h6></div><div class="card-body small"><dl class="row mb-0"><dt class="col-8 text-body-secondary">Total Orders</dt><dd class="col-4 fw-semibold text-end">{{ user.stats?.total_orders }}</dd><dt class="col-8 text-body-secondary">Total Spent</dt><dd class="col-4 fw-semibold text-end">AED {{ user.stats?.total_spent }}</dd><dt class="col-8 text-body-secondary">Disputes Filed</dt><dd class="col-4 fw-semibold text-end">{{ user.stats?.disputes_filed }}</dd></dl></div></div></div>
        <div class="col-lg-4 mb-3"><div class="card shadow-sm"><div class="card-header"><h6 class="card-title mb-0">Saved Addresses</h6></div><div class="card-body small"><div v-if="user.addresses?.length" class="vstack gap-2"><div v-for="a in user.addresses" :key="a.uuid"><p class="fw-medium mb-0">{{ a.label }} <span v-if="a.is_default" class="badge bg-warning">default</span></p><small class="text-body-secondary">{{ a.address }}</small></div></div><p v-else class="text-body-secondary mb-0">No saved addresses</p></div></div></div>
        <div class="col-lg-4 mb-3"><div class="card shadow-sm"><div class="card-header"><h6 class="card-title mb-0">Recent Orders</h6></div><div class="card-body small"><div v-if="user.recent_orders?.length" class="vstack gap-1"><router-link v-for="o in user.recent_orders" :key="o.uuid" :to="`/admin/orders/${o.uuid}`" class="list-group-item list-group-item-action d-flex justify-content-between px-2 py-1 rounded"><span class="font-monospace small">{{ o.order_number }}</span><span>AED {{ o.total }}</span></router-link></div><p v-else class="text-body-secondary mb-0">No orders yet</p></div></div></div>
      </div>

      <!-- Driver section -->
      <template v-if="user.role === 'driver'">
        <div class="row mb-3">
          <div class="col-md-6 mb-3"><div class="card shadow-sm"><div class="card-header"><h6 class="card-title mb-0">Driver Stats</h6></div><div class="card-body small"><dl class="row mb-0"><dt class="col-7 text-body-secondary">Total Deliveries</dt><dd class="col-5 fw-semibold text-end">{{ user.stats?.total_deliveries }}</dd><dt class="col-7 text-body-secondary">Total Earnings</dt><dd class="col-5 fw-semibold text-end">AED {{ user.stats?.total_earnings }}</dd><dt class="col-7 text-body-secondary">Disputes Involved</dt><dd class="col-5 fw-semibold text-end">{{ user.stats?.disputes_involved }}</dd><dt class="col-7 text-body-secondary">Current Status</dt><dd class="col-5 fw-semibold text-end"><span :class="user.driver_location?.is_online ? 'text-success' : 'text-body-secondary'">{{ user.driver_location?.is_online ? 'Online' : 'Offline' }}</span></dd></dl></div></div></div>
          <div class="col-md-6 mb-3"><div class="card shadow-sm"><div class="card-header"><h6 class="card-title mb-0">Documents</h6></div><div class="card-body small"><div v-if="hasDocs" class="vstack gap-2"><a v-if="user.documents?.license_url" :href="user.documents.license_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i>Driver's License</a><a v-if="user.documents?.vehicle_registration_url" :href="user.documents.vehicle_registration_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i>Vehicle Registration</a><a v-if="user.documents?.insurance_url" :href="user.documents.insurance_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-eye me-1"></i>Insurance</a></div><p v-else class="text-body-secondary mb-0">No documents uploaded</p></div></div></div>
        </div>
        <div class="card shadow-sm mb-3"><div class="card-header"><h6 class="card-title mb-0">Recent Deliveries</h6></div><div class="card-body small"><div v-if="user.recent_deliveries?.length" class="vstack gap-1"><router-link v-for="d in user.recent_deliveries" :key="d.uuid" :to="`/admin/orders/${d.uuid}`" class="list-group-item list-group-item-action d-flex justify-content-between px-2 py-1 rounded"><span class="font-monospace small">{{ d.order_number }}</span><span class="text-body-secondary small">{{ d.restaurant }}</span><span class="fw-medium">AED {{ d.earnings || '—' }}</span></router-link></div><p v-else class="text-body-secondary mb-0">No deliveries yet</p></div></div>
      </template>

      <!-- Restaurant Owner Section -->
      <template v-if="user.role === 'restaurant' && user.restaurant">
        <div class="card shadow-sm mb-3"><div class="card-header"><h6 class="card-title mb-0">Restaurant: {{ user.restaurant.name }}</h6></div><div class="card-body small"><div class="row mb-3"><div class="col-6 col-md-3"><small class="text-body-secondary">Status</small><p class="fw-medium mb-0 text-capitalize">{{ formatStatus(user.restaurant.status) }}</p></div><div class="col-6 col-md-3"><small class="text-body-secondary">Cuisine</small><p class="fw-medium mb-0">{{ user.restaurant.cuisine?.join(', ') }}</p></div><div class="col-6 col-md-3"><small class="text-body-secondary">Commission</small><p class="fw-medium mb-0">{{ (user.restaurant.commission * 100).toFixed(0) }}%</p></div><div class="col-6 col-md-3"><small class="text-body-secondary">Accepting Orders</small><p class="fw-medium mb-0" :class="user.restaurant.accepting ? 'text-success' : 'text-danger'">{{ user.restaurant.accepting ? 'Yes' : 'No' }}</p></div></div><div class="row border-top pt-3"><div class="col-4"><small class="text-body-secondary">Total Orders</small><p class="fs-5 fw-bold mb-0">{{ user.stats?.total_orders }}</p></div><div class="col-4"><small class="text-body-secondary">Avg Rating</small><p class="fs-5 fw-bold mb-0">{{ user.stats?.avg_rating }} / 5.0</p></div><div class="col-4"><small class="text-body-secondary">Menu Items</small><p class="fs-5 fw-bold mb-0">{{ user.stats?.menu_items }}</p></div></div></div></div>
      </template>

      <!-- Admin section -->
      <template v-if="user.role === 'admin'">
        <div class="card shadow-sm mb-3"><div class="card-body text-center text-body-secondary small">Admin user — no additional profile data.</div></div>
      </template>

      <!-- Toast -->
      <div v-if="toast.show" class="toast show position-fixed bottom-0 end-0 m-3" :class="toast.error ? 'bg-danger text-white' : 'bg-success text-white'" style="z-index: 1055;">
        <div class="toast-body d-flex gap-2 align-items-center">{{ toast.message }}</div>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">{{ modalTitle }}</h5><button type="button" class="btn-close" @click="showModal = false"></button></div>
            <div class="modal-body"><p class="small text-body-secondary">{{ modalBody }}</p><textarea v-model="reason" class="form-control" rows="2" placeholder="Reason (required)&hellip;"></textarea></div>
            <div class="modal-footer"><button @click="showModal = false" class="btn btn-secondary btn-sm">Cancel</button><button @click="doAction" :disabled="!reason" class="btn btn-sm" :class="modalBtnClass">{{ modalAction }}</button></div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../stores/api';

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const user = ref(null);
const showModal = ref(false);
const modalAction = ref('');
const reason = ref('');
const toast = ref({ show: false, message: '', error: false });
let toastTimer = null;

function showToast(message, error = false) {
  clearTimeout(toastTimer);
  toast.value = { show: true, message, error };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 3500);
}

const modalTitle = computed(() => ({ suspend: 'Suspend User', deactivate: 'Deactivate User' }[modalAction.value] || ''));
const modalBody = computed(() => ({
  suspend: 'The user will be prevented from logging in. Provide a reason.',
  deactivate: 'This permanently disables the account. This cannot be undone. Provide a reason.',
}[modalAction.value] || ''));
const modalBtnClass = computed(() => ({ suspend: 'btn-warning', deactivate: 'btn-danger' }[modalAction.value] || ''));
const hasDocs = computed(() => user.value?.documents && (user.value.documents.license_url || user.value.documents.vehicle_registration_url || user.value.documents.insurance_url));

onMounted(async () => {
  try {
    const { data } = await api.get(`/admin/users/${route.params.uuid}`);
    user.value = data.data;
  } catch (e) { console.error(e); }
  loading.value = false;
});

function suspend() { modalAction.value = 'suspend'; reason.value = ''; showModal.value = true; }
function confirmDeactivate() { modalAction.value = 'deactivate'; reason.value = ''; showModal.value = true; }

async function unsuspend() {
  try {
    await api.post(`/admin/users/${route.params.uuid}/unsuspend`, { reason: 'Admin reactivated.' });
    user.value.status = 'verified';
    showToast('User reactivated successfully.');
  } catch (e) { showToast('Failed to reactivate user.', true); }
}

async function doAction() {
  try {
    const endpoint = modalAction.value === 'suspend' ? 'suspend' : 'deactivate';
    await api.post(`/admin/users/${route.params.uuid}/${endpoint}`, { reason: reason.value });
    user.value.status = modalAction.value === 'suspend' ? 'suspended' : 'deactivated';
    showModal.value = false;
    showToast(`User ${modalAction.value === 'suspend' ? 'suspended' : 'deactivated'} successfully.`);
  } catch (e) { showToast(`Failed to ${modalAction.value} user.`, true); }
}

function roleBadge(r) {
  return { customer: 'bg-primary', restaurant: 'bg-secondary', driver: 'bg-info', admin: 'bg-warning' }[r] || 'bg-secondary';
}
function statusBadge(s) {
  return { pending_verification: 'bg-warning', verified: 'bg-success', active: 'bg-success', rejected: 'bg-danger', suspended: 'bg-warning text-dark', deactivated: 'bg-secondary' }[s] || 'bg-secondary';
}
function formatStatus(s) { return s?.replace(/_/g, ' ') || ''; }
function formatDate(d) { return d ? new Date(d).toLocaleDateString() : ''; }
</script>
