<template>
  <div>
    <LteAppContentHeader title="Dashboard" subtitle="Platform overview — real-time, auto-refreshes every 30s">
      <template #actions>
        <div class="d-flex align-items-center gap-2">
          <span class="badge" :class="realtimeBadge">{{ realtimeLabel }}</span>
          <div class="btn-group btn-group-sm">
            <button v-for="r in [{label:'7d',val:7},{label:'30d',val:30}]" :key="r.val" @click="chartDays = r.val" class="btn" :class="chartDays === r.val ? 'btn-primary' : 'btn-outline-secondary'">{{ r.label }}</button>
          </div>
          <button @click="manualRefresh" :disabled="refreshing" class="btn btn-sm btn-outline-secondary" title="Refresh now">
            <i class="bi bi-arrow-clockwise" :class="{ 'spin-animation': refreshing }"></i>
          </button>
          <small class="text-body-tertiary">
            <span v-if="refreshing" class="text-body-secondary">Refreshing&hellip;</span>
            <span v-else>Updated {{ lastRefresh }}</span>
          </small>
        </div>
      </template>
    </LteAppContentHeader>

    <!-- Loading skeletons -->
    <div v-if="loading">
      <div class="row mb-4">
        <div class="col-sm-6 col-lg-3 mb-3" v-for="i in 8" :key="i">
          <div class="card shadow-sm"><div class="card-body"><div class="placeholder-glow"><span class="placeholder col-6"></span><span class="placeholder col-4 ms-2 fs-4 d-block mt-2"></span></div></div></div>
        </div>
      </div>
      <div class="row mb-4">
        <div class="col-lg-6 mb-3"><div class="card shadow-sm" style="height: 300px;"><div class="card-body placeholder-glow"><span class="placeholder col-8"></span></div></div></div>
        <div class="col-lg-6 mb-3"><div class="card shadow-sm" style="height: 300px;"><div class="card-body placeholder-glow"><span class="placeholder col-8"></span></div></div></div>
      </div>
    </div>

    <template v-else>
      <!-- Metric Cards -->
      <div class="row mb-4">
        <div class="col-sm-6 col-lg-3 mb-3">
          <StatCard title="Revenue Today" :value="parseFloat(metrics.today_revenue || 0)" prefix="AED " decimals="2" icon="bi-cash-stack" color="success" to="/admin/analytics" :sub="`${metrics.completed_today || 0} delivered today`" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <StatCard title="Active Orders" :value="metrics.active_orders || 0" icon="bi-box-seam" color="warning" to="/admin/orders" :sub="`${metrics.orders_today || 0} orders today`" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <StatCard title="Online Drivers" :value="metrics.online_drivers || 0" icon="bi-bicycle" color="info" to="/admin/drivers" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <StatCard title="Active Restaurants" :value="metrics.active_restaurants || 0" icon="bi-shop" color="dark" to="/admin/restaurants" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <StatCard title="Pending Acceptance" :value="metrics.orders_pending_acceptance || 0" icon="bi-hourglass-split" :color="(metrics.orders_pending_acceptance || 0) > 0 ? 'danger' : 'secondary'" to="/admin/orders" sub="Stuck &gt; 2 min" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <StatCard title="Completion Rate" :value="metrics.completion_rate || 0" suffix="%" icon="bi-check2-circle" :color="(metrics.completion_rate || 0) >= 80 ? 'success' : 'warning'" to="/admin/analytics" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <StatCard title="Open Disputes" :value="metrics.open_disputes || 0" icon="bi-exclamation-triangle" :color="(metrics.open_disputes || 0) > 0 ? 'danger' : 'secondary'" to="/admin/disputes" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <StatCard title="Pending Verifications" :value="needsAttention?.pending_verifications?.total || 0" icon="bi-person-check" :color="(needsAttention?.pending_verifications?.total || 0) > 0 ? 'warning' : 'secondary'" to="/admin/restaurants" :sub="verificationSub" />
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row mb-4">
        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header"><h5 class="card-title mb-0">Revenue ({{ chartDays }}d)</h5></div>
            <div class="card-body">
              <LteApexChart type="area" :options="revenueChartOptions" :series="[{ name: 'Revenue', data: charts.revenue?.map(d => d.revenue) || [] }]" height="240" />
            </div>
          </div>
        </div>
        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header"><h5 class="card-title mb-0">Order Volume ({{ chartDays }}d)</h5></div>
            <div class="card-body">
              <LteApexChart type="bar" :options="volumeChartOptions" :series="[{ name: 'Orders', data: charts.volume?.map(d => d.orders) || [] }]" height="240" />
            </div>
          </div>
        </div>
        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header"><h5 class="card-title mb-0">Orders by Hour (Today)</h5></div>
            <div class="card-body">
              <LteApexChart type="bar" :options="hourChartOptions" :series="[{ name: 'Orders', data: charts.orders_by_hour?.map(d => d.count) || [] }]" height="240" />
            </div>
          </div>
        </div>
      </div>

      <!-- Live Orders -->
      <div class="card shadow-sm mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0"><span class="live-dot me-2"></span>Live Orders</h5>
          <span class="badge bg-success">{{ liveOrders.length }} active</span>
        </div>
        <div class="card-body p-0">
          <div v-if="liveOrders.length" class="table-responsive">
            <table class="table table-hover mb-0 align-middle">
              <thead class="table-light">
                <tr><th>Order</th><th>Restaurant</th><th>Driver</th><th>Status</th><th>Total</th><th>Age</th></tr>
              </thead>
              <tbody>
                <tr v-for="o in liveOrders" :key="o.uuid" class="row-enter" style="cursor:pointer;" @click="$router.push(`/admin/orders/${o.uuid}`)">
                  <td class="font-monospace small fw-medium text-warning">{{ o.order_number }}</td>
                  <td class="small">{{ o.restaurant_name }}</td>
                  <td class="small">{{ o.driver_name || '—' }}</td>
                  <td><span class="badge text-capitalize" :class="statusClass(o.status)">{{ o.status }}</span></td>
                  <td class="small fw-medium">AED {{ o.total }}</td>
                  <td class="small text-body-secondary">{{ o.age_min }}m</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-body-secondary small text-center py-4 mb-0">No active orders right now.</p>
        </div>
      </div>

      <!-- Needs Attention + Status Breakdown -->
      <div class="row mb-4">
        <div class="col-lg-5 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="card-title mb-0"><i class="bi bi-exclamation-octagon text-danger me-1"></i>Needs Attention</h5>
              <span class="badge bg-danger">{{ attentionCount }}</span>
            </div>
            <div class="card-body p-0">
              <div class="list-group list-group-flush">
                <div class="list-group-item attention-card">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="small fw-medium">Awaiting driver (&gt; 5 min)</span>
                    <router-link to="/admin/orders" class="small">{{ needsAttention?.awaiting_driver?.length || 0 }}</router-link>
                  </div>
                  <p v-if="needsAttention?.awaiting_driver?.length" class="small text-body-secondary mb-0 mt-1">
                    <span v-for="o in needsAttention.awaiting_driver.slice(0, 3)" :key="o.uuid" class="badge bg-warning text-dark me-1 font-monospace" style="cursor:pointer;" @click="$router.push(`/admin/orders/${o.uuid}`)">{{ o.order_number }}</span>
                  </p>
                </div>
                <div class="list-group-item attention-card warn">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="small fw-medium">High rejection restaurants</span>
                    <span class="small">{{ needsAttention?.high_rejection_restaurants?.length || 0 }}</span>
                  </div>
                  <p v-if="needsAttention?.high_rejection_restaurants?.length" class="small text-body-secondary mb-0 mt-1">
                    <span v-for="r in needsAttention.high_rejection_restaurants" :key="r.uuid" class="badge bg-danger text-white me-1" style="cursor:pointer;" @click="$router.push(`/admin/restaurants/${r.uuid}`)">{{ r.name }} {{ r.rejection_rate }}%</span>
                  </p>
                </div>
                <div class="list-group-item attention-card info">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="small fw-medium">Pending verifications</span>
                    <span class="small">
                      <router-link to="/admin/restaurants" class="me-1">{{ needsAttention?.pending_verifications?.restaurants || 0 }} restaurants</router-link>
                      <router-link to="/admin/drivers">{{ needsAttention?.pending_verifications?.drivers || 0 }} drivers</router-link>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header"><h5 class="card-title mb-0">Order Status</h5></div>
            <div class="card-body">
              <LteApexChart v-if="statusSeries.length" type="donut" :options="{ labels: statusLabels, chart: { type: 'donut' }, legend: { position: 'bottom', fontSize: '12px' }, dataLabels: { enabled: true, formatter: (val) => val + '%' }, plotOptions: { pie: { donut: { size: '70%' } } } }" :series="statusSeries" height="240" />
              <p v-else class="text-body-secondary small text-center py-4">No data</p>
            </div>
          </div>
        </div>

        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header"><h5 class="card-title mb-0">Recent Activity</h5></div>
            <div class="card-body">
              <div v-if="recentActivity.length" class="list-group list-group-flush" style="max-height: 300px; overflow-y: auto;">
                <div v-for="(a, i) in recentActivity" :key="i" class="list-group-item px-0 small">
                  <div class="d-flex align-items-start gap-2">
                    <span class="badge rounded-pill mt-1 flex-shrink-0" :class="activityDot(a.action)" style="width:8px;height:8px;padding:0;">&nbsp;</span>
                    <div>
                      <p class="mb-0"><strong>{{ a.user }}</strong> <span class="text-body-secondary">— {{ formatAction(a) }}</span></p>
                      <small class="text-body-tertiary">{{ a.timestamp }}</small>
                    </div>
                  </div>
                </div>
              </div>
              <p v-else class="text-body-secondary small text-center py-4">No recent activity</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stuck Orders -->
      <div class="card shadow-sm">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Stuck Orders</h5>
          <span class="badge" :class="stuck.length ? 'bg-danger' : 'bg-secondary'">{{ stuck.length }}</span>
        </div>
        <div class="card-body p-0">
          <table v-if="stuck.length" class="table table-hover mb-0">
            <thead class="table-light">
              <tr><th>Order #</th><th>Restaurant</th><th>Status</th><th>Stuck Since</th></tr>
            </thead>
            <tbody>
              <tr v-for="o in stuck" :key="o.uuid" style="cursor: pointer;" @click="$router.push(`/admin/orders/${o.uuid}`)">
                <td class="font-monospace small text-warning">{{ o.order_number }}</td>
                <td>{{ o.restaurant_name }}</td>
                <td><span class="badge" :class="statusClass(o.status)">{{ o.status }}</span></td>
                <td class="text-body-secondary">{{ o.stuck_since }}</td>
              </tr>
            </tbody>
          </table>
          <p v-else class="text-body-secondary small text-center py-4 mb-0">No stuck orders — everything is flowing.</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import api from '../stores/api';
