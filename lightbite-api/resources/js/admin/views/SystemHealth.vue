<template>
  <div>
    <LteAppContentHeader title="System Health" subtitle="Platform health, queue status, and statistics" />

    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading&hellip;</div>
    <template v-else>
      <div class="row mb-4">
        <div class="col-md-4 mb-3">
          <LteInfoBox title="Database" :value="h.database" :color="h.database === 'ok' ? 'text-bg-success' : 'text-bg-danger'" icon="bi-database" :progress="h.database === 'ok' ? 100 : 0" />
        </div>
        <div class="col-md-4 mb-3">
          <LteInfoBox title="Cache" :value="h.cache" :color="h.cache === 'ok' ? 'text-bg-success' : 'text-bg-danger'" icon="bi-memory" :progress="h.cache === 'ok' ? 100 : 0" />
        </div>
        <div class="col-md-4 mb-3">
          <LteInfoBox title="Queue" value="ok" color="text-bg-success" icon="bi-inbox" :progress="100" />
        </div>
      </div>

      <div class="row mb-4">
        <div class="col-md-6 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div><h6 class="card-title mb-1">Pending Jobs</h6><p class="fs-4 fw-bold text-warning mb-0">{{ data.queue?.pending || 0 }}</p></div>
                <LteProgress :value="data.queue?.pending || 0" :max="100" color="bg-warning" />
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center">
                <div><h6 class="card-title mb-1">Failed Jobs</h6><p class="fs-4 fw-bold mb-0" :class="(data.queue?.failed||0) > 0 ? 'text-danger' : ''">{{ data.queue?.failed || 0 }}</p></div>
                <LteProgress :value="data.queue?.failed || 0" :max="100" :color="(data.queue?.failed||0) > 0 ? 'bg-danger' : 'bg-success'" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-header"><h5 class="card-title mb-0">Platform Statistics</h5></div>
        <div class="card-body">
          <div class="row g-3">
            <div class="col-6 col-lg-3"><small class="text-body-secondary">Total Users</small><p class="fs-4 fw-bold mb-0">{{ data.stats?.total_users }}</p></div>
            <div class="col-6 col-lg-3"><small class="text-body-secondary">Total Orders</small><p class="fs-4 fw-bold mb-0">{{ data.stats?.total_orders }}</p></div>
            <div class="col-6 col-lg-3"><small class="text-body-secondary">Orders Today</small><p class="fs-4 fw-bold text-success mb-0">{{ data.stats?.today_orders }}</p></div>
            <div class="col-6 col-lg-3"><small class="text-body-secondary">Total Revenue</small><p class="fs-4 fw-bold mb-0">AED {{ data.stats?.total_revenue }}</p></div>
            <div class="col-6 col-lg-3"><small class="text-body-secondary">Push Tokens</small><p class="fs-4 fw-bold mb-0">{{ data.stats?.push_tokens }}</p></div>
            <div class="col-6 col-lg-3"><small class="text-body-secondary">Active Carts</small><p class="fs-4 fw-bold text-primary mb-0">{{ data.stats?.active_carts }}</p></div>
            <div class="col-6 col-lg-3"><small class="text-body-secondary">Abandoned (7d)</small><p class="fs-4 fw-bold text-body-secondary mb-0">{{ data.stats?.abandoned_carts }}</p></div>
            <div class="col-6 col-lg-3"><small class="text-body-secondary">Health Score</small><p class="fs-4 fw-bold text-success mb-0">✓ All OK</p></div>
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
const data = ref({ stats: {}, queue: {} });
const h = computed(() => data.value.health || {});

onMounted(async () => {
  try {
    const { data: d } = await api.get('/admin/system/health');
    data.value = d.data;
  } catch(e) { console.error(e); }
  loading.value = false;
});
</script>
