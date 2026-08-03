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
        <button @click="tab = 'pending'" class="nav-link" :class="tab === 'pending' ? 'active' : ''">Pending Verification</button>
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
                <small class="text-body-tertiary">{{ r.created_at }}</small>
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
              <select v-model="statusFilter" @change="fetchRestaurants" class="form-select form-select-sm">
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
                <option value="closed">Closed</option>
              </select>
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
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Name</th><th>Owner</th><th>Cuisine</th><th>Status</th><th>Commission</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="r in restaurants" :key="r.uuid">
                <td class="fw-medium small">{{ r.name }}</td>
                <td class="small">{{ r.owner_name }}</td>
                <td class="small text-body-secondary">{{ r.cuisine?.join(', ') }}</td>
                <td><span class="badge text-capitalize" :class="statusBadge(r.status)">{{ formatStatus(r.status) }}</span></td>
                <td class="small">{{ (r.commission * 100).toFixed(0) }}%</td>
                <td><router-link :to="`/admin/restaurants/${r.uuid}`" class="btn btn-sm btn-outline-warning">View</router-link></td>
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
const rejecting = ref(null); const rejectReason = ref('');
let searchTimer = null;

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

function debounceSearch() { clearTimeout(searchTimer); searchTimer = setTimeout(() => fetchRestaurants(1), 300); }
function goPage(p) { fetchRestaurants(p); }

async function verify(uuid, action) {
  await api.post(`/admin/restaurants/${uuid}/verify`, { action, reason: rejectReason.value });
  await Promise.all([fetchPending(), fetchRestaurants(page.value)]);
}
function rejectPrompt(r) { rejecting.value = r; rejectReason.value = ''; }
async function doReject() { await verify(rejecting.value.uuid, 'reject'); rejecting.value = null; }

watch(tab, (newTab) => {
  if (newTab === 'pending') fetchPending();
  else fetchRestaurants(page.value);
});

function statusBadge(s) {
  return { active:'bg-success', pending_verification:'bg-warning', rejected:'bg-danger', suspended:'bg-warning text-dark', inactive:'bg-secondary', closed:'bg-light text-dark' }[s] || 'bg-secondary';
}
function formatStatus(s) { return s?.replace(/_/g, ' ') || ''; }

onMounted(() => { fetchRestaurants(); fetchPending(); });
</script>