import { realtimeStatus, privateAdmin } from '../echo';
import StatCard from '../components/StatCard.vue';

const loading = ref(true);
const refreshing = ref(false);
const metrics = ref({});
const charts = ref({ revenue: [], volume: [], orders_by_hour: [], status_breakdown: {}, top_restaurants: [] });
const recentActivity = ref([]);
const stuck = ref([]);
const liveOrders = ref([]);
const needsAttention = ref(null);
const lastRefresh = ref('');
const chartDays = ref(7);
let refreshTimer = null;
let refetchTimer = null;
let adminChannel = null;

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

const verificationSub = computed(() => {
  if (!needsAttention.value) return '';
  const p = needsAttention.value.pending_verifications;
  return `${p?.restaurants || 0} restaurants · ${p?.drivers || 0} drivers`;
});

const attentionCount = computed(() => {
  if (!needsAttention.value) return 0;
  return (needsAttention.value.awaiting_driver?.length || 0)
    + (needsAttention.value.high_rejection_restaurants?.length || 0)
    + (needsAttention.value.pending_verifications?.total || 0);
});

// --- ApexCharts computed options ---
const revenueChartOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false } },
  xaxis: { categories: charts.value.revenue?.map(d => d.date) || [], labels: { style: { fontSize: '11px' } } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0 } },
  colors: ['#f97316'],
  tooltip: { y: { formatter: (val) => 'AED ' + val } },
}));

const volumeChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  xaxis: { categories: charts.value.volume?.map(d => d.date) || [], labels: { style: { fontSize: '11px' } } },
  dataLabels: { enabled: false },
  colors: ['#3b82f6'],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
}));

const hourChartOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  xaxis: { categories: charts.value.orders_by_hour?.map(d => d.hour) || [], labels: { style: { fontSize: '10px' }, rotate: 0 }, tickAmount: 12 },
  dataLabels: { enabled: false },
  colors: ['#8b5cf6'],
  plotOptions: { bar: { borderRadius: 3, columnWidth: '70%' } },
}));

const statusLabels = computed(() => Object.keys(charts.value.status_breakdown || {}));
const statusSeries = computed(() => Object.values(charts.value.status_breakdown || {}));

// ─── Data fetching ─────────────────────────────────────────
async function fetchDashboard() {
  try {
    const { data } = await api.get('/admin/dashboard');
    metrics.value = data.data.metrics;
    charts.value = data.data.charts;
    recentActivity.value = data.data.recent_activity || [];
    stuck.value = data.data.stuck_orders || [];
    liveOrders.value = data.data.live_orders || [];
    needsAttention.value = data.data.needs_attention || null;
    lastRefresh.value = new Date().toLocaleTimeString();
  } catch (e) {
    console.error('Dashboard fetch failed:', e);
  }
}

