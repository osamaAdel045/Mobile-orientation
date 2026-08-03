<template>
  <div>
    <LteAppContentHeader title="User Management" subtitle="View, search, and manage all platform users">
      <span class="badge bg-secondary fs-6">{{ total }} users</span>
    </LteAppContentHeader>

    <!-- Filters -->
    <div class="card shadow-sm mb-3">
      <div class="card-body py-2">
        <div class="row g-2 align-items-center">
          <div class="col-sm-4">
            <input v-model="search" @input="debounceSearch" placeholder="Search name, email, phone..." class="form-control form-control-sm" />
          </div>
          <div class="col-sm-3">
            <select v-model="roleFilter" @change="fetchUsers" class="form-select form-select-sm">
              <option value="">All Roles</option>
              <option value="customer">Customers</option>
              <option value="restaurant">Restaurants</option>
              <option value="driver">Drivers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
          <div class="col-sm-3">
            <select v-model="statusFilter" @change="fetchUsers" class="form-select form-select-sm">
              <option value="">All Statuses</option>
              <option value="pending_verification">Pending</option>
              <option value="verified">Verified</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deactivated">Deactivated</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="card shadow-sm">
      <div class="card-body placeholder-glow">
        <div v-for="i in 6" :key="i" class="d-flex align-items-center gap-3 py-2 border-bottom">
          <span class="placeholder rounded-circle" style="width:32px;height:32px;"></span>
          <span class="placeholder col-3"></span>
          <span class="placeholder col-2"></span>
          <span class="placeholder col-2"></span>
          <span class="placeholder col-2"></span>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!users.length" class="card shadow-sm">
      <div class="card-body text-center py-5">
        <p class="text-body-secondary mb-0">No users found</p>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>User</th><th>Role</th><th>Status</th><th>Phone</th><th>Joined</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.uuid">
              <td>
                <div class="d-flex align-items-center gap-2">
                  <img v-if="u.photo_url" :src="u.photo_url" class="rounded-circle" width="32" height="32" style="object-fit:cover;" />
                  <div v-else class="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white" style="width:32px;height:32px;font-size:12px;font-weight:600;">{{ u.name?.charAt(0) }}</div>
                  <div>
                    <p class="mb-0 fw-medium small">{{ u.name }}</p>
                    <small class="text-body-secondary">{{ u.email }}</small>
                  </div>
                </div>
              </td>
              <td><span class="badge" :class="roleBadge(u.role)">{{ u.role }}</span></td>
              <td><span class="badge" :class="statusBadge(u.status)">{{ formatStatus(u.status) }}</span></td>
              <td class="small">{{ u.phone || '—' }}</td>
              <td class="small text-body-secondary">{{ formatDate(u.created_at) }}</td>
              <td>
                <router-link :to="`/admin/users/${u.uuid}`" class="btn btn-sm btn-outline-warning">View</router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="lastPage > 1" class="d-flex justify-content-between align-items-center mt-3 small">
      <span class="text-body-secondary">Page {{ page }} of {{ lastPage }}</span>
      <div class="btn-group btn-group-sm">
        <button @click="goPage(page - 1)" :disabled="page <= 1" class="btn btn-outline-secondary">Prev</button>
        <button @click="goPage(page + 1)" :disabled="page >= lastPage" class="btn btn-outline-secondary">Next</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../stores/api';

const loading = ref(true);
const users = ref([]);
const total = ref(0);
const page = ref(1);
const lastPage = ref(1);
const search = ref('');
const roleFilter = ref('');
const statusFilter = ref('');
let searchTimer = null;

async function fetchUsers(p = 1) {
  page.value = p;
  const params = { page: p, per_page: 20 };
  if (search.value) params.search = search.value;
  if (roleFilter.value) params.role = roleFilter.value;
  if (statusFilter.value) params.status = statusFilter.value;

  try {
    const { data } = await api.get('/admin/users', { params });
    // Paginator serializes with flat keys: { data: [...], current_page, total, last_page, ... }
    users.value = data.data || [];
    total.value = data.total || 0;
    lastPage.value = data.last_page || 1;
  } catch (e) {
    console.error('Failed to fetch users:', e);
  }
  loading.value = false;
}

function debounceSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => fetchUsers(1), 300);
}

function goPage(p) { fetchUsers(p); }

function roleBadge(role) {
  return {
    customer: 'bg-primary', restaurant: 'bg-secondary',
    driver: 'bg-info', admin: 'bg-warning',
  }[role] || 'bg-secondary';
}

function statusBadge(status) {
  return {
    pending_verification: 'bg-warning', verified: 'bg-success',
    active: 'bg-success', rejected: 'bg-danger',
    suspended: 'bg-warning text-dark', deactivated: 'bg-secondary',
  }[status] || 'bg-secondary';
}

function formatStatus(s) { return s?.replace(/_/g, ' ') || ''; }
function formatDate(d) { return d ? new Date(d).toLocaleDateString() : ''; }

onMounted(() => fetchUsers());
</script>
