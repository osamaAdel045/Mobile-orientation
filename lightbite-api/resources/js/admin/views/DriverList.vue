<template>
  <div>
    <LteAppContentHeader title="Driver Management" subtitle="View and manage all drivers">
      <span class="badge bg-secondary fs-6">{{ tab === 'all' ? totalAll : totalPending }} drivers</span>
    </LteAppContentHeader>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button @click="tab = 'all'" class="nav-link" :class="tab === 'all' ? 'active' : ''">All</button>
      </li>
      <li class="nav-item">
        <button @click="tab = 'pending'" class="nav-link" :class="tab === 'pending' ? 'active' : ''">Pending Verification</button>
      </li>
    </ul>

    <!-- Pending Tab -->
    <div v-if="tab === 'pending'">
      <div v-if="loadingP" class="text-center py-5 text-body-secondary">Loading&hellip;</div>
      <div v-else-if="!pending.length" class="card shadow-sm">
        <div class="card-body text-center py-5"><p class="text-body-secondary mb-0">No pending verifications</p></div>
      </div>
      <div v-else class="row g-3">
        <div v-for="d in pending" :key="d.uuid" class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between mb-3">
                <div class="d-flex align-items-center gap-3">
                  <img v-if="d.photo_url" :src="d.photo_url" class="rounded-circle" width="40" height="40" style="object-fit:cover;" />
                  <div v-else class="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style="width:40px;height:40px;font-weight:600;">{{ d.name?.charAt(0) }}</div>
                  <div>
                    <h5 class="card-title mb-0">{{ d.name }}</h5>
                    <small class="text-body-secondary">{{ d.email }}</small>
                  </div>
                </div>
                <small class="text-body-tertiary">{{ d.created_at }}</small>
              </div>
              <div class="row small mb-3">
                <div class="col-sm-6"><span class="text-body-secondary">Phone:</span> {{ d.phone }}</div>
              </div>
              <div v-if="d.license_url || d.vehicle_registration_url || d.insurance_url" class="d-flex gap-2 mb-3 small">
                <a v-if="d.license_url" :href="d.license_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-file-text me-1"></i>License</a>
                <a v-if="d.vehicle_registration_url" :href="d.vehicle_registration_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-truck me-1"></i>Vehicle</a>
                <a v-if="d.insurance_url" :href="d.insurance_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-shield-check me-1"></i>Insurance</a>
              </div>
              <div class="d-flex gap-2">
                <button @click="verifyD(d.uuid, 'approve')" class="btn btn-success btn-sm flex-fill">Approve</button>
                <button @click="rejectPrompt(d)" class="btn btn-outline-danger btn-sm flex-fill">Reject</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Reject modal -->
      <div v-if="rejecting" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Reject {{ rejecting.name }}?</h5><button type="button" class="btn-close" @click="rejecting=null"></button></div>
            <div class="modal-body"><textarea v-model="rejectReason" class="form-control" rows="3" placeholder="Reason&hellip;"></textarea></div>
            <div class="modal-footer"><button @click="rejecting=null" class="btn btn-secondary btn-sm">Cancel</button><button @click="doRejectD" class="btn btn-danger btn-sm">Reject</button></div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Tab -->
    <div v-if="tab === 'all'">
      <div class="card shadow-sm mb-3">
        <div class="card-body py-2">
          <div class="row g-2 align-items-center">
            <div class="col-sm-6">
              <input v-model="search" @input="debounceSearch" placeholder="Search by name, email, phone&hellip;" class="form-control form-control-sm" />
            </div>
            <div class="col-sm-3">
              <select v-model="statusFilter" @change="fetchDrivers(1)" class="form-select form-select-sm">
                <option value="">All Statuses</option>
                <option value="verified">Verified</option>
                <option value="pending_verification">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
            <div class="col-sm-3">
              <select v-model="onlineFilter" @change="fetchDrivers(1)" class="form-select form-select-sm">
                <option value="">All Availability</option>
                <option value="online">Online now</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5 text-body-secondary">Loading&hellip;</div>
      <div v-else-if="!drivers.length" class="card shadow-sm">
        <div class="card-body text-center py-5"><p class="text-body-secondary mb-0">No drivers found</p></div>
      </div>
      <div v-else class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr><th>Name</th><th>Email</th><th>Status</th><th>Availability</th><th>Active Delivery</th><th>Deliveries</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="d in drivers" :key="d.uuid">
                <td class="fw-medium small">{{ d.name }}</td>
                <td class="small text-body-secondary">{{ d.email }}</td>
                <td><span class="badge text-capitalize" :class="statusBadge(d.status)">{{ formatStatus(d.status) }}</span></td>
                <td>
                  <span class="d-inline-flex align-items-center gap-1">
                    <span class="realtime-dot" :class="d.is_online ? 'realtime-connected' : 'realtime-disconnected'"></span>
                    <span class="small" :class="d.is_online ? 'text-success' : 'text-body-secondary'">{{ d.is_online ? 'Online' : 'Offline' }}</span>
                  </span>
                </td>
                <td>
                  <span v-if="d.active_delivery > 0" class="badge bg-primary"><i class="bi bi-bicycle me-1"></i>{{ d.active_delivery }} active</span>
                  <span v-else class="small text-body-secondary">—</span>
                </td>
                <td class="small">{{ d.deliveries }}</td>
                <td><router-link :to="`/admin/drivers/${d.uuid}`" class="btn btn-sm btn-outline-warning">View</router-link></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="lastPage > 1" class="d-flex justify-content-between align-items-center mt-3 small">
        <span class="text-body-secondary">Page {{ page }} of {{ lastPage }}</span>
        <div class="btn-group btn-group-sm">
          <button @click="goPage(page-1)" :disabled="page<=1" class="btn btn-outline-secondary">Prev</button>
          <button @click="goPage(page+1)" :disabled="page>=lastPage" class="btn btn-outline-secondary">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '../stores/api';