async function fetchChartData() {
  try {
    const [revenueRes, volumeRes] = await Promise.all([
      api.get(`/admin/dashboard/revenue-chart?days=${chartDays.value}`),
      api.get(`/admin/dashboard/order-volume?days=${chartDays.value}`),
    ]);
    charts.value.revenue = revenueRes.data.data;
    charts.value.volume = volumeRes.data.data;
  } catch (e) {
    console.error('Chart data fetch failed:', e);
  }
}

async function manualRefresh() {
  refreshing.value = true;
  await Promise.all([fetchDashboard(), fetchChartData()]);
  refreshing.value = false;
}

// Throttled authoritative refetch triggered by realtime events.
function scheduleRefetch() {
  if (refetchTimer) return;
  refetchTimer = setTimeout(async () => {
    refetchTimer = null;
    await Promise.all([fetchDashboard(), fetchChartData()]);
  }, 5000);
}

// ─── Realtime handling ─────────────────────────────────────
function pushActivity(action, user, detail) {
  recentActivity.value.unshift({ action, user, detail, timestamp: 'just now' });
  if (recentActivity.value.length > 20) recentActivity.value.pop();
}

function onOrderUpdate(e) {
  const active = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivering'];
  const fromActive = active.includes(e.from_status);
  const toActive = active.includes(e.to_status);
  const isNew = !e.from_status; // order just created
  const isDelivered = e.to_status === 'delivered';

  // Update the live orders list.
  if (toActive) {
    const idx = liveOrders.value.findIndex(o => o.uuid === e.order_uuid);
    if (idx >= 0) {
      liveOrders.value[idx] = { ...liveOrders.value[idx], status: e.to_status };
    } else if (isNew) {
      // A brand-new order streams in without waiting for the polling refresh.
      liveOrders.value.unshift({
        uuid: e.order_uuid,
        order_number: e.order_number,
        status: e.to_status,
        restaurant_name: e.restaurant_name || '—',
        driver_name: e.driver_name || null,
        total: e.total || '0.00',
        age_min: 0,
        created_at: e.updated_at || new Date().toISOString(),
      });
      liveOrders.value = liveOrders.value.slice(0, 12);
    }
  } else if (fromActive) {
    liveOrders.value = liveOrders.value.filter(o => o.uuid !== e.order_uuid);
  }

  // Reconcile the active-order counter locally for instant feedback.
  if (fromActive && !toActive) metrics.value.active_orders = Math.max(0, (metrics.value.active_orders || 0) - 1);
  else if (!fromActive && toActive) metrics.value.active_orders = (metrics.value.active_orders || 0) + 1;

  // Live today metrics: a delivered order closes out revenue + completion count,
  // a new order bumps the daily volume counter.
  if (isDelivered) {
    metrics.value.completed_today = (metrics.value.completed_today || 0) + 1;
    if (e.total) {
      const revenue = parseFloat(metrics.value.today_revenue || 0) + parseFloat(e.total);
      metrics.value.today_revenue = revenue.toFixed(2);
    }
  } else if (isNew) {
    metrics.value.orders_today = (metrics.value.orders_today || 0) + 1;
  }

  pushActivity(isDelivered ? 'order.delivered' : 'order.status_update', 'System', e.order_number);

  scheduleRefetch();
}

