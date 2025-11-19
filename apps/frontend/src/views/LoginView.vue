<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const password = ref('');
const isSubmitting = ref(false);

const handleLogin = async () => {
  if (!username.value || !password.value) {
    return;
  }

  isSubmitting.value = true;
  const success = await authStore.login(username.value, password.value);
  isSubmitting.value = false;

  if (success) {
    router.push('/map');
  }
};

const goToRegister = () => {
  router.push('/register');
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-blue-600 to-blue-800 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Treasure Hunt</h1>
          <p class="text-gray-600 mt-2">Sign in to start your adventure</p>
        </div>

        <form class="space-y-6" @submit.prevent="handleLogin">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2"> Username </label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2"> Password </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Enter your password"
            />
          </div>

          <div v-if="authStore.error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {{ authStore.error }}
          </div>

          <button
            type="submit"
            :disabled="isSubmitting || !username || !password"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
          </button>

          <div class="text-center">
            <button type="button" class="text-blue-600 hover:text-blue-800 font-medium text-sm" @click="goToRegister">
              Don't have an account? Register here
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
input:focus {
  outline: none;
}
</style>
