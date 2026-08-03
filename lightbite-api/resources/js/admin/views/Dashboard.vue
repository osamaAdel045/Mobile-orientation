<template>
  <div>
    <LteAppContentHeader title="Dashboard" subtitle="Platform overview — auto-refreshes every 30s">
      <template #actions>
        <div class="d-flex align-items-center gap-2">
          <div class="btn-group btn-group-sm">
            <button
              v-for="r in [{label:'7d',val:7},{label:'30d',val:30}]" :key="r.val"
              @click="chartDays = r.val"
              class="btn"
              :class="chartDays === r.val ? 'btn-primary' : 'btn-outline-secondary'"
            >{{ r.label }}</button>
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
          <router-link to="/admin/orders" class="text-decoration-none">
            <LteSmallBox title="Active Orders" :value="String(metrics.active_orders)" color="text-bg-warning" icon="bi-box-seam" />
          </router-link>
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <router-link to="/admin/drivers" class="text-decoration-none">
            <LteSmallBox title="Online Drivers" :value="String(metrics.online_drivers)" color="text-bg-info" icon="bi-bicycle" />
          </router-link>
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <router-link to="/admin/restaurants" class="text-decoration-none">
            <LteSmallBox title="Active Restaurants" :value="String(metrics.active_restaurants)" color="text-bg-success" icon="bi-shop" />
          </router-link>
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <router-link to="/admin/analytics" class="text-decoration-none">
            <LteSmallBox title="Revenue Today" :value="'AED ' + metrics.today_revenue" color="text-bg-dark" icon="bi-cash-stack" />
          </router-link>
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <router-link to="/admin/restaurants" class="text-decoration-none">
            <LteSmallBox title="Pending Restaurants" :value="String(metrics.pending_restaurant_verifications)" color="text-bg-warning" icon="bi-hourglass-split" />
          </router-link>
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <router-link to="/admin/drivers" class="text-decoration-none">
            <LteSmallBox title="Pending Drivers" :value="String(metrics.pending_driver_verifications)" color="text-bg-warning" icon="bi-hourglass-split" />
          </router-link>
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <router-link to="/admin/disputes" class="text-decoration-none">
            <LteSmallBox title="Open Disputes" :value="String(metrics.open_disputes)" color="text-bg-danger" icon="bi-exclamation-triangle" />
          </router-link>
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <router-link to="/admin/orders" class="text-decoration-none">
            <LteSmallBox title="Completed Today" :value="String(metrics.completed_today)" color="text-bg-success" icon="bi-check2-circle" />
          </router-link>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row mb-4">
        <div class="col-lg-6 mb-3">
          <div class="card shadow-sm">
            <div class="card-header"><h5 class="card-title mb-0">Revenue (Last {{ chartDays }} Days)</h5></div>
            <div class="card-body">
              <LteApexChart
                type="area"
                :options="revenueChartOptions"
                :series="[{ name: 'Revenue', data: charts.revenue?.map(d => (d.revenue)) || [] }]"
                height="280"
              />
            </div>
          </div>
        </div>
        <div class="col-lg-6 mb-3">
          <div class="card shadow-sm">
            <div class="card-header"><h5 class="card-title mb-0">Order Volume (Last {{ chartDays }} Days)</h5></div>
            <div class="card-body">
              <LteApexChart
                type="bar"
                :options="volumeChartOptions"
                :series="[{ name: 'Orders', data: charts.volume?.map(d => (d.orders)) || [] }]"
                height="280"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="row mb-4">
        <!-- Status Breakdown -->
        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm">
            <div class="card-header"><h5 class="card-title mb-0">Order Status Breakdown</h5></div>
            <div class="card-body">
              <LteApexChart
                v-if="statusSeries.length > 0"
                type="donut"
                :options="{ labels: statusLabels, chart: { type: 'donut' }, legend: { position: 'bottom' }, dataLabels: { enabled: true, formatter: (val) => val + '%' } }"
                :series="statusSeries"
                height="250"
              />
              <p v-else class="text-body-secondary small text-center py-4">No data available</p>
            </div>
          </div>
        </div>

        <!-- Top Restaurants -->
        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header"><h5 class="card-title mb-0">Top Restaurants (This Week)</h5></div>
            <div class="card-body">
              <div v-if="charts.top_restaurants?.length" class="list-group list-group-flush">
                <div v-for="(r, i) in charts.top_restaurants" :key="r.name" class="list-group-item d-flex justify-content-between align-items-center px-0">
                  <div class="d-flex align-items-center gap-2">
                    <span class="badge rounded-pill" :class="rankBg(i)">{{ i + 1 }}</span>
                    <div><p class="mb-0 fw-medium small">{{ r.name }}</p><small class="text-body-secondary">{{ r.cuisine }}</small></div>
                  </div>
                  <span class="small fw-semibold">{{ r.order_count }} orders</span>
                </div>
              </div>
              <p v-else class="text-body-secondary small text-center py-4">No data yet this week</p>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header"><h5 class="card-title mb-0">Recent Activity</h5></div>
            <div class="card-body">
              <div v-if="recentActivity.length" class="list-group list-group-flush" style="max-height: 280px; overflow-y: auto;">
                <div v-for="(a, i) in recentActivity" :key="i" class="list-group-item px-0 small">
                  <div class="d-flex align-items-start gap-2">
                    <span class="badge rounded-pill mt-1 flex-shrink-0" :class="activityDot(a.action)" style="width:8px;height:8px;padding:0;">&nbsp;</span>
                    <div>
                      <p class="mb-0">
                        <strong>{{ a.user }}</strong>
                        <span class="text-body-secondary"> — {{ formatAction(a) }}</span>
                      </p>
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
          <span class="badge bg-danger">{{ stuck.length }}</span>
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

