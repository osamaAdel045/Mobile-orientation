<template>
  <div>
    <router-link to="/admin/orders" class="btn btn-sm btn-outline-secondary mb-3">&larr; Back to Orders</router-link>

    <div v-if="loading" class="text-center py-5 text-body-secondary">Loading order&hellip;</div>

    <template v-else-if="order">
      <!-- Toast -->
      <div v-if="toast.show" class="toast show position-fixed bottom-0 end-0 m-3" :class="toast.error ? 'bg-danger text-white' : 'bg-success text-white'" style="z-index: 1055;">
        <div class="toast-body d-flex gap-2 align-items-center">{{ toast.message }}</div>
      </div>

      <!-- Header -->
      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
            <div>
              <h4 class="mb-1">Order {{ order.order_number }}</h4>
              <span class="badge text-capitalize" :class="statusBadge(order.status)">{{ order.status }}</span>
            </div>
            <div class="d-flex gap-2">
              <button v-if="canRefund" @click="openRefund" class="btn btn-outline-warning btn-sm">Refund</button>
              <button v-if="canCancel" @click="cancelOrder" class="btn btn-outline-danger btn-sm">Cancel &amp; Refund</button>
            </div>
          </div>
          <div class="row mt-3 pt-3 border-top small">
            <div class="col-6 col-md-3"><small class="text-body-secondary">Subtotal</small><p class="fw-semibold mb-0">AED {{ order.subtotal }}</p></div>
            <div class="col-6 col-md-3"><small class="text-body-secondary">Delivery Fee</small><p class="fw-semibold mb-0">AED {{ order.delivery_fee }}</p></div>
            <div class="col-6 col-md-3"><small class="text-body-secondary">Tax (5%)</small><p class="fw-semibold mb-0">AED {{ order.tax }}</p></div>
            <div class="col-6 col-md-3"><small class="text-body-secondary">Total</small><p class="fw-bold mb-0 fs-5">AED {{ order.total }}</p></div>
          </div>
        </div>
      </div>

      <!-- Three columns: Items + People + Timeline -->
      <div class="row mb-3">
        <!-- Items -->
        <div class="col-lg-4 mb-3"><div class="card shadow-sm"><div class="card-header"><h6 class="card-title mb-0">Items</h6></div><div class="card-body small"><div v-for="(item, i) in order.items" :key="i" class="d-flex justify-content-between mb-2"><div><span>{{ item.quantity }}x {{ item.name }}</span><p v-if="item.special_instructions" class="text-body-secondary fst-italic small mb-0">"{{ item.special_instructions }}"</p></div><span class="fw-medium">AED {{ item.unit_price }}</span></div><div v-if="order.customer_note" class="mt-2 pt-2 border-top"><small class="text-body-secondary">Customer Note</small><p class="small mb-0">{{ order.customer_note }}</p></div></div></div></div>

        <!-- People -->
        <div class="col-lg-4 mb-3"><div class="card shadow-sm"><div class="card-header"><h6 class="card-title mb-0">People</h6></div><div class="card-body small"><dl class="mb-2"><dt class="text-body-secondary">Customer</dt><dd class="fw-medium mb-2">{{ order.customer?.name }} <small class="text-body-secondary">{{ order.customer?.email }}</small></dd><dt class="text-body-secondary">Restaurant</dt><dd class="fw-medium mb-2">{{ order.restaurant?.name }} <small class="text-body-secondary">{{ order.restaurant?.phone }}</small></dd><dt class="text-body-secondary">Driver</dt><dd v-if="order.driver" class="fw-medium mb-0">{{ order.driver.name }}</dd><dd v-else class="text-body-secondary mb-0">Not assigned</dd></dl><div v-if="order.payment" class="mt-2 pt-2 border-top"><small class="text-body-secondary">Payment</small><p class="mb-1"><span class="badge" :class="payBadge(order.payment.status)">{{ order.payment.status }}</span></p><small class="text-body-secondary">Stripe: {{ order.payment.stripe_id }}</small></div><div v-if="order.delivery_address" class="mt-2 pt-2 border-top"><small class="text-body-secondary">Delivery Address</small><p class="small mb-0">{{ order.delivery_address.address }}</p></div><div v-if="canReassign" class="mt-2 pt-2 border-top"><small class="text-body-secondary">Reassign Driver</small><div class="d-flex gap-2 mt-1"><select v-model="reassignUuid" class="form-select form-select-sm"><option value="">— Unassign (return to pool) —</option><option v-for="d in availableDrivers" :key="d.uuid" :value="d.uuid">{{ d.name }}</option></select><button @click="doReassign" :disabled="reassignLoading" class="btn btn-sm btn-warning">Apply</button></div></div></div></div></div>

        <!-- Timeline + Notes -->
        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm mb-3"><div class="card-header"><h6 class="card-title mb-0">Status Timeline</h6></div><div class="card-body small"><div v-for="(t, i) in order.timeline" :key="i" class="d-flex gap-2 mb-2"><div class="d-flex flex-column align-items-center"><div class="rounded-circle" :class="timelineDot(i, order.timeline.length)" style="width:8px;height:8px;margin-top:6px;"></div><div v-if="i < order.timeline.length - 1" class="bg-secondary" style="width:2px;flex:1;"></div></div><div><p class="fw-medium mb-0 text-capitalize small">{{ t.to }}</p><small class="text-body-secondary">{{ t.by }} — {{ formatDate(t.at) }}</small><p v-if="t.note" class="small mb-0 mt-1" :class="{ 'text-primary fw-medium': t.note?.startsWith('[ADMIN NOTE]') }">{{ t.note }}</p></div></div></div></div>

          <div class="card shadow-sm"><div class="card-header"><h6 class="card-title mb-0">Internal Notes</h6></div><div class="card-body small"><div class="mb-2" style="max-height:200px;overflow-y:auto;"><div v-for="(t, i) in adminNotes" :key="i" class="bg-info bg-opacity-10 rounded p-2 mb-1"><p class="small mb-0">{{ t.note?.replace('[ADMIN NOTE] ', '') }}</p><small class="text-body-secondary">{{ t.by }} — {{ formatDate(t.at) }}</small></div><p v-if="!adminNotes.length" class="text-body-secondary text-center mb-0">No internal notes yet</p></div><div class="d-flex gap-2"><input v-model="newNote" @keyup.enter="addNote" placeholder="Add internal note&hellip;" class="form-control form-control-sm" /><button @click="addNote" :disabled="!newNote.trim()" class="btn btn-sm btn-info">Add</button></div></div></div>
        </div>
      </div>

      <!-- Commission & Earnings -->
      <div v-if="order.commission" class="card shadow-sm mb-3"><div class="card-header"><h6 class="card-title mb-0">Platform Economics</h6></div><div class="card-body small"><div class="row"><div class="col-4"><small class="text-body-secondary">Commission</small><p class="fw-semibold mb-0">AED {{ order.commission }}</p></div><div v-if="order.driver_earnings" class="col-4"><small class="text-body-secondary">Driver Earnings</small><p class="fw-semibold mb-0">AED {{ order.driver_earnings }}</p></div><div class="col-4"><small class="text-body-secondary">Platform Revenue</small><p class="fw-semibold mb-0">AED {{ order.commission }}</p></div></div></div></div>

      <!-- Refund Modal -->
      <div v-if="showRefundModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);">
        <div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Refund Order</h5><button type="button" class="btn-close" @click="showRefundModal = false"></button></div><div class="modal-body"><p class="small text-body-secondary">Order total: AED {{ order.total }}. Leave amount empty for full refund.</p><div class="mb-3"><label class="form-label small">Amount (AED) — empty = full refund</label><input v-model="refundAmount" type="number" step="0.01" min="0.01" :max="order.total" placeholder="Full refund" class="form-control form-control-sm" /></div><textarea v-model="refundReason" class="form-control form-control-sm" rows="2" placeholder="Reason for refund&hellip;"></textarea></div><div class="modal-footer"><button @click="showRefundModal = false" class="btn btn-secondary btn-sm">Cancel</button><button @click="doRefund" :disabled="refundLoading" class="btn btn-warning btn-sm">Process Refund</button></div></div></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../stores/api';

