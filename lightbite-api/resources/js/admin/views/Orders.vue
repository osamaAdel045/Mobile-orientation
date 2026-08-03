<template>
  <div>
    <LteAppContentHeader title="Order Management" subtitle="View, search, and manage all orders">
      <span class="badge bg-secondary fs-6">{{ total }} orders</span>
    </LteAppContentHeader>

    <div class="card shadow-sm mb-3">
      <div class="card-body py-2">
        <div class="row g-2 align-items-center">
          <div class="col-sm-4">
            <input v-model="search" @input="debounceSearch" placeholder="Search by order # or customer..." class="form-control form-control-sm" />
          </div>
          <div class="col-sm-2">
            <select v-model="statusFilter" @change="fetchOrders" class="form-select form-select-sm">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option><option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option><option value="ready">Ready</option>
              <option value="assigned">Assigned</option><option value="picked_up">Picked Up</option>
              <option value="delivering">Delivering</option><option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option><option value="rejected">Rejected</option>
              <option value="disputed">Disputed</option><option value="refunded">Refunded</option>
              <option value="expired">Expired</option>
            </select>
          </div>
          <div class="col-sm-2">
            <input type="date" v-model="dateFrom" @change="fetchOrders" class="form-control form-control-sm" />
          </div>
          <div class="col-auto"><small class="text-body-secondary">to</small></div>
          <div class="col-sm-2">
            <input type="date" v-model="dateTo" @change="fetchOrders" class="form-control form-control-sm" />
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="card shadow-sm">
      <div class="card-body placeholder-glow">
        <div v-for="i in 6" :key="i" class="d-flex gap-3 py-2 border-bottom">
          <span class="placeholder col-2"></span><span class="placeholder col-2"></span><span class="placeholder col-2"></span><span class="placeholder col-3"></span><span class="placeholder col-1"></span>
        </div>
      </div>
    </div>

    <div v-else-if="!orders.length" class="card shadow-sm">
      <div class="card-body text-center py-5"><p class="text-body-secondary mb-0">No orders found</p></div>
    </div>

    <div v-else class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Order #</th><th>Customer</th><th>Restaurant</th><th>Driver</th><th>Status</th><th>Total</th><th>Date</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.uuid">
              <td class="font-monospace small">{{ o.order_number }}</td>
              <td class="small">{{ o.customer_name }}</td>
              <td class="small">{{ o.restaurant_name }}</td>
              <td class="small">{{ o.driver_name || '—' }}</td>
              <td><span class="badge text-capitalize" :class="statusBadge(o.status)">{{ o.status }}</span></td>
              <td class="small fw-medium">{{ o.total }}</td>
              <td class="small text-body-secondary">{{ formatDate(o.created_at) }}</td>
              <td><router-link :to="`/admin/orders/${o.uuid}`" class="btn btn-sm btn-outline-warning">View</router-link></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

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
const orders = ref([]);
const total = ref(0);
const page = ref(1);
const lastPage = ref(1);
const search = ref('');
const statusFilter = ref('');
const dateFrom = ref('');
const dateTo = ref('');
let searchTimer = null;

async function fetchOrders(p = 1) {
  page.value = p;
  const params = { page: p, per_page: 20 };
  if (search.value) params.search = search.value;
  if (statusFilter.value) params.status = statusFilter.value;
  if (dateFrom.value) params.date_from = dateFrom.value;
  if (dateTo.value) params.date_to = dateTo.value;

  try {
    const { data } = await api.get('/admin/orders', { params });
    orders.value = data.data || [];
    total.value = data.total || 0;
    lastPage.value = data.last_page || 1;
  } catch (e) { console.error(e); }
  loading.value = false;
}

function debounceSearch() { clearTimeout(searchTimer); searchTimer = setTimeout(() => fetchOrders(1), 300); }
function goPage(p) { fetchOrders(p); }

function statusBadge(s) {
  return {
    pending: 'bg-warning', confirmed: 'bg-info',
    preparing: 'bg-info text-dark', ready: 'bg-primary',
    assigned: 'bg-info', picked_up: 'bg-primary',
    delivering: 'bg-warning text-dark', delivered: 'bg-success',
    cancelled: 'bg-danger', rejected: 'bg-danger',
    disputed: 'bg-danger', refunded: 'bg-secondary',
    expired: 'bg-light text-dark',
  }[s] || 'bg-secondary';
}

function formatDate(d) { return d ? new Date(d).toLocaleDateString() : ''; }

onMounted(() => fetchOrders());
</script>
