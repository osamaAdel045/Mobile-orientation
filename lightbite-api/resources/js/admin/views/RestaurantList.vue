<template>
  <div>
    <LteAppContentHeader title="Restaurant Management" subtitle="View, manage, and configure all restaurants">
      <span class="badge bg-secondary fs-6">{{ tab === 'all' ? totalAll : totalPending }} restaurants</span>
    </LteAppContentHeader>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <button @click="tab = 'all'" class="nav-link" :class="tab === 'all' ? 'active' : ''">All</button>
      </li>
      <li class="nav-item">
        <button @click="tab = 'pending'" class="nav-link" :class="tab === 'pending' ? 'active' : ''">
          Pending Verification <span v-if="totalPending" class="badge bg-warning text-dark ms-1">{{ totalPending }}</span>
        </button>
      </li>
    </ul>

    <!-- Pending Verification Tab -->
    <div v-if="tab === 'pending'">
      <div v-if="loadingP" class="text-center py-5 text-body-secondary">Loading&hellip;</div>
      <div v-else-if="!pending.length" class="card shadow-sm">
        <div class="card-body text-center py-5"><p class="text-body-secondary mb-0">No pending verifications</p></div>
      </div>
      <div v-else class="row g-3">
        <div v-for="r in pending" :key="r.uuid" class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex flex-column flex-md-row justify-content-between mb-3">
                <div>
                  <h5 class="card-title mb-1">{{ r.name }}</h5>
                  <p class="text-body-secondary small mb-0">{{ r.cuisine_types?.join(', ') }} &middot; {{ r.owner_name }}</p>
                </div>
                <small class="text-body-tertiary">{{ formatDate(r.created_at) }}</small>
              </div>
              <div class="row small mb-3">
                <div class="col-sm-6"><span class="text-body-secondary">Address:</span> {{ r.address }}</div>
                <div class="col-sm-6"><span class="text-body-secondary">Phone:</span> {{ r.phone }}</div>
              </div>
              <div v-if="r.trade_license_url || r.food_safety_cert_url" class="d-flex gap-3 mb-3 small">
                <a v-if="r.trade_license_url" :href="r.trade_license_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-file-text me-1"></i>Trade License</a>
                <a v-if="r.food_safety_cert_url" :href="r.food_safety_cert_url" target="_blank" class="btn btn-sm btn-outline-primary"><i class="bi bi-shield-check me-1"></i>Food Safety Cert</a>
              </div>
              <div class="d-flex gap-2">
                <button @click="verify(r.uuid, 'approve')" class="btn btn-success btn-sm flex-fill">Approve</button>
                <button @click="rejectPrompt(r)" class="btn btn-outline-danger btn-sm flex-fill">Reject</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- All Restaurants Tab -->
    <div v-if="tab === 'all'">
      <div class="card shadow-sm mb-3">
        <div class="card-body py-2">
          <div class="row g-2 align-items-center">
            <div class="col-sm-6">
              <input v-model="search" @input="debounceSearch" placeholder="Search by name or cuisine&hellip;" class="form-control form-control-sm" />
            </div>
            <div class="col-sm-4">
              <select v-model="statusFilter" @change="fetchRestaurants(1)" class="form-select form-select-sm">
                <option value="">All Statuses</option>
                <option v-for="s in statusOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
              </select>
            </div>
            <div class="col-sm-2 d-flex justify-content-end">
              <button @click="refresh" :disabled="refreshing" class="btn btn-sm btn-outline-secondary" title="Refresh"><i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': refreshing }"></i></button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-5 text-body-secondary">Loading&hellip;</div>
      <div v-else-if="!restaurants.length" class="card shadow-sm">
        <div class="card-body text-center py-5"><p class="text-body-secondary mb-0">No restaurants found</p></div>
      </div>
      <div v-else class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr><th>Name</th><th>Owner</th><th>Cuisine</th><th>Status</th><th>Accepting</th><th>Commission</th><th>Actions</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in restaurants" :key="r.uuid">
                <td class="fw-medium small">
                  <router-link :to="`/admin/restaurants/${r.uuid}`" class="text-decoration-none">{{ r.name }}</router-link>
                </td>
                <td class="small">{{ r.owner_name }}</td>
                <td class="small text-body-secondary">{{ r.cuisine?.join(', ') }}</td>
                <td><span class="badge text-capitalize" :class="statusBadge(r.status)">{{ formatStatus(r.status) }}</span></td>
                <td>
                  <button class="btn btn-sm px-2" :class="r.accepting ? 'btn-outline-success' : 'btn-outline-secondary'" @click="toggleAccepting(r)" :disabled="r.status !== 'active'" :title="r.accepting ? 'Stop accepting orders' : 'Accept orders'">
                    <i class="bi" :class="r.accepting ? 'bi-toggle-on text-success' : 'bi-toggle-off'"></i>
                    <span class="small ms-1">{{ r.accepting ? 'Open' : 'Closed' }}</span>
                  </button>
                </td>
                <td class="small">{{ (r.commission * 100).toFixed(0) }}%</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button v-if="r.status === 'suspended'" @click="quickSuspend(r, false)" class="btn btn-outline-success" title="Reactivate"><i class="bi bi-check-lg"></i></button>
                    <button v-else-if="['active', 'inactive'].includes(r.status)" @click="quickSuspend(r, true)" class="btn btn-outline-warning" title="Suspend"><i class="bi bi-pause"></i></button>
                    <router-link :to="`/admin/restaurants/${r.uuid}`" class="btn btn-outline-warning">View</router-link>
                  </div>
                </td>
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

    <!-- Reject Modal -->
    <div v-if="rejecting" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">Reject {{ rejecting.name }}?</h5><button type="button" class="btn-close" @click="rejecting=null"></button></div>
          <div class="modal-body"><textarea v-model="rejectReason" class="form-control" rows="3" placeholder="Reason&hellip;"></textarea></div>
          <div class="modal-footer"><button @click="rejecting=null" class="btn btn-secondary btn-sm">Cancel</button><button @click="doReject" class="btn btn-danger btn-sm">Reject</button></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import api from '../stores/api';

