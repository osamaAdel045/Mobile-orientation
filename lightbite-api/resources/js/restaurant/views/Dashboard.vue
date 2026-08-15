<template>
  <div class="rdb" :class="{ 'rdb--dark': false }">
    <!-- Loading -->
    <div v-if="loading" class="rdb-loading">
      <div class="rdb-spinner"></div>
      <p>Loading dashboard…</p>
    </div>

    <!-- Error -->
    <div v-else-if="loadError" class="rdb-error">
      <div class="rdb-error__icon">🔌</div>
      <h2>Cannot Connect</h2>
      <p>{{ loadError }}</p>
      <div class="rdb-error__help">
        <p><strong>💡 Make sure:</strong></p>
        <ul>
          <li>Open <code>localhost:8000/restaurant</code> (not :5173)</li>
          <li>Run <code>php artisan serve</code></li>
          <li>Run <code>php artisan migrate --seed</code></li>
        </ul>
      </div>
      <button @click="init()" class="rdb-btn rdb-btn--primary">Try Again</button>
    </div>

    <!-- Dashboard -->
    <template v-else>
      <!-- Sidebar -->
      <aside class="rdb-sidebar">
        <div class="rdb-sidebar__logo">
          <span class="rdb-sidebar__logo-icon">🍔</span>
          <span class="rdb-sidebar__logo-text">LightBite</span>
        </div>
        <nav class="rdb-sidebar__nav">
          <a class="rdb-sidebar__link rdb-sidebar__link--active">
            <span>📋</span> Orders
          </a>
          <a class="rdb-sidebar__link">
            <span>📊</span> Earnings
          </a>
          <a class="rdb-sidebar__link">
            <span>🍽️</span> Menu
          </a>
          <a class="rdb-sidebar__link">
            <span>⚙️</span> Settings
          </a>
        </nav>
        <div class="rdb-sidebar__footer">
          <div class="rdb-sidebar__status" :class="restaurant?.is_accepting_orders ? 'is-open' : 'is-closed'">
            <span class="rdb-sidebar__status-dot"></span>
            {{ restaurant?.is_accepting_orders ? 'Open' : 'Closed' }}
          </div>
          <button @click="doLogout" class="rdb-sidebar__logout">Logout</button>
        </div>
      </aside>

      <!-- Main -->
      <main class="rdb-main">
        <!-- Top Bar -->
        <header class="rdb-topbar">
          <div class="rdb-topbar__left">
            <h1 class="rdb-topbar__title">{{ restaurant?.name || 'Restaurant' }}</h1>
            <span class="rdb-topbar__badge" :class="restaurant?.is_accepting_orders ? 'is-open' : 'is-closed'">
              {{ restaurant?.is_accepting_orders ? '● Accepting orders' : '● Paused' }}
            </span>
          </div>
          <div class="rdb-topbar__right">
            <button @click="togglePause" class="rdb-btn" :class="restaurant?.is_accepting_orders ? 'rdb-btn--outline' : 'rdb-btn--primary'">
              {{ restaurant?.is_accepting_orders ? '⏸ Pause orders' : '▶ Resume orders' }}
            </button>
          </div>
        </header>

        <!-- Stats -->
        <div class="rdb-stats">
          <div class="rdb-stat">
            <div class="rdb-stat__icon rdb-stat__icon--blue">📦</div>
            <div class="rdb-stat__info">
              <p class="rdb-stat__value">{{ restaurant?.today_orders ?? 0 }}</p>
              <p class="rdb-stat__label">Today</p>
            </div>
          </div>
          <div class="rdb-stat">
            <div class="rdb-stat__icon rdb-stat__icon--green">💰</div>
            <div class="rdb-stat__info">
              <p class="rdb-stat__value">AED {{ restaurant?.today_revenue ?? '0.00' }}</p>
              <p class="rdb-stat__label">Revenue</p>
            </div>
          </div>
          <div class="rdb-stat">
            <div class="rdb-stat__icon rdb-stat__icon--orange">🔥</div>
            <div class="rdb-stat__info">
              <p class="rdb-stat__value">{{ activeOrders.length }}</p>
              <p class="rdb-stat__label">Active</p>
            </div>
          </div>
          <div class="rdb-stat" :class="{ 'rdb-stat--alert': pendingOrders.length > 0 }">
            <div class="rdb-stat__icon rdb-stat__icon--red">🆕</div>
            <div class="rdb-stat__info">
              <p class="rdb-stat__value">{{ pendingOrders.length }}</p>
              <p class="rdb-stat__label">Pending</p>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div class="rdb-content">
          <!-- PENDING — Most Important -->
          <section v-if="pendingOrders.length > 0" class="rdb-section">
            <div class="rdb-section__header">
              <h2 class="rdb-section__title">
                <span class="rdb-pulse"></span>
                Action Required
              </h2>
              <span class="rdb-badge rdb-badge--red">{{ pendingOrders.length }} new</span>
            </div>
            <div class="rdb-cards">
              <article v-for="order in pendingOrders" :key="order.uuid" class="rdb-order rdb-order--pending">
                <div class="rdb-order__body">
                  <div class="rdb-order__header">
                    <span class="rdb-order__id">{{ order.order_number }}</span>
                    <span class="rdb-order__time">{{ timeAgo(order.created_at) }}</span>
                  </div>
                  <ul class="rdb-order__items">
                    <li v-for="item in order.items" :key="item.name">
                      <strong>{{ item.quantity }}×</strong> {{ item.name }}
                    </li>
                  </ul>
                  <div class="rdb-order__meta">
                    <span class="rdb-order__total">AED {{ order.total }}</span>
                    <span v-if="order.customer" class="rdb-order__customer">👤 {{ order.customer.name }}</span>
                  </div>
                </div>
                <div class="rdb-order__actions">
                  <button @click="acceptOrder(order.uuid)" :disabled="actionLoading === order.uuid" class="rdb-btn rdb-btn--accept">
                    ✓ Accept
                  </button>
                  <button @click="rejectOrder(order.uuid)" :disabled="actionLoading === order.uuid" class="rdb-btn rdb-btn--reject">
                    ✗ Reject
                  </button>
                </div>
              </article>
            </div>
          </section>

          <!-- ACTIVE -->
          <section v-if="activeOrders.length > 0" class="rdb-section">
            <div class="rdb-section__header">
              <h2 class="rdb-section__title">In Progress</h2>
              <span class="rdb-badge rdb-badge--neutral">{{ activeOrders.length }} orders</span>
            </div>
            <div class="rdb-cards">
              <article v-for="order in activeOrders" :key="order.uuid" class="rdb-order">
                <div class="rdb-order__body">
                  <div class="rdb-order__header">
                    <span class="rdb-order__id">{{ order.order_number }}</span>
                    <span class="rdb-tag" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
                  </div>
                  <ul class="rdb-order__items">
                    <li v-for="item in order.items" :key="item.name">
                      <strong>{{ item.quantity }}×</strong> {{ item.name }}
                    </li>
                  </ul>
                  <p class="rdb-order__total">AED {{ order.total }}</p>
                </div>
                <div class="rdb-order__actions">
                  <button v-if="order.status === 'confirmed'" @click="updateStatus(order.uuid, 'preparing')" :disabled="actionLoading === order.uuid" class="rdb-btn rdb-btn--primary">
                    🍳 Start Preparing
                  </button>
                  <button v-if="order.status === 'preparing'" @click="updateStatus(order.uuid, 'ready')" :disabled="actionLoading === order.uuid" class="rdb-btn rdb-btn--primary">
                    📦 Mark Ready
                  </button>
                  <div v-if="order.status === 'ready'" class="rdb-status-chip rdb-status-chip--waiting">
                    <span class="rdb-dot rdb-dot--pulse"></span> Waiting for driver
                  </div>
                  <div v-if="['assigned','picked_up','delivering'].includes(order.status)" class="rdb-status-chip rdb-status-chip--transit">
                    🛵 Driver en route
                  </div>
                </div>
              </article>
            </div>
          </section>

          <!-- EMPTY -->
          <div v-if="pendingOrders.length === 0 && activeOrders.length === 0" class="rdb-empty">
            <div class="rdb-empty__icon">🍽️</div>
            <h3>No orders yet</h3>
            <p>{{ restaurant?.is_accepting_orders ? 'You\'re open and ready. Orders will appear here.' : 'Resume orders to start receiving.' }}</p>
          </div>
        </div>
      </main>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRestaurantAuthStore } from '../stores/auth';
