import { createRouter, createWebHistory } from 'vue-router';
import { useRestaurantAuthStore } from './stores/auth';

const routes = [
  {
    path: '/restaurant/login',
    name: 'Login',
    component: () => import('./views/Login.vue'),
    meta: { guest: true },
  },
  {
    path: '/restaurant/',
    name: 'Dashboard',
    component: () => import('./views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  { path: '/restaurant/:pathMatch(.*)*', redirect: '/restaurant/' },
  { path: '/:pathMatch(.*)*', redirect: '/restaurant/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const auth = useRestaurantAuthStore();
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    next('/restaurant/login');
  } else if (to.meta.guest && auth.isAuthenticated) {
    next('/restaurant/');
  } else {
    next();
  }
});

export default router;