const route = useRoute();
const loading = ref(true);
const order = ref(null);
const toast = ref({ show: false, message: '', error: false });
let toastTimer = null;

const showRefundModal = ref(false);
const refundAmount = ref('');
const refundReason = ref('');
const refundLoading = ref(false);

const reassignUuid = ref('');
const reassignLoading = ref(false);
const availableDrivers = ref([]);

const newNote = ref('');

const canCancel = computed(() => ['pending', 'confirmed', 'preparing', 'ready'].includes(order.value?.status));
const canRefund = computed(() => {
  if (!order.value?.payment) return false;
  return ['captured', 'partially_refunded'].includes(order.value.payment.status);
});
const canReassign = computed(() => ['assigned', 'picked_up', 'delivering'].includes(order.value?.status));
const adminNotes = computed(() =>
  (order.value?.timeline || []).filter(t => t.note?.startsWith('[ADMIN NOTE]'))
);

function showToast(message, error = false) {
  clearTimeout(toastTimer);
  toast.value = { show: true, message, error };
  toastTimer = setTimeout(() => { toast.value.show = false; }, 3500);
}

onMounted(async () => {
  try {
    const { data } = await api.get(`/admin/orders/${route.params.uuid}`);
    order.value = data.data;
  } catch (e) { console.error(e); }
  loading.value = false;
});