const tab = ref('all');
const restaurants = ref([]);
const pending = ref([]);
const total = ref(0); const page = ref(1); const lastPage = ref(1);
const totalAll = ref(0); const totalPending = ref(0);
const search = ref(''); const statusFilter = ref('');
const loading = ref(true); const loadingP = ref(true);
const refreshing = ref(false);
const rejecting = ref(null); const rejectReason = ref('');
let searchTimer = null;

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'closed', label: 'Closed' },
];

async function fetchRestaurants(p = 1) {
  page.value = p; loading.value = true;
  const params = { page: p };
  if (search.value) params.search = search.value;
  if (statusFilter.value) params.status = statusFilter.value;
  try {
    const { data } = await api.get('/admin/restaurants', { params });
    restaurants.value = data.data.data || [];
    totalAll.value = data.data.total || 0;
    lastPage.value = data.data.last_page || 1;
  } catch(e) { console.error(e); }
  loading.value = false;
}

async function fetchPending() {
  loadingP.value = true;
  try {
    const { data } = await api.get('/admin/restaurants/pending');
    pending.value = data.data || [];
    totalPending.value = (data.data || []).length;
  } catch(e) { console.error(e); }
  loadingP.value = false;
}

async function refresh() {
  refreshing.value = true;
  await Promise.all([fetchRestaurants(page.value), fetchPending()]);
  refreshing.value = false;
}

function debounceSearch() { clearTimeout(searchTimer); searchTimer = setTimeout(() => fetchRestaurants(1), 300); }
function goPage(p) { fetchRestaurants(p); }

async function verify(uuid, action) {
  try {
    await api.post(`/admin/restaurants/${uuid}/verify`, { action, reason: rejectReason.value });
  } catch (e) { console.error(e); }
  await Promise.all([fetchPending(), fetchRestaurants(page.value)]);
}
function rejectPrompt(r) { rejecting.value = r; rejectReason.value = ''; }
async function doReject() { await verify(rejecting.value.uuid, 'reject'); rejecting.value = null; }

async function toggleAccepting(r) {
  try {
    await api.patch(`/admin/restaurants/${r.uuid}`, { is_accepting_orders: !r.accepting });
    r.accepting = !r.accepting;
  } catch (e) { console.error(e); alert('Failed to update accepting status.'); }
}

async function quickSuspend(r, suspend) {
  if (suspend && !confirm(`Suspend ${r.name}?`)) return;
  try {
    if (suspend) await api.post(`/admin/restaurants/${r.uuid}/suspend`);
    else await api.post(`/admin/restaurants/${r.uuid}/unsuspend`);
    await fetchRestaurants(page.value);
  } catch (e) { console.error(e); alert('Failed to update status.'); }
}

watch(tab, (newTab) => {
  if (newTab === 'pending') fetchPending();
  else fetchRestaurants(page.value);
});

function statusBadge(s) {
  return { active:'bg-success', pending_verification:'bg-warning text-dark', rejected:'bg-danger', suspended:'bg-warning text-dark', inactive:'bg-secondary', closed:'bg-light text-dark', permanently_closed:'bg-dark' }[s] || 'bg-secondary';
}
function formatStatus(s) { return s?.replace(/_/g, ' ') || ''; }
function formatDate(d) { return d ? new Date(d).toLocaleString() : ''; }

onMounted(() => { fetchRestaurants(); fetchPending(); });
</script>
