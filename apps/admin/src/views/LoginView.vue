<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');

const handleSubmit = async () => {
  const success = await authStore.login(username.value, password.value);
  if (success) {
    router.push('/missions');
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-900 flex items-center justify-center">
    <div class="w-full max-w-sm px-4">
      <h1 class="text-2xl font-semibold text-center text-white mb-6">
        Admin Sign In
      </h1>

      <div v-if="authStore.error" class="mb-4 p-3 bg-red-900 border border-red-700 text-red-200 text-sm">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Username
          </label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            placeholder="username"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-300 mb-1">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full px-3 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed"
        >
          {{ authStore.isLoading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped></style>
