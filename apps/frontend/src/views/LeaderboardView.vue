<script setup lang="ts">
import { ref, onMounted } from 'vue';
import apiClient from '@/api/client';
import BottomNav from '@/components/BottomNav.vue';
import '@/assets/views/LeaderboardView.css';

const activeTab = ref<'total' | 'bytasks'>('total');
const totalLeaderboard = ref<Array<{ name: string; points: number }>>([]);
const taskLeaderboards = ref<Array<{ type: string; userPoints: Array<{ name: string; points: number }> }>>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);

const fetchLeaderboard = async () => {
  isLoading.value = true;
  error.value = null;

  try {
    if (activeTab.value === 'total') {
      totalLeaderboard.value = await apiClient.getLeaderboard();
    } else {
      taskLeaderboards.value = await apiClient.getLeaderboardByTasks();
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load leaderboard';
  } finally {
    isLoading.value = false;
  }
};

const switchTab = (tab: 'total' | 'bytasks') => {
  activeTab.value = tab;
  fetchLeaderboard();
};

const getTaskTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    TRUE_OR_FALSE: 'True/False',
    MULTI_CHOICE: 'Multiple Choice',
    SIMPLE_QUESTION: 'Simple Question',
  };
  return labels[type] || type;
};

onMounted(() => {
  fetchLeaderboard();
});
</script>

<template>
  <div class="leaderboard-container">
    <div class="bg-yellow-600 text-white p-6 pb-8">
      <h1 class="text-2xl font-bold">Leaderboard</h1>
    </div>

    <!-- Tab Selector -->
    <div class="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-10">
      <div class="flex space-x-2">
        <button
          :class="[
            'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
            activeTab === 'total' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
          @click="switchTab('total')"
        >
          Total Points
        </button>
        <button
          :class="[
            'flex-1 py-2 px-4 rounded-lg font-medium transition-colors',
            activeTab === 'bytasks' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
          ]"
          @click="switchTab('bytasks')"
        >
          By Task Type
        </button>
      </div>
    </div>

    <div class="leaderboard-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="text-center py-12">
        <div class="text-gray-500">Loading leaderboard...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <!-- Total Leaderboard -->
      <div v-else-if="activeTab === 'total'" class="space-y-2">
        <div
          v-for="(entry, index) in totalLeaderboard"
          :key="index"
          :class="[
            'bg-white rounded-lg shadow p-4 flex items-center justify-between',
            index < 3 ? 'ring-2 ring-yellow-400' : '',
          ]"
        >
          <div class="flex items-center space-x-4">
            <div class="text-xl font-bold w-12 text-center text-gray-600">{{ index + 1 }}.</div>
            <div>
              <div class="font-semibold text-gray-800">{{ entry.name }}</div>
            </div>
          </div>
          <div class="text-xl font-bold text-yellow-600">{{ entry.points }} pts</div>
        </div>

        <div v-if="totalLeaderboard.length === 0" class="text-center py-12 text-gray-500">
          No entries yet. Be the first!
        </div>
      </div>

      <!-- By Task Type Leaderboard -->
      <div v-else class="space-y-6">
        <div
          v-for="taskGroup in taskLeaderboards"
          :key="taskGroup.type"
          class="bg-white rounded-lg shadow overflow-hidden"
        >
          <div class="bg-blue-600 text-white px-4 py-3 font-semibold">
            {{ getTaskTypeLabel(taskGroup.type) }}
          </div>
          <div class="divide-y divide-gray-200">
            <div
              v-for="(entry, index) in taskGroup.userPoints"
              :key="index"
              class="px-4 py-3 flex items-center justify-between"
            >
              <div class="flex items-center space-x-3">
                <div class="text-lg font-bold w-8 text-center text-gray-600">{{ index + 1 }}.</div>
                <div class="font-medium text-gray-800">{{ entry.name }}</div>
              </div>
              <div class="font-bold text-blue-600">{{ entry.points }} pts</div>
            </div>

            <div v-if="taskGroup.userPoints.length === 0" class="px-4 py-6 text-center text-gray-500">
              No entries for this task type yet
            </div>
          </div>
        </div>

        <div v-if="taskLeaderboards.length === 0" class="text-center py-12 text-gray-500">
          No leaderboard data available
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>
