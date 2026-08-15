<template>
  <div>
    <LteAppContentHeader title="Audit Log" subtitle="Complete history of all admin actions">
      <span class="badge bg-secondary fs-6">{{ total }} entries</span>
    </LteAppContentHeader>

    <div class="card shadow-sm mb-3">
      <div class="card-body py-2">
        <div class="row g-2 align-items-center">
          <div class="col-sm-3">
            <input v-model="search" @input="debounceSearch" placeholder="Search action / resource&hellip;" class="form-control form-control-sm" />
          </div>
          <div class="col-sm-3">
            <select v-model="actionFilter" @change="fetchLogs(1)" class="form-select form-select-sm">
              <option value="">All Actions</option>
              <option value="user.">User Actions</option>
              <option value="restaurant.">Restaurant Actions</option>
              <option value="driver.">Driver Actions</option>
              <option value="dispute.">Dispute Actions</option>
              <option value="order.">Order Actions</option>
              <option value="settings">Settings</option>
              <option value="admin.">Admin Role Actions</option>
            </select>
          </div>
          <div class="col-sm-3">
            <input v-model="adminFilter" @input="debounceSearch" placeholder="Filter by admin user&hellip;" class="form-control form-control-sm" />
          </div>
          <div class="col-sm-3 d-flex gap-2">
            <div class="flex-grow-1"><input type="date" v-model="dateFrom" @change="fetchLogs(1)" class="form-control form-control-sm" /></div>
            <div class="flex-grow-1"><input type="date" v-model="dateTo" @change="fetchLogs(1)" class="form-control form-control-sm" /></div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading audit log&hellip;</div>
    <div v-else-if="!logs.length" class="card shadow-sm">
      <div class="card-body text-center py-5"><p class="text-body-secondary mb-0">No audit entries found</p></div>
    </div>
    <div v-else class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light"><tr><th>Action</th><th>Admin</th><th>Resource</th><th>Details</th><th>IP</th><th>Time</th></tr></thead>
          <tbody>
            <tr v-for="l in logs" :key="l.id">
              <td><span class="badge" :class="actionBadge(l.action)">{{ l.action }}</span></td>
              <td class="small fw-medium">{{ l.user }}</td>
              <td class="small text-body-secondary">{{ l.resource_type }} #{{ l.resource_id }}</td>
              <td class="small text-body-secondary text-truncate" style="max-width:200px;">{{ formatDetails(l.new_values) }}</td>
              <td class="font-monospace small text-body-tertiary">{{ l.ip_address }}</td>
              <td class="small text-body-secondary">{{ formatDate(l.created_at) }}</td>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../stores/api';

const loading = ref(true); const logs = ref([]);
const total = ref(0); const page = ref(1); const lastPage = ref(1);
const search = ref(''); const actionFilter = ref(''); const adminFilter = ref('');
const dateFrom = ref(''); const dateTo = ref('');
let searchTimer = null;

async function fetchLogs(p = 1) {
  page.value = p; loading.value = true;
  const params = { page: p };
  if (search.value) params.search = search.value;
  if (actionFilter.value) params.action = actionFilter.value;
  if (adminFilter.value) params.admin = adminFilter.value;
  if (dateFrom.value) params.date_from = dateFrom.value;
  if (dateTo.value) params.date_to = dateTo.value;
  try {
    const { data } = await api.get('/admin/audit-logs', { params });
    logs.value = data.data.data || [];
    total.value = data.data.total || 0;
    lastPage.value = data.data.last_page || 1;
  } catch(e) { console.error(e); }
  loading.value = false;
}

function debounceSearch() { clearTimeout(searchTimer); searchTimer = setTimeout(() => fetchLogs(1), 300); }
function goPage(p) { fetchLogs(p); }

function actionBadge(a) {
  if (a?.startsWith('user.suspended')) return 'bg-warning';
  if (a?.startsWith('user.deactivated')) return 'bg-danger';
  if (a?.startsWith('user.unsuspended')) return 'bg-success';
  if (a?.startsWith('restaurant.')) return 'bg-secondary';
  if (a?.startsWith('driver.')) return 'bg-info';
  if (a?.startsWith('dispute.')) return 'bg-danger';
  if (a?.startsWith('order.')) return 'bg-primary';
  if (a?.startsWith('settings')) return 'bg-secondary';
  return 'bg-secondary';
}
function formatDetails(v) {
  if (!v) return '—';
  try { return JSON.stringify(v).substring(0, 80); } catch { return String(v).substring(0, 80); }
}
function formatDate(d) { return d ? new Date(d).toLocaleString() : ''; }

onMounted(() => fetchLogs());
</script>