async function cancelOrder() {
  if (!confirm('Cancel this order and refund the customer?')) return;
  try {
    await api.post(`/admin/orders/${route.params.uuid}/cancel`, { reason: 'Cancelled by admin.' });
    order.value.status = 'cancelled';
    showToast('Order cancelled and refunded.');
  } catch (e) { showToast('Failed to cancel order.', true); }
}

function openRefund() {
  refundAmount.value = '';
  refundReason.value = '';
  showRefundModal.value = true;
}

async function doRefund() {
  refundLoading.value = true;
  try {
    const body = { reason: refundReason.value || 'Refunded by admin.' };
    if (refundAmount.value) body.amount_fils = Math.round(parseFloat(refundAmount.value) * 100);
    const { data: res } = await api.post(`/admin/orders/${route.params.uuid}/refund`, body);
    if (res.data.status) order.value.status = res.data.status;
    if (res.data.payment_status) order.value.payment.status = res.data.payment_status;
    showRefundModal.value = false;
    showToast(res.data.message);
  } catch (e) { showToast(e.response?.data?.message || 'Refund failed.', true); }
  refundLoading.value = false;
}

async function doReassign() {
  reassignLoading.value = true;
  try {
    const body = {};
    if (reassignUuid.value) body.driver_uuid = reassignUuid.value;
    const { data } = await api.post(`/admin/orders/${route.params.uuid}/reassign`, body);
    order.value.status = data.data.status;
    reassignUuid.value = '';
    showToast(data.data.message);
  } catch (e) { showToast(e.response?.data?.message || 'Reassign failed.', true); }
  reassignLoading.value = false;
}

async function addNote() {
  const note = newNote.value.trim();
  if (!note) return;
  try {
    await api.post(`/admin/orders/${route.params.uuid}/note`, { note });
    order.value.timeline.push({
      to: order.value.status, by: 'admin', at: new Date().toISOString(), note: '[ADMIN NOTE] ' + note,
    });
    newNote.value = '';
    showToast('Note added.');
  } catch (e) { showToast('Failed to add note.', true); }
}

function statusBadge(s) {
  return {
    pending: 'bg-warning', confirmed: 'bg-info', preparing: 'bg-info text-dark', ready: 'bg-primary',
    assigned: 'bg-info', picked_up: 'bg-primary', delivering: 'bg-warning text-dark', delivered: 'bg-success',
    cancelled: 'bg-danger', rejected: 'bg-danger', disputed: 'bg-danger', refunded: 'bg-secondary', expired: 'bg-light text-dark',
  }[s] || 'bg-secondary';
}

function payBadge(s) {
  return {
    pre_authorized: 'bg-info', captured: 'bg-success', partially_refunded: 'bg-warning',
    voided: 'bg-secondary', refunded: 'bg-secondary',
  }[s] || 'bg-secondary';
}

function timelineDot(i, len) { return i === len - 1 ? 'bg-success' : 'bg-secondary'; }
function formatDate(d) { return d ? new Date(d).toLocaleString() : ''; }
</script>
