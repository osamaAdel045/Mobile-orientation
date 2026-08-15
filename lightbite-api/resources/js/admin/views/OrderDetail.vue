<template>
  <div>
    <router-link to="/admin/orders" class="btn btn-sm btn-outline-secondary mb-3">&larr; Back to Orders</router-link>

    <div v-if="loading" class="card shadow-sm">
      <div class="card-body placeholder-glow py-4">
        <span class="placeholder col-3 mb-2 d-block"></span>
        <span class="placeholder col-8 d-block"></span>
        <span class="placeholder col-5 d-block mt-2"></span>
      </div>
    </div>

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
              <h4 class="mb-1 d-flex align-items-center gap-2">
                Order {{ order.order_number }}
                <span v-if="liveBadge" class="badge bg-success small"><span class="live-dot me-1"></span>LIVE</span>
              </h4>
              <span class="badge text-capitalize" :class="statusBadge(order.status)">{{ order.status }}</span>
              <span class="text-body-tertiary ms-2 small">Placed {{ formatDate(order.created_at) }}</span>
            </div>
            <div class="d-flex gap-2">
              <button v-if="canReassign" @click="openReassign" class="btn btn-outline-info btn-sm"><i class="bi bi-arrow-repeat me-1"></i>Reassign Driver</button>
              <button v-if="canRefund" @click="openRefund" class="btn btn-outline-warning btn-sm"><i class="bi bi-cash-coin me-1"></i>Refund</button>
              <button v-if="canCancel" @click="cancelOrder" class="btn btn-outline-danger btn-sm"><i class="bi bi-x-circle me-1"></i>Cancel &amp; Refund</button>
            </div>
          </div>

          <!-- Status flow stepper -->
          <div v-if="isActive" class="status-stepper mt-4 pt-3 border-top">
            <div v-for="(s, i) in flow" :key="s" class="status-step" :class="{ completed: i < currentIndex, current: i === currentIndex }">
              <div class="step-dot"><i v-if="i < currentIndex" class="bi bi-check"></i><span v-else-if="i === currentIndex" class="fw-bold">{{ i + 1 }}</span></div>
              <div class="step-label text-capitalize">{{ s }}</div>
            </div>
          </div>
          <div v-else class="mt-3 pt-3 border-top small">
            <span class="badge bg-danger text-capitalize">{{ order.status }}</span>
            <span class="text-body-secondary ms-2">Order is no longer in the active flow.</span>
          </div>

          <div class="row mt-3 pt-3 border-top small">
            <div class="col-6 col-md-3"><small class="text-body-secondary">Subtotal</small><p class="fw-semibold mb-0">AED {{ order.subtotal }}</p></div>
            <div class="col-6 col-md-3"><small class="text-body-secondary">Delivery Fee</small><p class="fw-semibold mb-0">AED {{ order.delivery_fee }}</p></div>
            <div class="col-6 col-md-3"><small class="text-body-secondary">Tax</small><p class="fw-semibold mb-0">AED {{ order.tax }}</p></div>
            <div class="col-6 col-md-3"><small class="text-body-secondary">Total</small><p class="fw-bold mb-0 fs-5">AED {{ order.total }}</p></div>
          </div>
        </div>
      </div>

      <!-- Three columns: Items + People + Timeline -->
      <div class="row mb-3">
        <!-- Items -->
        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header"><h6 class="card-title mb-0">Items</h6></div>
            <div class="card-body small">
              <div v-for="(item, i) in order.items" :key="i" class="d-flex justify-content-between mb-2">
                <div><span>{{ item.quantity }}x {{ item.name }}</span><p v-if="item.special_instructions" class="text-body-secondary fst-italic small mb-0">"{{ item.special_instructions }}"</p></div>
                <span class="fw-medium">AED {{ item.unit_price }}</span>
              </div>
              <div v-if="order.customer_note" class="mt-2 pt-2 border-top">
                <small class="text-body-secondary">Customer Note</small>
                <p class="small mb-0">{{ order.customer_note }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- People -->
        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm h-100">
            <div class="card-header"><h6 class="card-title mb-0">Parties</h6></div>
            <div class="card-body small">
              <dl class="mb-0">
                <dt class="text-body-secondary">Customer</dt>
                <dd class="fw-medium mb-2">{{ order.customer?.name }} <small class="text-body-secondary d-block">{{ order.customer?.email }} · {{ order.customer?.phone }}</small></dd>
                <dt class="text-body-secondary">Restaurant</dt>
                <dd class="fw-medium mb-2">{{ order.restaurant?.name }} <small class="text-body-secondary d-block">{{ order.restaurant?.phone }}</small></dd>
                <dt class="text-body-secondary">Driver</dt>
                <dd v-if="order.driver" class="fw-medium mb-0">
                  <i class="bi bi-bicycle me-1"></i>{{ order.driver.name }}
                  <small class="text-body-secondary d-block"><a :href="`tel:${order.driver.phone}`" class="text-decoration-none">{{ order.driver.phone }}</a></small>
                </dd>
                <dd v-else class="text-body-secondary mb-0">Not assigned</dd>
              </dl>

              <!-- Driver live GPS position (streamed from the driver app when available) -->
              <div v-if="driverLocation" class="mt-2 pt-2 border-top">
                <small class="text-body-secondary">Driver Location</small>
                <p class="mb-0 small">
                  <i class="bi bi-geo-alt-fill text-danger me-1"></i>
                  <span class="fw-medium">Live position</span>
                  <small class="text-body-secondary ms-1">lat {{ order.driver.lat }}, lng {{ order.driver.lng }}</small>
                </p>
              </div>

              <div v-if="order.payment" class="mt-2 pt-2 border-top">
                <small class="text-body-secondary">Payment</small>
                <p class="mb-1"><span class="badge" :class="payBadge(order.payment.status)">{{ order.payment.status }}</span></p>
                <small class="text-body-secondary text-break">Stripe: {{ order.payment.stripe_id }}</small>
              </div>

              <div v-if="order.delivery_address" class="mt-2 pt-2 border-top">
                <small class="text-body-secondary">Delivery Address</small>
                <p class="small mb-0">{{ order.delivery_address.address }}</p>
              </div>

              <div v-if="order.commission || order.driver_earnings" class="mt-2 pt-2 border-top">
                <small class="text-body-secondary">Platform Economics</small>
                <div class="row mt-1">
                  <div v-if="order.commission" class="col-6"><small>Commission</small><p class="fw-semibold mb-0">AED {{ order.commission }}</p></div>
                  <div v-if="order.driver_earnings" class="col-6"><small>Driver Earnings</small><p class="fw-semibold mb-0">AED {{ order.driver_earnings }}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline + Notes -->
        <div class="col-lg-4 mb-3">
          <div class="card shadow-sm mb-3">
            <div class="card-header"><h6 class="card-title mb-0">Status Timeline</h6></div>
            <div class="card-body small" style="max-height: 300px; overflow-y: auto;">
              <div v-for="(t, i) in order.timeline" :key="i" class="d-flex gap-2 mb-2">
                <div class="d-flex flex-column align-items-center">
                  <div class="rounded-circle" :class="timelineDot(i, order.timeline.length)" style="width:8px;height:8px;margin-top:6px;"></div>
                  <div v-if="i < order.timeline.length - 1" class="bg-secondary" style="width:2px;flex:1;"></div>
                </div>
                <div>
                  <p class="fw-medium mb-0 text-capitalize small">{{ t.to }}</p>
                  <small class="text-body-secondary">{{ t.by }} — {{ formatDate(t.at) }}</small>
                  <p v-if="t.note" class="small mb-0 mt-1" :class="{ 'text-primary fw-medium': t.note?.startsWith('[ADMIN NOTE]') }">{{ t.note }}</p>
                </div>
              </div>
              <p v-if="!order.timeline?.length" class="text-body-secondary text-center mb-0 py-2">No status events yet</p>
            </div>
          </div>

          <div class="card shadow-sm">
            <div class="card-header"><h6 class="card-title mb-0">Internal Notes</h6></div>
            <div class="card-body small">
              <div class="mb-2" style="max-height:150px;overflow-y:auto;">
                <div v-for="(t, i) in adminNotes" :key="i" class="bg-info bg-opacity-10 rounded p-2 mb-1">
                  <p class="small mb-0">{{ t.note?.replace('[ADMIN NOTE] ', '') }}</p>
                  <small class="text-body-secondary">{{ t.by }} — {{ formatDate(t.at) }}</small>
                </div>
                <p v-if="!adminNotes.length" class="text-body-secondary text-center mb-0">No internal notes yet</p>
              </div>
              <div class="d-flex gap-2">
                <input v-model="newNote" @keyup.enter="addNote" placeholder="Add internal note&hellip;" class="form-control form-control-sm" />
                <button @click="addNote" :disabled="!newNote.trim()" class="btn btn-sm btn-info">Add</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reassign Modal -->
      <div v-if="showReassignModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Reassign Driver</h5><button type="button" class="btn-close" @click="showReassignModal = false"></button></div>
            <div class="modal-body">
              <p class="small text-body-secondary">Current driver: <strong>{{ order.driver?.name || 'None' }}</strong></p>
              <label class="form-label small">Assign a driver (empty = unassign back to pool)</label>
              <select v-model="reassignUuid" class="form-select form-select-sm">
                <option value="">— Unassign (return to pool) —</option>
                <option v-for="d in availableDrivers" :key="d.uuid" :value="d.uuid">{{ d.name }} <template v-if="d.is_online">(online)</template></option>
              </select>
            </div>
            <div class="modal-footer">
              <button @click="showReassignModal = false" class="btn btn-secondary btn-sm">Cancel</button>
              <button @click="doReassign" :disabled="reassignLoading" class="btn btn-warning btn-sm">Apply</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Refund Modal -->
      <div v-if="showRefundModal" class="modal d-block" tabindex="-1" style="background: rgba(0,0,0,0.4);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header"><h5 class="modal-title">Refund Order</h5><button type="button" class="btn-close" @click="showRefundModal = false"></button></div>
            <div class="modal-body">
              <p class="small text-body-secondary">Order total: AED {{ order.total }}. Leave amount empty for full refund.</p>
              <div class="mb-3">
                <label class="form-label small">Amount (AED) — empty = full refund</label>
                <input v-model="refundAmount" type="number" step="0.01" min="0.01" :max="order.total" placeholder="Full refund" class="form-control form-control-sm" />
              </div>
              <textarea v-model="refundReason" class="form-control form-control-sm" rows="2" placeholder="Reason for refund&hellip;"></textarea>
            </div>
            <div class="modal-footer">
              <button @click="showRefundModal = false" class="btn btn-secondary btn-sm">Cancel</button>
              <button @click="doRefund" :disabled="refundLoading" class="btn btn-warning btn-sm">Process Refund</button>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../stores/api';
import { privateAdmin } from '../echo';

const route = useRoute();
const loading = ref(true);
const order = ref(null);
const toast = ref({ show: false, message: '', error: false });
const liveBadge = ref(false);
let toastTimer = null;
let pollTimer = null;
let adminChannel = null;

const showRefundModal = ref(false);
const refundAmount = ref('');
const refundReason = ref('');
const refundLoading = ref(false);

const showReassignModal = ref(false);
const reassignUuid = ref('');
const reassignLoading = ref(false);
const availableDrivers = ref([]);

const newNote = ref('');

const FLOW = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivering', 'delivered'];
const ACTIVE = ['pending', 'confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivering'];

const flow = FLOW;
const currentIndex = computed(() => FLOW.indexOf(order.value?.status));
const isActive = computed(() => ACTIVE.includes(order.value?.status));

const driverLocation = computed(() => {
  const d = order.value?.driver;
  return d?.lat != null && d?.lng != null && d.lat !== '' && d.lng !== '';
});

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

async function fetchOrder() {
  try {
    const { data } = await api.get(`/admin/orders/${route.params.uuid}`);
    const prev = order.value?.status;
    order.value = data.data;
    if (prev && prev !== data.data.status) {
      showToast(`Status updated: ${prev} → ${data.data.status}`);
    }
  } catch (e) {
    console.error(e);
    showToast('Failed to load order.', true);
  }
}

function onRealtimeStatus(e) {
  if (e.order_uuid !== route.params.uuid) return;
  liveBadge.value = true;
  setTimeout(() => { liveBadge.value = false; }, 6000);
  // Authoritative reload keeps the timeline + economics in sync.
  fetchOrder();
}

function subscribeRealtime() {
  if (adminChannel) return;
  adminChannel = privateAdmin('order.status_update', onRealtimeStatus);
}

function unsubscribeRealtime() {
  if (adminChannel) {
    try { adminChannel.stopListening('.order.status_update', onRealtimeStatus); } catch (e) { /* ignore */ }
    adminChannel = null;
  }
}

async function loadAvailableDrivers() {
  try {
    const { data } = await api.get('/admin/drivers', { params: { per_page: 100 } });
    availableDrivers.value = data.data.data || [];
  } catch (e) { /* non-fatal */ }
}

onMounted(async () => {
  loading.value = true;
  await Promise.all([fetchOrder(), loadAvailableDrivers()]);
  loading.value = false;
  subscribeRealtime();
  // Polling fallback every 15s in case the socket drops.
  pollTimer = setInterval(fetchOrder, 15000);
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  unsubscribeRealtime();
});

async function cancelOrder() {
  if (!confirm('Cancel this order and refund the customer?')) return;
  try {
    await api.post(`/admin/orders/${route.params.uuid}/cancel`, { reason: 'Cancelled by admin.' });
    order.value.status = 'cancelled';
    showToast('Order cancelled and refunded.');
  } catch (e) { showToast(e.response?.data?.message || 'Failed to cancel order.', true); }
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

function openReassign() {
  reassignUuid.value = '';
  showReassignModal.value = true;
  loadAvailableDrivers();
}

async function doReassign() {
  reassignLoading.value = true;
  try {
    const body = {};
    if (reassignUuid.value) body.driver_uuid = reassignUuid.value;
    const { data } = await api.post(`/admin/orders/${route.params.uuid}/reassign`, body);
    order.value.status = data.data.status;
    showReassignModal.value = false;
    showToast(data.data.message);
    fetchOrder();
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
    pending: 'bg-warning text-dark', confirmed: 'bg-info', preparing: 'bg-info text-dark', ready: 'bg-primary',
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