import api from '../stores/api';

const router = useRouter();
const auth = useRestaurantAuthStore();

const loading = ref(true);
const loadError = ref('');
const actionLoading = ref(null);
const restaurant = ref(auth.restaurant);
const pendingOrders = ref([]);
const activeOrders = ref([]);
let pollTimer = null;

async function init() {
  loading.value = true;
  loadError.value = '';
  try {
    const { data } = await api.get('/restaurants/dashboard');
    restaurant.value = data.data;
    auth.restaurant = data.data;
    await fetchOrders();
  } catch (e) {
    loadError.value = e.response?.data?.error?.message || e.message || 'Check that server is running.';
  } finally {
    loading.value = false;
  }
}

async function fetchOrders() {
  try {
    const { data } = await api.get('/restaurants/dashboard/orders?per_page=50');
    const orders = Array.isArray(data.data) ? data.data : [];
    pendingOrders.value = orders.filter((o) => o.status === 'pending');
    activeOrders.value = orders.filter((o) =>
      ['confirmed', 'preparing', 'ready', 'assigned', 'picked_up', 'delivering'].includes(o.status),
    );
  } catch (_) {}
}

async function acceptOrder(uuid) {
  actionLoading.value = uuid;
  try { await api.post(`/restaurants/dashboard/orders/${uuid}/accept`); await refreshAll(); }
  catch (e) { alert(e.response?.data?.error?.message || 'Failed'); }
  finally { actionLoading.value = null; }
}

