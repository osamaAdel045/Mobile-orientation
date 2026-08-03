<template>
  <div>
    <LteAppContentHeader title="Cart Monitor" subtitle="Monitor active and abandoned shopping carts" />

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item"><button @click="tab='active';fetchActive()" class="nav-link" :class="tab==='active'?'active':''">Active Carts</button></li>
      <li class="nav-item"><button @click="tab='abandoned';fetchAbandoned()" class="nav-link" :class="tab==='abandoned'?'active':''">Abandoned Carts</button></li>
    </ul>

    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading&hellip;</div>
    <div v-else-if="!items.length" class="card shadow-sm">
      <div class="card-body text-center py-5"><p class="text-body-secondary mb-0">No {{ tab }} carts</p></div>
    </div>
    <div v-else class="card shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr><th>Customer</th><th>Restaurant</th><th>Items</th><th v-if="tab==='active'">Expires</th><th v-if="tab==='abandoned'">Expired</th></tr>
          </thead>
          <tbody>
            <tr v-for="c in items" :key="c.uuid">
              <td><p class="fw-medium small mb-0">{{ c.customer }}</p><small class="text-body-secondary">{{ c.customer_email || c.email }}</small></td>
              <td class="small">{{ c.restaurant }}</td>
              <td><span class="badge bg-secondary">{{ c.items_count }} items</span></td>
              <td class="small text-body-secondary">{{ formatDate(tab==='active' ? c.expires_at : c.expired_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../stores/api';

const tab = ref('active');
const items = ref([]);
const loading = ref(true);

async function fetchActive() {
  loading.value = true;
  try { const { data } = await api.get('/admin/carts/active'); items.value = data.data.data || []; } catch(e) { console.error(e); }
  loading.value = false;
}
async function fetchAbandoned() {
  loading.value = true;
  try { const { data } = await api.get('/admin/carts/abandoned'); items.value = data.data.data || []; } catch(e) { console.error(e); }
  loading.value = false;
}
function formatDate(d) { return d ? new Date(d).toLocaleString() : ''; }
onMounted(() => fetchActive());
</script>
