<template>
  <div v-if="auth.isAuthenticated">
    <LteDashboardLayout
      :menu="sidebarMenu"
      :current-path="$route.path"
      :link-component="RouterLink"
    >
      <template #topbar>
        <LteTopbar>
          <LteCommandPalette :menu="sidebarMenu" />
          <LteFullscreenToggle />
          <LteColorModeToggle />
          <!-- Realtime indicator -->
          <a
            href="#"
            class="nav-link d-flex align-items-center gap-2"
            :title="realtimeLabel"
            @click.prevent="toggleRealtime"
          >
            <span class="d-flex align-items-center gap-1 small">
              <span class="realtime-dot" :class="'realtime-' + realtimeStatus"></span>
              <span class="d-none d-lg-inline">{{ realtimeLabel }}</span>
            </span>
          </a>
          <!-- User dropdown -->
          <ul class="navbar-nav ms-auto">
            <li class="nav-item dropdown">
              <a
                class="nav-link d-flex align-items-center gap-2 dropdown-toggle"
                href="#"
                data-bs-toggle="dropdown"
              >
                <i class="bi bi-person-circle"></i>
                <span class="d-none d-md-inline">{{ auth.user?.name }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><h6 class="dropdown-header">{{ auth.user?.email }}</h6></li>
                <li><hr class="dropdown-divider" /></li>
                <li><a class="dropdown-item" href="#" @click.prevent="logout"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
              </ul>
            </li>
          </ul>
        </LteTopbar>
      </template>

      <LteAppContent>
        <router-view />
      </LteAppContent>
    </LteDashboardLayout>
  </div>

  <!-- Login / Guest -->
  <div v-else>
    <router-view />
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useRouter } from 'vue-router';
import { realtimeStatus, getEcho, disconnectEcho } from './echo';

const auth = useAuthStore();
const router = useRouter();

import { computed, onMounted } from 'vue';

// Establish the Reverb socket as soon as the admin app boots while authenticated,
// so the realtime indicator is "Live" from the start and events are captured
// even before a view subscribes to a channel.
onMounted(() => {
  if (auth.isAuthenticated) getEcho();
});

const realtimeLabel = computed(() => ({
  connecting: 'Connecting…',
  connected: 'Live',
  disconnected: 'Offline',
  error: 'Connection error',
}[realtimeStatus.value] || 'Connecting…'));

function toggleRealtime() {
  // Reconnect attempt if the socket dropped.
  if (realtimeStatus.value !== 'connected') getEcho();
}

function logout() {
  disconnectEcho();
  auth.logout();
  router.push('/admin/login');
}

const sidebarMenu = [
  { type: 'item', text: 'Dashboard', href: '/admin', icon: 'bi-speedometer2' },
  { type: 'item', text: 'Restaurants', href: '/admin/restaurants', icon: 'bi-shop' },
  { type: 'item', text: 'Drivers', href: '/admin/drivers', icon: 'bi-bicycle' },
  { type: 'item', text: 'Users', href: '/admin/users', icon: 'bi-people' },
  { type: 'item', text: 'Orders', href: '/admin/orders', icon: 'bi-box-seam' },
  { type: 'item', text: 'Disputes', href: '/admin/disputes', icon: 'bi-exclamation-triangle' },
  { type: 'item', text: 'Carts', href: '/admin/carts', icon: 'bi-cart' },
  { type: 'item', text: 'Analytics', href: '/admin/analytics', icon: 'bi-graph-up' },
  {
    type: 'group', text: 'System', children: [
      { type: 'item', text: 'System Health', href: '/admin/system', icon: 'bi-cpu' },
      { type: 'item', text: 'Audit Log', href: '/admin/audit-logs', icon: 'bi-journal-text' },
      { type: 'item', text: 'Security', href: '/admin/security', icon: 'bi-shield-lock' },
      { type: 'item', text: 'Settings', href: '/admin/settings', icon: 'bi-gear' },
      { type: 'item', text: 'Theme', href: '/admin/theme', icon: 'bi-palette' },
    ],
  },
];
</script>
