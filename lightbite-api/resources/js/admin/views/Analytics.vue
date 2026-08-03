<template>
  <div>
    <LteAppContentHeader title="Analytics" subtitle="Business intelligence and platform trends">
      <template #actions>
        <div class="d-flex gap-2">
          <select v-model="days" @change="fetch" class="form-select form-select-sm" style="width: auto;">
            <option :value="7">7 days</option>
            <option :value="30">30 days</option>
            <option :value="90">90 days</option>
          </select>
          <button @click="exportCSV" class="btn btn-sm btn-warning">Export CSV</button>
        </div>
      </template>
    </LteAppContentHeader>

    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading analytics&hellip;</div>
    <template v-else>
      <!-- KPI Cards -->
      <div class="row mb-4">
        <div class="col-sm-6 col-lg-3 mb-3">
          <LteSmallBox title="Total Revenue" :value="'AED ' + (data.metrics?.total_revenue || 0)" color="text-bg-primary" icon="bi-cash-stack" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <LteSmallBox title="Avg Order Value" :value="'AED ' + (data.metrics?.avg_order_value || 0)" color="text-bg-success" icon="bi-basket" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <LteSmallBox title="Cancel Rate" :value="(data.metrics?.cancel_rate || 0) + '%'" color="text-bg-danger" icon="bi-x-circle" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <LteSmallBox title="Avg Delivery Time" :value="(data.metrics?.avg_delivery_min || 0) + ' min'" color="text-bg-info" icon="bi-clock" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <LteSmallBox title="Total Orders" :value="String(data.metrics?.total_orders || 0)" color="text-bg-warning" icon="bi-box-seam" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <LteSmallBox title="Customers" :value="String(data.metrics?.total_customers || 0)" color="text-bg-secondary" icon="bi-people" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <LteSmallBox title="Drivers" :value="String(data.metrics?.total_drivers || 0)" color="text-bg-dark" icon="bi-bicycle" />
        </div>
        <div class="col-sm-6 col-lg-3 mb-3">
          <LteSmallBox title="Dispute Rate" :value="(data.metrics?.dispute_rate || 0) + '%'" color="text-bg-danger" icon="bi-exclamation-triangle" />
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row mb-4">
        <div class="col-lg-6 mb-3">
          <div class="card shadow-sm">
            <div class="card-header"><h5 class="card-title mb-0">Revenue Trend</h5></div>
            <div class="card-body">
              <LteApexChart
                type="area"
                :options="revenueTrendOptions"
                :series="[{ name: 'Revenue', data: (data.revenue_trend || []).map(d => d.revenue) }]"
                height="280"
              />
            </div>
          </div>
        </div>
        <div class="col-lg-6 mb-3">
          <div class="card shadow-sm">
            <div class="card-header"><h5 class="card-title mb-0">Order Volume</h5></div>
            <div class="card-body">
              <LteApexChart
                type="bar"
                :options="orderVolumeOptions"
                :series="[{ name: 'Orders', data: (data.revenue_trend || []).map(d => d.orders) }]"
                height="280"
              />
            </div>
          </div>
        </div>
        <div class="col-lg-6 mb-3">
          <div class="card shadow-sm">
            <div class="card-header"><h5 class="card-title mb-0">Customer Signups</h5></div>
            <div class="card-body">
              <LteApexChart
                type="line"
                :options="signupTrendOptions"
                :series="[{ name: 'Signups', data: (data.signup_trend || []).map(d => d.count) }]"
                height="280"
              />
            </div>
          </div>
        </div>
        <div class="col-lg-6 mb-3">
          <div class="card shadow-sm">
            <div class="card-header"><h5 class="card-title mb-0">Driver Utilization</h5></div>
            <div class="card-body">
              <LteApexChart
                type="line"
                :options="driverUtilOptions"
                :series="[{ name: 'Avg per Driver', data: (data.driver_util || []).map(d => d.avg_per_driver) }]"
                height="280"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../stores/api';

const loading = ref(true);
const data = ref({ metrics: {}, revenue_trend: [], signup_trend: [], driver_util: [] });
const days = ref(30);

// --- ApexCharts computed options ---
const revenueTrendOptions = computed(() => ({
  chart: { type: 'area', toolbar: { show: false } },
  xaxis: { categories: (data.value.revenue_trend || []).map(d => d.date), labels: { style: { fontSize: '11px' } } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#f97316'],
  tooltip: { y: { formatter: (val) => 'AED ' + val } },
}));

const orderVolumeOptions = computed(() => ({
  chart: { type: 'bar', toolbar: { show: false } },
  xaxis: { categories: (data.value.revenue_trend || []).map(d => d.date), labels: { style: { fontSize: '11px' } } },
  dataLabels: { enabled: false },
  colors: ['#3b82f6'],
  plotOptions: { bar: { borderRadius: 4, columnWidth: '60%' } },
}));

const signupTrendOptions = computed(() => ({
  chart: { type: 'line', toolbar: { show: false } },
  xaxis: { categories: (data.value.signup_trend || []).map(d => d.date), labels: { style: { fontSize: '11px' } } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#22c55e'],
}));

const driverUtilOptions = computed(() => ({
  chart: { type: 'line', toolbar: { show: false } },
  xaxis: { categories: (data.value.driver_util || []).map(d => d.date), labels: { style: { fontSize: '11px' } } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  colors: ['#8b5cf6'],
  tooltip: { y: { formatter: (val) => val + ' /driver' } },
}));

async function fetch() {
  loading.value = true;
  try {
    const { data: d } = await api.get('/admin/analytics', { params: { days: days.value } });
    data.value = d.data;
  } catch(e) { console.error(e); }
  loading.value = false;
}

function exportCSV() {
  const rows = [['Date', 'Revenue (AED)', 'Orders', 'Signups']];
  const trend = data.value.revenue_trend || [];
  const signups = data.value.signup_trend || [];
  for (let i = 0; i < trend.length; i++) {
    rows.push([trend[i].date, trend[i].revenue, trend[i].orders, signups[i]?.count || 0]);
  }
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = `analytics-${days.value}d.csv`; a.click();
  URL.revokeObjectURL(url);
}

onMounted(fetch);
</script>
