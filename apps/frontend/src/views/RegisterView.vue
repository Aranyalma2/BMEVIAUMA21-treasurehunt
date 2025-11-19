<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const username = ref('');
const name = ref('');
const password = ref('');
const confirmPassword = ref('');
const isSubmitting = ref(false);
const validationError = ref('');

const handleRegister = async () => {
  validationError.value = '';

  if (!username.value || !name.value || !password.value || !confirmPassword.value) {
    validationError.value = 'All fields are required';
    return;
  }

  if (password.value !== confirmPassword.value) {
    validationError.value = 'Passwords do not match';
    return;
  }

  if (password.value.length < 6) {
    validationError.value = 'Password must be at least 6 characters';
    return;
  }

  isSubmitting.value = true;
  const success = await authStore.register(username.value, name.value, password.value);
  isSubmitting.value = false;

  if (success) {
    router.push('/map');
  }
};

const goToLogin = () => {
  router.push('/login');
};
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-green-600 to-green-800 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800">Create Account</h1>
          <p class="text-gray-600 mt-2">Join the treasure hunt</p>
        </div>

        <form class="space-y-5" @submit.prevent="handleRegister">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2"> Username </label>
            <input
              id="username"
              v-model="username"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Choose a username"
            />
          </div>

          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2"> Full Name </label>
            <input
              id="name"
              v-model="name"
              type="text"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2"> Password </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Choose a password (min. 6 characters)"
            />
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2"> Confirm Password </label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="Confirm your password"
            />
          </div>

          <div
            v-if="validationError || authStore.error"
            class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm"
          >
            {{ validationError || authStore.error }}
          </div>

          <button
            type="submit"
            :disabled="isSubmitting"
            class="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg"
          >
            {{ isSubmitting ? 'Creating account...' : 'Register' }}
          </button>

          <div class="text-center">
            <button type="button" class="text-green-600 hover:text-green-800 font-medium text-sm" @click="goToLogin">
              Already have an account? Sign in here
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
