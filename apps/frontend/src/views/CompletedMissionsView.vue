<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/client';
import BottomNav from '@/components/BottomNav.vue';

interface CompletedMission {
  id: number;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  completedAt: string;
}

const router = useRouter();
const completedMissions = ref<CompletedMission[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchCompletedMissions = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const data = await apiClient.getCompletedMissions();
    completedMissions.value = data;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load completed missions';
  } finally {
    isLoading.value = false;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const goBack = () => {
  router.push('/profile');
};

onMounted(() => {
  fetchCompletedMissions();
});
</script>

<template>
  <div class="flex flex-col h-screen bg-gray-100">
    <!-- Header -->
    <div class="bg-blue-600 text-white p-4 flex-shrink-0">
      <div class="flex items-center justify-center relative">
        <button
          class="absolute left-0 bg-white bg-opacity-20 border border-white border-opacity-30 text-white text-sm font-medium px-4 py-2 rounded hover:bg-opacity-30 transition-colors"
          @click="goBack"
        >
          Back
        </button>
        <h1 class="text-xl font-bold">Completed Missions</h1>
      </div>
    </div>

    <!-- Content Area - Scrollable -->
    <div class="flex-1 overflow-y-auto p-4 pb-20">
      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center py-12">
        <div class="text-gray-600">Loading completed missions...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
        {{ error }}
      </div>

      <!-- Empty State -->
      <div v-else-if="completedMissions.length === 0" class="text-center py-12">
        <h2 class="text-xl font-semibold text-gray-700 mb-2">No Completed Missions</h2>
        <p class="text-gray-600 mb-6">Start exploring and complete missions to see them here!</p>
        <button
          class="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          @click="router.push('/map')"
        >
          Explore Missions
        </button>
      </div>

      <!-- Missions List -->
      <div v-else class="space-y-3">
        <div
          v-for="mission in completedMissions"
          :key="mission.id"
          class="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
        >
          <div class="flex items-start justify-between mb-2">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ mission.name }}</h3>
              <p class="text-sm text-gray-600 mb-2">{{ mission.description }}</p>
            </div>
            <span class="text-2xl text-green-600 ml-2">✓</span>
          </div>

          <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div class="flex items-center space-x-1">
              <span>{{ mission.latitude.toFixed(4) }}, {{ mission.longitude.toFixed(4) }}</span>
            </div>
            <div class="flex items-center space-x-1">
              <span>{{ formatDate(mission.completedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>
