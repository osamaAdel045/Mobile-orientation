<template>
  <div>
    <LteAppContentHeader title="Order Management" subtitle="Live order board — status updates stream in over WebSocket">
      <div class="d-flex align-items-center gap-2">
        <span class="badge" :class="realtimeBadge">{{ realtimeLabel }}</span>
        <span class="badge bg-secondary fs-6">{{ total }} orders</span>
        <span v-if="stuckCount" class="badge bg-danger" title="Orders stuck in the same status for more than 10 minutes">
          <i class="bi bi-exclamation-triangle me-1"></i>{{ stuckCount }} stuck
        </span>
        <button @click="manualRefresh" :disabled="refreshing" class="btn btn-sm btn-outline-secondary" title="Refresh now">
          <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': refreshing }"></i>
        </button>
      </div>
    </LteAppContentHeader>

    <div class="card shadow-sm mb-3">
      <div class="card-body py-2">
        <div class="row g-2 align-items-end">
          <div class="col-sm-4">
            <label class="form-label small mb-1">Search</label>
            <input v-model="search" @input="debounceSearch" placeholder="Order #, customer, restaurant&hellip;" class="form-control form-control-sm" />
          </div>
          <div class="col-sm-2">
            <label class="form-label small mb-1">Status</label>
            <select v-model="statusFilter" @change="fetchOrders(1)" class="form-select form-select-sm">
              <option value="">All Statuses</option>
              <option v-for="s in statuses" :key="s.value" :value="s.value">{{ s.label }}</option>
            </select>
          </div>
          <div class="col-sm-3">
            <label class="form-label small mb-1">Restaurant</label>
            <input v-model="restaurantFilter" @input="debounceSearch" placeholder="Filter by restaurant&hellip;" class="form-control form-control-sm" />
          </div>
          <div class="col-sm-3 d-flex gap-2 align-items-end">
            <div class="flex-grow-1">
              <label class="form-label small mb-1">Date from</label>
              <input type="date" v-model="dateFrom" @change="fetchOrders(1)" class="form-control form-control-sm" />
            </div>
            <div class="flex-grow-1">
              <label class="form-label small mb-1">Date to</label>
              <input type="date" v-model="dateTo" @change="fetchOrders(1)" class="form-control form-control-sm" />
            </div>
          </div>
        </div>

        <!-- Batch actions bar -->
        <div v-if="selected.length" class="d-flex align-items-center gap-2 mt-3 pt-2 border-top">
          <span class="small fw-medium">{{ selected.length }} selected</span>
          <button @click="batchCancel" :disabled="!batchCancellable.length" class="btn btn-sm btn-outline-danger" title="Cancel & refund all selected cancellable orders">
            <i class="bi bi-x-circle me-1"></i>Cancel &amp; Refund Selected
          </button>
          <button @click="selected = []" class="btn btn-sm btn-outline-secondary">Clear</button>
          <small v-if="!batchCancellable.length" class="text-body-tertiary">Selected orders can't be cancelled</small>
        </div>
      </div>
    </div>

    <div v-if="loading" class="card shadow-sm">
      <div class="card-body placeholder-glow">
        <div v-for="i in 6" :key="i" class="d-flex gap-3 py-2 border-bottom">
          <span class="placeholder col-1"></span><span class="placeholder col-2"></span><span class="placeholder col-2"></span><span class="placeholder col-2"></span><span class="placeholder col-2"></span><span class="placeholder col-1"></span>
        </div>
      </div>
    </div>

    <div v-else-if="!orders.length" class="card shadow-sm">
      <div class="card-body text-center py-5">
        <p class="text-body-secondary mb-0">No orders found</p>
        <small v-if="realtimeStatus === 'disconnected'" class="text-body-tertiary">Realtime offline — new orders will appear here once the socket reconnects.</small>
      </div>
    </div>

    <div v-else class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0 align-middle">
          <thead class="table-light">
            <tr>
              <th style="width:36px;"><input type="checkbox" class="form-check-input" :checked="allSelected" @change="toggleAll" /></th>
              <th>Order #</th><th>Customer</th><th>Restaurant</th><th>Driver</th><th>Status</th><th>In status</th><th>Total</th><th>Date</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in orders" :key="o.uuid" :class="{ 'table-warning': selected.includes(o.uuid), 'row-flash': recentlyUpdated.has(o.uuid), 'table-danger row-stuck': isStuck(o) }">
              <td><input type="checkbox" class="form-check-input" :value="o.uuid" v-model="selected" /></td>
              <td class="font-monospace small">{{ o.order_number }}</td>
              <td class="small">{{ o.customer_name }}</td>
              <td class="small">{{ o.restaurant_name }}</td>
              <td class="small">
                <template v-if="o.driver_name"><i class="bi bi-bicycle me-1 text-primary"></i>{{ o.driver_name }}</template>
                <span v-else class="text-body-tertiary">—</span>
              </td>
              <td>
                <span class="badge text-capitalize" :class="statusBadge(o.status)">{{ o.status }}</span>
                <span v-if="isStuck(o)" class="badge bg-danger ms-1" title="No status change in over 10 minutes">
                  <i class="bi bi-hourglass-split me-1"></i>{{ stuckMinutes(o) }}m
                </span>
              </td>
              <td class="small text-body-secondary">{{ statusMinutes(o) }}m</td>
              <td class="small fw-medium">AED {{ o.total }}</td>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import api from '../stores/api';
