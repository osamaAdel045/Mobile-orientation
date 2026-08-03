import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from './stores/auth';

const routes = [
    { path: '/admin/login', name: 'Login', component: () => import('./views/Login.vue'), meta: { guest: true } },
    { path: '/admin', name: 'Dashboard', component: () => import('./views/Dashboard.vue'), meta: { auth: true } },
    { path: '/admin/users', name: 'Users', component: () => import('./views/Users.vue'), meta: { auth: true } },
    { path: '/admin/users/:uuid', name: 'UserDetail', component: () => import('./views/UserDetail.vue'), meta: { auth: true } },
    { path: '/admin/restaurants', name: 'Restaurants', component: () => import('./views/RestaurantList.vue'), meta: { auth: true } },
    { path: '/admin/restaurants/:uuid', name: 'RestaurantDetail', component: () => import('./views/RestaurantDetail.vue'), meta: { auth: true } },
    { path: '/admin/drivers', name: 'Drivers', component: () => import('./views/DriverList.vue'), meta: { auth: true } },
    { path: '/admin/drivers/:uuid', name: 'DriverDetail', component: () => import('./views/DriverDetail.vue'), meta: { auth: true } },
    { path: '/admin/orders', name: 'Orders', component: () => import('./views/Orders.vue'), meta: { auth: true } },
    { path: '/admin/orders/:uuid', name: 'OrderDetail', component: () => import('./views/OrderDetail.vue'), meta: { auth: true } },
    { path: '/admin/disputes', name: 'Disputes', component: () => import('./views/Disputes.vue'), meta: { auth: true } },
    { path: '/admin/carts', name: 'CartMonitor', component: () => import('./views/CartMonitor.vue'), meta: { auth: true } },
    { path: '/admin/system', name: 'SystemHealth', component: () => import('./views/SystemHealth.vue'), meta: { auth: true } },
    { path: '/admin/analytics', name: 'Analytics', component: () => import('./views/Analytics.vue'), meta: { auth: true } },
    { path: '/admin/security', name: 'Security', component: () => import('./views/Security.vue'), meta: { auth: true } },
    { path: '/admin/audit-logs', name: 'AuditLogs', component: () => import('./views/AuditLogs.vue'), meta: { auth: true } },
    { path: '/admin/theme', name: 'ThemeManager', component: () => import('./views/ThemeManager.vue'), meta: { auth: true } },
    { path: '/admin/settings', name: 'Settings', component: () => import('./views/Settings.vue'), meta: { auth: true } },
    { path: '/admin/:pathMatch(.*)*', redirect: '/admin' },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to, from, next) => {
    const auth = useAuthStore();
    if (to.meta.auth && !auth.isAuthenticated) return next('/admin/login');
    if (to.meta.guest && auth.isAuthenticated) return next('/admin');
    next();
});

export default router;