const loading = ref(true);
const refreshing = ref(false);
const metrics = ref({});
const charts = ref({ revenue: [], volume: [], status_breakdown: {}, top_restaurants: [] });
const recentActivity = ref([]);
const stuck = ref([]);
const lastRefresh = ref('');
const chartDays = ref(7);
let refreshTimer = null;

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

const statusLabels = computed(() => Object.keys(charts.value.status_breakdown || {}));
const statusSeries = computed(() => Object.values(charts.value.status_breakdown || {}));

async function fetchDashboard() {
  try {
    const { data } = await api.get('/admin/dashboard');
    metrics.value = data.data.metrics;
    charts.value = data.data.charts;
    recentActivity.value = data.data.recent_activity || [];
    stuck.value = data.data.stuck_orders || [];
    lastRefresh.value = new Date().toLocaleTimeString();
  } catch (e) {
    console.error('Dashboard fetch failed:', e);
  }
}

async function fetchChartData() {
  try {
    const [revenueRes, volumeRes, topRes] = await Promise.all([
      api.get(`/admin/dashboard/revenue-chart?days=${chartDays.value}`),
      api.get(`/admin/dashboard/order-volume?days=${chartDays.value}`),
      api.get(`/admin/dashboard/top-restaurants?days=${chartDays.value}`),
    ]);
    charts.value.revenue = revenueRes.data.data;
    charts.value.volume = volumeRes.data.data;
    charts.value.top_restaurants = topRes.data.data;
  } catch (e) {
    console.error('Chart data fetch failed:', e);
  }
}

async function manualRefresh() {
  refreshing.value = true;
  await Promise.all([fetchDashboard(), fetchChartData()]);
  refreshing.value = false;
}

// Re-fetch chart data when date range changes
watch(chartDays, async () => {
  refreshing.value = true;
  await fetchChartData();
  refreshing.value = false;
});

onMounted(async () => {
  loading.value = true;
  await Promise.all([fetchDashboard(), fetchChartData()]);
  loading.value = false;
  // Auto-refresh every 30 seconds
  refreshTimer = setInterval(async () => {
    refreshing.value = true;
    await Promise.all([fetchDashboard(), fetchChartData()]);
    refreshing.value = false;
  }, 30000);
});

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer);
});

function statusClass(s) {
  return { pending: 'bg-warning', ready: 'bg-success' }[s] || 'bg-secondary';
}

function rankBg(i) {
  return ['bg-warning text-dark', 'bg-secondary', 'bg-dark'][i] || 'bg-light text-dark';
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