async function rejectOrder(uuid) {
  actionLoading.value = uuid;
  try { await api.post(`/restaurants/dashboard/orders/${uuid}/reject`); await refreshAll(); }
  catch (e) { alert(e.response?.data?.error?.message || 'Failed'); }
  finally { actionLoading.value = null; }
}

async function updateStatus(uuid, status) {
  actionLoading.value = uuid;
  try { await api.patch(`/restaurants/dashboard/orders/${uuid}/status`, { status }); await fetchOrders(); }
  catch (e) { alert(e.response?.data?.error?.message || 'Failed'); }
  finally { actionLoading.value = null; }
}

async function togglePause() {
  try { await api.post('/restaurants/dashboard/toggle-pause'); await refreshAll(); }
  catch (_) {}
}

async function refreshAll() {
  const { data } = await api.get('/restaurants/dashboard');
  restaurant.value = data.data;
  auth.restaurant = data.data;
  await fetchOrders();
}

function doLogout() { auth.logout(); router.push('/restaurant/login'); }

function statusLabel(s) {
  const m = { confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready', assigned: 'Assigned', picked_up: 'Picked up', delivering: 'Delivering' };
  return m[s] || s;
}

function statusClass(s) {
  const m = { confirmed: 'rdb-tag--blue', preparing: 'rdb-tag--yellow', ready: 'rdb-tag--green', assigned: 'rdb-tag--purple', picked_up: 'rdb-tag--indigo', delivering: 'rdb-tag--cyan' };
  return m[s] || '';
}

function timeAgo(iso) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

onMounted(() => { init(); pollTimer = setInterval(fetchOrders, 10_000); });
onUnmounted(() => clearInterval(pollTimer));
</script>

<style>
/* ================================================================
   LightBite Restaurant Dashboard — Design System
   ================================================================ */

:root {
  --rdb-bg: #F8F6F2;
  --rdb-surface: #FFFFFF;
  --rdb-text: #1A1A1A;
  --rdb-text-secondary: #6B6B6B;
  --rdb-text-muted: #9E9E9E;
  --rdb-border: #EBE6DE;
  --rdb-accent: #F26522;
  --rdb-accent-hover: #E05510;
  --rdb-green: #16A34A;
  --rdb-red: #DC2626;
  --rdb-blue: #2563EB;
  --rdb-yellow: #CA8A04;
  --rdb-purple: #9333EA;
  --rdb-radius: 16px;
  --rdb-radius-sm: 10px;
  --rdb-shadow: 0 1px 3px rgba(0,0,0,.04), 0 1px 2px rgba(0,0,0,.06);
  --rdb-shadow-lg: 0 4px 16px rgba(0,0,0,.06), 0 2px 4px rgba(0,0,0,.04);
  --rdb-font: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --rdb-sidebar-w: 240px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body { font-family: var(--rdb-font); background: var(--rdb-bg); -webkit-font-smoothing: antialiased; }

/* Layout */
.rdb { display: flex; min-height: 100vh; }
.rdb-main { flex: 1; margin-left: var(--rdb-sidebar-w); display: flex; flex-direction: column; }

/* Sidebar */
.rdb-sidebar {
  position: fixed; left: 0; top: 0; bottom: 0;
  width: var(--rdb-sidebar-w); background: #1A1A1A; color: #FFF;
  display: flex; flex-direction: column; padding: 24px 16px; z-index: 100;
}
.rdb-sidebar__logo { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; padding: 0 8px; }
.rdb-sidebar__logo-icon { font-size: 28px; }
.rdb-sidebar__logo-text { font-size: 20px; font-weight: 800; letter-spacing: -.3px; }
.rdb-sidebar__nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
.rdb-sidebar__link {
  display: flex; align-items: center; gap: 10px; padding: 12px 12px; border-radius: var(--rdb-radius-sm);
  color: rgba(255,255,255,.55); font-size: 15px; font-weight: 500; text-decoration: none; cursor: pointer; transition: all .15s;
}
.rdb-sidebar__link:hover { background: rgba(255,255,255,.06); color: #FFF; }
.rdb-sidebar__link--active { background: rgba(255,255,255,.1); color: #FFF; font-weight: 600; }
.rdb-sidebar__link span { font-size: 18px; width: 24px; text-align: center; }
.rdb-sidebar__footer { border-top: 1px solid rgba(255,255,255,.08); padding-top: 16px; display: flex; flex-direction: column; gap: 12px; }
.rdb-sidebar__status { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; padding: 4px 8px; }
.rdb-sidebar__status-dot { width: 8px; height: 8px; border-radius: 50%; }
.rdb-sidebar__status.is-open .rdb-sidebar__status-dot { background: var(--rdb-green); box-shadow: 0 0 0 3px rgba(22,163,74,.2); }
.rdb-sidebar__status.is-closed .rdb-sidebar__status-dot { background: var(--rdb-red); box-shadow: 0 0 0 3px rgba(220,38,38,.2); }
.rdb-sidebar__status.is-open { color: var(--rdb-green); }
.rdb-sidebar__status.is-closed { color: var(--rdb-red); }
.rdb-sidebar__logout { background: none; border: none; color: rgba(255,255,255,.35); font-size: 13px; cursor: pointer; text-align: left; padding: 0 8px; }
.rdb-sidebar__logout:hover { color: #FFF; }

/* Top Bar */
.rdb-topbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 32px; background: var(--rdb-surface); border-bottom: 1px solid var(--rdb-border);
}
.rdb-topbar__left { display: flex; align-items: center; gap: 12px; }
.rdb-topbar__title { font-size: 22px; font-weight: 700; color: var(--rdb-text); letter-spacing: -.3px; }
.rdb-topbar__badge { font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 100px; }
.rdb-topbar__badge.is-open { background: #ECFDF5; color: #065F46; }
.rdb-topbar__badge.is-closed { background: #FEF2F2; color: #991B1B; }

/* Stats Row */
.rdb-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 24px 32px; }
.rdb-stat {
  background: var(--rdb-surface); border-radius: var(--rdb-radius); padding: 20px; display: flex; align-items: center; gap: 16px;
  box-shadow: var(--rdb-shadow); border: 1px solid var(--rdb-border); transition: box-shadow .15s;
}
.rdb-stat:hover { box-shadow: var(--rdb-shadow-lg); }
.rdb-stat--alert { border-color: #FECACA; background: #FFFBFB; }
.rdb-stat__icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
.rdb-stat__icon--blue { background: #EFF6FF; }
.rdb-stat__icon--green { background: #ECFDF5; }
.rdb-stat__icon--orange { background: #FFF7ED; }
.rdb-stat__icon--red { background: #FEF2F2; }
.rdb-stat__value { font-size: 24px; font-weight: 700; color: var(--rdb-text); line-height: 1.1; }
.rdb-stat__label { font-size: 13px; color: var(--rdb-text-secondary); margin-top: 2px; font-weight: 500; }

/* Content */
.rdb-content { padding: 0 32px 32px; flex: 1; }

/* Section */
.rdb-section { margin-bottom: 28px; }
.rdb-section__header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.rdb-section__title { font-size: 17px; font-weight: 700; color: var(--rdb-text); display: flex; align-items: center; gap: 8px; }

/* Pulse dot */
.rdb-pulse { width: 8px; height: 8px; border-radius: 50%; background: var(--rdb-red); display: inline-block; animation: rdb-pulse 1.5s ease-out infinite; }
@keyframes rdb-pulse { 0% { box-shadow: 0 0 0 0 rgba(220,38,38,.4); } 100% { box-shadow: 0 0 0 8px rgba(220,38,38,0); } }

/* Badge */
.rdb-badge { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 100px; }
.rdb-badge--red { background: #FEF2F2; color: #991B1B; }
.rdb-badge--neutral { background: #F5F5F5; color: #525252; }

/* Order Cards */
.rdb-cards { display: flex; flex-direction: column; gap: 12px; }
.rdb-order {
  background: var(--rdb-surface); border-radius: var(--rdb-radius); padding: 20px 24px;
  box-shadow: var(--rdb-shadow); border: 1px solid var(--rdb-border);
  display: flex; align-items: center; justify-content: space-between; gap: 24px; transition: box-shadow .15s;
}
.rdb-order:hover { box-shadow: var(--rdb-shadow-lg); }
.rdb-order--pending { border-left: 4px solid var(--rdb-accent); }
.rdb-order__body { flex: 1; min-width: 0; }
.rdb-order__header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.rdb-order__id { font-size: 15px; font-weight: 700; color: var(--rdb-text); font-family: 'SF Mono', 'Fira Code', monospace; }
.rdb-order__time { font-size: 12px; color: var(--rdb-text-muted); }
.rdb-order__items { list-style: none; margin-bottom: 8px; }
.rdb-order__items li { font-size: 14px; color: var(--rdb-text-secondary); padding: 2px 0; }
.rdb-order__items li strong { color: var(--rdb-text); }
.rdb-order__meta { display: flex; align-items: center; gap: 16px; }
.rdb-order__total { font-size: 16px; font-weight: 700; color: var(--rdb-text); }
.rdb-order__customer { font-size: 13px; color: var(--rdb-text-muted); }
.rdb-order__actions { display: flex; gap: 10px; flex-shrink: 0; }

/* Tags */
.rdb-tag { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 100px; text-transform: uppercase; letter-spacing: .5px; }
.rdb-tag--blue { background: #EFF6FF; color: #1E40AF; }
.rdb-tag--yellow { background: #FEFCE8; color: #854D0E; }
.rdb-tag--green { background: #ECFDF5; color: #065F46; }
.rdb-tag--purple { background: #FAF5FF; color: #6B21A8; }
.rdb-tag--indigo { background: #EEF2FF; color: #3730A3; }
.rdb-tag--cyan { background: #ECFEFF; color: #155E75; }

/* Status Chips */
.rdb-status-chip { font-size: 13px; font-weight: 600; padding: 10px 16px; border-radius: var(--rdb-radius-sm); display: flex; align-items: center; gap: 8px; }
.rdb-status-chip--waiting { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
.rdb-status-chip--transit { background: #FAF5FF; color: #6B21A8; border: 1px solid #D8B4FE; }

/* Dot */
.rdb-dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; display: inline-block; }
.rdb-dot--pulse { animation: rdb-pulse 2s ease-out infinite; }

/* Buttons */
.rdb-btn { font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: var(--rdb-radius-sm); border: none; cursor: pointer; transition: all .15s; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; }
.rdb-btn:disabled { opacity: .5; cursor: not-allowed; }
.rdb-btn--primary { background: var(--rdb-accent); color: #FFF; }
.rdb-btn--primary:hover:not(:disabled) { background: var(--rdb-accent-hover); }
.rdb-btn--outline { background: var(--rdb-surface); color: var(--rdb-text-secondary); border: 1px solid var(--rdb-border); }
.rdb-btn--outline:hover:not(:disabled) { background: #F5F5F5; }
.rdb-btn--accept { background: #16A34A; color: #FFF; font-size: 15px; padding: 12px 28px; }
.rdb-btn--accept:hover:not(:disabled) { background: #15803D; }
.rdb-btn--reject { background: var(--rdb-surface); color: var(--rdb-red); border: 2px solid #FECACA; font-size: 15px; padding: 12px 28px; }
.rdb-btn--reject:hover:not(:disabled) { background: #FEF2F2; }

/* Empty */
.rdb-empty { text-align: center; padding: 80px 20px; }
.rdb-empty__icon { font-size: 64px; margin-bottom: 16px; }
.rdb-empty h3 { font-size: 20px; font-weight: 700; color: var(--rdb-text); margin-bottom: 6px; }
.rdb-empty p { color: var(--rdb-text-secondary); font-size: 15px; }

/* Loading */
.rdb-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 16px; color: var(--rdb-text-muted); font-size: 15px; }
.rdb-spinner { width: 36px; height: 36px; border: 3px solid var(--rdb-border); border-top-color: var(--rdb-accent); border-radius: 50%; animation: rdb-spin .7s linear infinite; }
@keyframes rdb-spin { to { transform: rotate(360deg); } }

/* Error */
.rdb-error { max-width: 440px; margin: 80px auto; text-align: center; }
.rdb-error__icon { font-size: 56px; margin-bottom: 16px; }
.rdb-error h2 { font-size: 22px; font-weight: 700; color: var(--rdb-text); margin-bottom: 6px; }
.rdb-error p { color: var(--rdb-text-secondary); margin-bottom: 20px; }
.rdb-error__help { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: var(--rdb-radius-sm); padding: 16px; text-align: left; margin-bottom: 20px; font-size: 13px; color: #92400E; }
.rdb-error__help ul { list-style: none; margin-top: 6px; }
.rdb-error__help li { padding: 2px 0; }
.rdb-error__help code { background: rgba(0,0,0,.06); padding: 2px 6px; border-radius: 4px; font-size: 12px; }
</style>