const tab = ref('all');
const drivers = ref([]); const pending = ref([]);
const totalAll = ref(0); const totalPending = ref(0);
const page = ref(1); const lastPage = ref(1);
const search = ref(''); const statusFilter = ref(''); const onlineFilter = ref('');
const loading = ref(true); const loadingP = ref(true);
const rejecting = ref(null); const rejectReason = ref('');
let searchTimer = null;

async function fetchDrivers(p = 1) {
  page.value = p; loading.value = true;
  const params = { page: p };
  if (search.value) params.search = search.value;
  if (statusFilter.value) params.status = statusFilter.value;
  if (onlineFilter.value) params.online = onlineFilter.value;
  try {
    const { data } = await api.get('/admin/drivers', { params });
    drivers.value = data.data.data || [];
    totalAll.value = data.data.total || 0;
    lastPage.value = data.data.last_page || 1;
  } catch(e) { console.error(e); }
  loading.value = false;
}
async function fetchPending() {
  loadingP.value = true;
  try {
    const { data } = await api.get('/admin/drivers/pending');
    pending.value = data.data || [];
    totalPending.value = (data.data || []).length;
  } catch(e) { console.error(e); }
  loadingP.value = false;
}
function debounceSearch() { clearTimeout(searchTimer); searchTimer = setTimeout(() => fetchDrivers(1), 300); }
function goPage(p) { fetchDrivers(p); }
async function verifyD(uuid, action) {
  await api.post(`/admin/drivers/${uuid}/verify`, { action, reason: rejectReason.value });
  await Promise.all([fetchPending(), fetchDrivers(page.value)]);
}
function rejectPrompt(d) { rejecting.value = d; rejectReason.value = ''; }
async function doRejectD() { await verifyD(rejecting.value.uuid, 'reject'); rejecting.value = null; }
watch(tab, (newTab) => {
  if (newTab === 'pending') fetchPending();
  else fetchDrivers(page.value);
});
function statusBadge(s) {
  return { verified:'bg-success', pending_verification:'bg-warning', suspended:'bg-warning text-dark', deactivated:'bg-secondary' }[s] || 'bg-secondary';
}
function formatStatus(s) { return s?.replace(/_/g, ' ') || ''; }
onMounted(() => { fetchDrivers(); fetchPending(); });
</script>