import { realtimeStatus, privateAdmin } from '../echo';

const loading = ref(true);
const refreshing = ref(false);
const orders = ref([]);
const total = ref(0);
const page = ref(1);
const lastPage = ref(1);
const search = ref('');
const statusFilter = ref('');
const restaurantFilter = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const selected = ref([]);
let searchTimer = null;
let pollTimer = null;
let refetchTimer = null;
let adminChannel = null;

const recentlyUpdated = ref(new Set());
let updateTimers = {};

const ACTIVE = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivering'];

const realtimeLabel = computed(() => ({
  connecting: 'Live: connecting…',
  connected: 'Live',
  disconnected: 'Live: offline (polling)',
  error: 'Live: error (polling)',
}[realtimeStatus.value] || 'Live: connecting…'));

const realtimeBadge = computed(() => ({
  connected: 'bg-success',
  connecting: 'bg-warning text-dark',
  disconnected: 'bg-secondary',
  error: 'bg-danger',
}[realtimeStatus.value] || 'bg-warning text-dark'));

const stuckCount = computed(() => orders.value.filter(isStuck).length);

const statuses = [
  { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' },
  { value: 'preparing', label: 'Preparing' }, { value: 'ready', label: 'Ready' },
  { value: 'assigned', label: 'Assigned' }, { value: 'picked_up', label: 'Picked Up' },
  { value: 'delivering', label: 'Delivering' }, { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' }, { value: 'rejected', label: 'Rejected' },
  { value: 'disputed', label: 'Disputed' }, { value: 'refunded', label: 'Refunded' },
  { value: 'expired', label: 'Expired' },
];

const allSelected = computed(() => orders.value.length > 0 && selected.value.length === orders.value.length);
const batchCancellable = computed(() => selected.value.filter(uuid => {
  const o = orders.value.find(x => x.uuid === uuid);
  return o && ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status);
}));

// ─── Stuck-order detection ───────────────────────────────
// An order is "stuck" when it has been in an active status for more than
// 10 minutes without a status change. status_at comes from the latest
// OrderStatusLog entry (falling back to updated_at) supplied by the API.
const STUCK_MINUTES = 10;

function statusMinutes(o) {
  const at = o.status_at || o.created_at;
  if (!at) return 0;
  const ms = Date.now() - new Date(at).getTime();
  return Math.max(0, Math.floor(ms / 60000));
}

function isStuck(o) {
  return ACTIVE.includes(o.status) && statusMinutes(o) > STUCK_MINUTES;
}

function stuckMinutes(o) {
  return statusMinutes(o);
}

// ─── Realtime handlers ───────────────────────────────────
function markUpdated(uuid) {
  recentlyUpdated.value.add(uuid);
  recentlyUpdated.value = new Set(recentlyUpdated.value);
  clearTimeout(updateTimers[uuid]);
  updateTimers[uuid] = setTimeout(() => {
    const next = new Set(recentlyUpdated.value);
    next.delete(uuid);
    recentlyUpdated.value = next;
    delete updateTimers[uuid];
  }, 2600);
}

function onOrderUpdate(e) {
  const idx = orders.value.findIndex(o => o.uuid === e.order_uuid);
  const fromEmpty = !e.from_status; // order just created
  const activeNow = ACTIVE.includes(e.to_status);

  if (idx >= 0) {
    orders.value[idx] = {
      ...orders.value[idx],
      status: e.to_status,
      driver_name: e.driver_name || orders.value[idx].driver_name,
      status_at: new Date().toISOString(),
    };
    markUpdated(e.order_uuid);
    scheduleRefetch();
    return;
  }

  // A brand-new order (or one not on the current page).
  if (fromEmpty) {
    // Show it immediately when it matches the active status filter.
    if (statusFilter.value && e.to_status !== statusFilter.value) return;
    const row = {
      uuid: e.order_uuid,
      order_number: e.order_number || 'NEW',
      status: e.to_status || 'pending',
      customer_name: e.customer_name || '—',
      restaurant_name: e.restaurant_name || '—',
      driver_name: e.driver_name || null,
      total: e.total || '0.00',
      created_at: e.updated_at || new Date().toISOString(),
      status_at: new Date().toISOString(),
    };
    orders.value.unshift(row);
    total.value += 1;
    markUpdated(row.uuid);
    scheduleRefetch();
  }
}

function onDriverAssigned(e) {
  const idx = orders.value.findIndex(o => o.uuid === e.order_uuid);
  if (idx >= 0) {
    orders.value[idx] = { ...orders.value[idx], driver_name: e.driver_name || null };
    markUpdated(e.order_uuid);
  } else {
    scheduleRefetch();
  }
}

function onDriverNewJob() {
  scheduleRefetch();
}

function subscribeRealtime() {
  if (adminChannel) return;
  adminChannel = privateAdmin('order.status_update', onOrderUpdate);
  adminChannel.listen('.driver.assigned', onDriverAssigned);
  adminChannel.listen('.driver.new_job', onDriverNewJob);
}

function unsubscribeRealtime() {
  if (adminChannel) {
    try {
      adminChannel.stopListening('.order.status_update', onOrderUpdate);
      adminChannel.stopListening('.driver.assigned', onDriverAssigned);
      adminChannel.stopListening('.driver.new_job', onDriverNewJob);
    } catch (e) { /* ignore */ }
    adminChannel = null;
  }
}

// Throttled authoritative refetch triggered by realtime events,
// so the board reconciles with the server without spamming it.
function scheduleRefetch() {
  if (refetchTimer) return;
  refetchTimer = setTimeout(async () => {
    refetchTimer = null;
    await fetchOrders(page.value);
  }, 4000);
}

function toggleAll() {
  if (allSelected.value) selected.value = [];
  else selected.value = orders.value.map(o => o.uuid);
}

async function fetchOrders(p = 1) {
  page.value = p;
  const params = { page: p, per_page: 20 };
  if (search.value) params.search = search.value;
  if (statusFilter.value) params.status = statusFilter.value;
  if (restaurantFilter.value) params.restaurant = restaurantFilter.value;
  if (dateFrom.value) params.date_from = dateFrom.value;
  if (dateTo.value) params.date_to = dateTo.value;

  try {
    const { data } = await api.get('/admin/orders', { params });
    orders.value = data.data || [];
    total.value = data.total || 0;
    lastPage.value = data.last_page || 1;
    // Drop selections that no longer exist on the current page.
    const uuids = new Set(orders.value.map(o => o.uuid));
    selected.value = selected.value.filter(u => uuids.has(u));
  } catch (e) { console.error(e); }
  loading.value = false;
}

async function manualRefresh() {
  refreshing.value = true;
  await fetchOrders(page.value);
  refreshing.value = false;
}

async function batchCancel() {
  const targets = batchCancellable.value;
  if (!targets.length || !confirm(`Cancel and refund ${targets.length} selected order(s)?`)) return;
  let ok = 0, failed = 0;
  await Promise.all(targets.map(async uuid => {
    try {
      await api.post(`/admin/orders/${uuid}/cancel`, { reason: 'Batch cancel by admin.' });
      ok++;
    } catch (e) { failed++; }
  }));
  selected.value = [];
  alert(`Batch result: ${ok} cancelled, ${failed} failed.`);
  fetchOrders(page.value);
}

function debounceSearch() { clearTimeout(searchTimer); searchTimer = setTimeout(() => fetchOrders(1), 300); }
function goPage(p) { fetchOrders(p); }

function statusBadge(s) {
  return {
    pending: 'bg-warning text-dark', confirmed: 'bg-info',
    preparing: 'bg-info text-dark', ready: 'bg-primary',
    assigned: 'bg-info', picked_up: 'bg-primary',
    delivering: 'bg-warning text-dark', delivered: 'bg-success',
    cancelled: 'bg-danger', rejected: 'bg-danger',
    disputed: 'bg-danger', refunded: 'bg-secondary',
    expired: 'bg-light text-dark',
  }[s] || 'bg-secondary';
}

function formatDate(d) { return d ? new Date(d).toLocaleString() : ''; }

onMounted(async () => {
  loading.value = true;
  await fetchOrders();
  loading.value = false;
  subscribeRealtime();
  // Polling fallback — realtime keeps this authoritative, this covers dropped sockets.
  pollTimer = setInterval(() => fetchOrders(page.value), 30000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  if (refetchTimer) clearTimeout(refetchTimer);
  Object.values(updateTimers).forEach(t => clearTimeout(t));
  unsubscribeRealtime();
});
</script>
