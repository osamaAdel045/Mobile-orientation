<template>
  <div>
    <LteAppContentHeader title="Dispute Center" subtitle="Review and resolve order disputes">
      <span class="badge bg-danger fs-6">{{ disputes.length }} open</span>
    </LteAppContentHeader>

    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading&hellip;</div>
    <div v-else-if="!disputes.length" class="card shadow-sm">
      <div class="card-body text-center py-5"><p class="text-body-secondary mb-0">No open disputes</p></div>
    </div>
    <div v-else class="row g-3">
      <div v-for="d in disputes" :key="d.uuid" class="col-12">
        <div class="card shadow-sm" style="cursor:pointer;" @click="openDetail(d.uuid)">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge text-capitalize" :class="reasonBadge(d.reason)">{{ formatReason(d.reason) }}</span>
                  <small class="text-body-tertiary">{{ formatDate(d.created_at) }}</small>
                </div>
                <p class="small mb-0">{{ d.description }}</p>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center small">
              <div class="d-flex gap-3 text-body-secondary">
                <span><i class="bi bi-box-seam me-1"></i>{{ d.order_number }}</span>
                <span><i class="bi bi-person me-1"></i>{{ d.customer_name }}</span>
              </div>
              <div class="d-flex gap-2" @click.stop>
                <button @click="resolve(d.uuid, 'refund')" class="btn btn-success btn-sm">Issue Refund</button>
                <button @click="resolve(d.uuid, 'deny')" class="btn btn-outline-danger btn-sm">Deny</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <div v-if="detail" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);overflow-y:auto;">
      <div class="modal-dialog modal-lg"><div class="modal-content">
        <div class="modal-header"><h5 class="modal-title">Dispute Detail — {{ detail.order?.order_number }}</h5><button type="button" class="btn-close" @click="detail=null"></button></div>
        <div class="modal-body" style="max-height:70vh;overflow-y:auto;">
          <div class="row mb-3"><div class="col-6"><small class="text-body-secondary">Customer</small><p class="fw-medium small mb-0">{{ detail.customer?.name }}</p><small class="text-body-secondary">{{ detail.customer?.email }} &middot; {{ detail.customer?.phone }}</small></div><div class="col-6"><small class="text-body-secondary">Reason</small><p class="mb-1"><span class="badge text-capitalize" :class="reasonBadge(detail.reason)">{{ formatReason(detail.reason) }}</span></p><p class="small mb-0">{{ detail.description }}</p></div></div>
          <div class="bg-light rounded p-3 mb-3 small"><small class="text-body-secondary">Order Summary</small><div class="row mt-1"><div class="col-4"><span class="text-body-secondary">Restaurant:</span> {{ detail.order?.restaurant }}</div><div class="col-4"><span class="text-body-secondary">Driver:</span> {{ detail.order?.driver?.name || 'N/A' }}</div><div class="col-4"><span class="text-body-secondary">Total:</span> AED {{ detail.order?.total }}</div></div></div>
          <div v-if="detail.photos?.length" class="mb-3"><small class="text-body-secondary d-block mb-2">Customer Evidence Photos</small><div class="d-flex gap-2"><a v-for="(p,i) in detail.photos" :key="i" :href="p" target="_blank"><img :src="p" class="rounded" style="width:96px;height:96px;object-fit:cover;" /></a></div></div>
          <div class="mb-3"><small class="text-body-secondary d-block mb-2">Order Timeline</small><div v-for="(t,i) in detail.order?.timeline" :key="i" class="d-flex gap-2 mb-2 small"><div class="d-flex flex-column align-items-center"><div class="rounded-circle" style="width:8px;height:8px;margin-top:6px;" :class="i === detail.order.timeline.length-1 ? 'bg-success' : 'bg-secondary'"></div><div v-if="i < detail.order.timeline.length-1" class="bg-secondary" style="width:2px;flex:1;"></div></div><div><span class="fw-medium text-capitalize">{{ t.to }}</span> <small class="text-body-secondary">{{ t.by }} — {{ formatDate(t.at) }}</small><p v-if="t.note" class="small mb-0 text-body-secondary">{{ t.note }}</p></div></div></div>
        </div>
        <div class="modal-footer bg-light"><button @click="resolveAndClose('deny')" class="btn btn-outline-danger btn-sm">Deny Dispute</button><button @click="resolveAndClose('refund')" class="btn btn-success btn-sm">Issue Full Refund</button></div>
      </div></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../stores/api';

const loading = ref(true);
const disputes = ref([]);
const detail = ref(null);

onMounted(async () => {
  const { data } = await api.get('/admin/disputes?status=open');
  disputes.value = data.data.data || [];
  loading.value = false;
});

async function openDetail(uuid) {
  try {
    const { data } = await api.get(`/admin/disputes/${uuid}`);
    detail.value = data.data;
  } catch(e) { console.error(e); }
}

async function resolve(uuid, resolution) {
  await api.post(`/admin/disputes/${uuid}/resolve`, { resolution, note: `Resolved as ${resolution}.` });
  disputes.value = disputes.value.filter(d => d.uuid !== uuid);
}

async function resolveAndClose(resolution) {
  await resolve(detail.value.uuid, resolution);
  detail.value = null;
}

function reasonBadge(r) {
  return { not_delivered:'bg-danger', missing_items:'bg-warning', wrong_items:'bg-warning text-dark', quality:'bg-info', driver_behavior:'bg-secondary' }[r] || 'bg-secondary';
}
function payBadge(s) {
  return { captured:'bg-success', pre_authorized:'bg-info', refunded:'bg-secondary', voided:'bg-secondary' }[s] || 'bg-secondary';
}
function formatReason(r) { return r?.replace(/_/g, ' ') || ''; }
function formatDate(d) { return d ? new Date(d).toLocaleString() : ''; }
</script>
