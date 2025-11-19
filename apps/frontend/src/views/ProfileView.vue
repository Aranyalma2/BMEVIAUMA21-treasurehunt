<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import apiClient from '@/api/client';
import BottomNav from '@/components/BottomNav.vue';

const authStore = useAuthStore();
const router = useRouter();

const user = ref(authStore.user);
const isLoading = ref(false);
const showDeleteConfirm = ref(false);

const handleDeleteAccount = async () => {
  const success = await authStore.deleteAccount();
  if (success) {
    router.push('/login');
  }
};

onMounted(() => {
  if (authStore.isAuthenticated()) {
    authStore.fetchCurrentUser();
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100 pb-20">
    <div class="bg-blue-600 text-white p-6 pb-8">
      <h1 class="text-2xl font-bold">Profile</h1>
    </div>

    <div class="p-4 space-y-4">
      <!-- User Info Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center space-x-4 mb-6">
          <div
            class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold"
          >
            {{ user?.name?.charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-800">{{ user?.name }}</h2>
            <p class="text-gray-600">@{{ user?.username }}</p>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-yellow-50 rounded-lg p-4 text-center">
            <div class="text-3xl font-bold text-yellow-600">{{ user?.score || 0 }}</div>
            <div class="text-sm text-gray-600 mt-1">Total Points</div>
          </div>
          <div
            class="bg-green-50 rounded-lg p-4 text-center cursor-pointer hover:bg-green-100 transition-colors"
            @click="router.push('/completed-missions')"
          >
            <div class="text-3xl font-bold text-green-600">{{ user?.completedTaskCount || 0 }}</div>
            <div class="text-sm text-gray-600 mt-1">Missions Completed</div>
            <div class="text-xs text-green-600 mt-1">→ View All</div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="space-y-3">
        <button
          class="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          @click="
            authStore.logout();
            router.push('/login');
          "
        >
          Sign Out
        </button>

        <button
          class="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          @click="showDeleteConfirm = true"
        >
          Delete Account
        </button>
      </div>

      <!-- Delete Confirmation Modal -->
      <div
        v-if="showDeleteConfirm"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        @click="showDeleteConfirm = false"
      >
        <div class="bg-white rounded-lg p-6 max-w-sm w-full" @click.stop>
          <h3 class="text-lg font-bold text-gray-800 mb-2">Delete Account?</h3>
          <p class="text-gray-600 mb-6">This action cannot be undone. All your data will be permanently deleted.</p>
          <div class="flex space-x-3">
            <button
              class="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors"
              @click="showDeleteConfirm = false"
            >
              Cancel
            </button>
            <button
              class="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              @click="handleDeleteAccount"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>
