import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import apiClient from '@/api/client';
import LoginView from '../views/LoginView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/',
      name: 'home',
      redirect: '/missions',
    },
    {
      path: '/missions',
      name: 'missions',
      component: () => import('../views/MissionsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/missions/:id',
      name: 'mission-detail',
      component: () => import('../views/MissionDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UsersView.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

// Set up 403 Forbidden handler
apiClient.onForbidden(() => {
  const authStore = useAuthStore();
  authStore.logout();
  router.push('/login');
});

// Route guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated()) {
    next('/login');
  } else if (to.path === '/login' && authStore.isAuthenticated()) {
    next('/missions');
  } else {
    next();
  }
});

export default router;
