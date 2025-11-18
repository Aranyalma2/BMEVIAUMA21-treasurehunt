<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, RouterView, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated());

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Navigation -->
    <nav v-if="isAuthenticated" class="border-b border-gray-800 bg-gray-900">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-14">
          <div class="flex items-center space-x-6">
            <div class="text-lg font-semibold text-white">Admin</div>
            <div class="flex space-x-1">
              <RouterLink
                to="/missions"
                class="px-2 py-1 text-sm text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-700"
                :class="{ 'border-white text-white': $route.path === '/missions' }"
              >
                Missions
              </RouterLink>
              <RouterLink
                to="/users"
                class="px-2 py-1 text-sm text-gray-400 hover:text-white border-b-2 border-transparent hover:border-gray-700"
                :class="{ 'border-white text-white': $route.path === '/users' }"
              >
                Users
              </RouterLink>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span class="text-sm text-gray-400">{{ authStore.user?.name }}</span>
            <button
              class="px-3 py-1 text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600"
              @click="handleLogout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main :class="isAuthenticated ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' : ''">
      <RouterView />
    </main>
  </div>
</template>

<style scoped></style>