function onDriverAssigned(e) {
  const idx = liveOrders.value.findIndex(o => o.uuid === e.order_uuid);
  if (idx >= 0) liveOrders.value[idx] = { ...liveOrders.value[idx], driver_name: e.driver_name };
  pushActivity('driver.assigned', e.driver_name || 'Driver', e.order_number);
  scheduleRefetch();
}

function onDriverJob(e) {
  pushActivity('driver.new_job', 'Dispatch', e.order_number);
  scheduleRefetch();
}

function subscribeRealtime() {
  if (adminChannel) return; // already subscribed
  adminChannel = privateAdmin('order.status_update', onOrderUpdate);
  adminChannel.listen('.driver.assigned', onDriverAssigned);
  adminChannel.listen('.driver.new_job', onDriverJob);
}

function unsubscribeRealtime() {
  if (adminChannel) {
    try {
      adminChannel.stopListening('.order.status_update', onOrderUpdate);
      adminChannel.stopListening('.driver.assigned', onDriverAssigned);
      adminChannel.stopListening('.driver.new_job', onDriverJob);
    } catch (e) { /* ignore */ }
    adminChannel = null;
  }
}

// ─── Lifecycle ─────────────────────────────────────────────
watch(chartDays, async () => {
  refreshing.value = true;
  await fetchChartData();
  refreshing.value = false;
});

onMounted(async () => {
  loading.value = true;
  await Promise.all([fetchDashboard(), fetchChartData()]);
  loading.value = false;
  subscribeRealtime();
  // Polling fallback — realtime keeps this authoritative, this covers dropped sockets.
  refreshTimer = setInterval(async () => {
    refreshing.value = true;
    await Promise.all([fetchDashboard(), fetchChartData()]);
    refreshing.value = false;
  }, 30000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
  if (refetchTimer) clearTimeout(refetchTimer);
  unsubscribeRealtime();
});

function statusClass(s) {
  return {
    pending: 'bg-warning text-dark', confirmed: 'bg-info', preparing: 'bg-info text-dark', ready: 'bg-primary',
    assigned: 'bg-info', picked_up: 'bg-primary', delivering: 'bg-warning text-dark', delivered: 'bg-success',
    cancelled: 'bg-danger', rejected: 'bg-danger', disputed: 'bg-danger', refunded: 'bg-secondary', expired: 'bg-light text-dark',
  }[s] || 'bg-secondary';
}

function activityDot(action) {
  if (action.startsWith('dispute.')) return 'bg-danger';
  if (action.startsWith('restaurant.')) return 'bg-success';
  if (action.startsWith('driver.')) return 'bg-primary';
  if (action.startsWith('order.')) return 'bg-warning';
  return 'bg-secondary';
}

function formatAction(a) {
  const detail = a.detail ? ` — ${a.detail}` : '';
  return a.action.replace(/\./g, ' ') + detail;
}
</script>
