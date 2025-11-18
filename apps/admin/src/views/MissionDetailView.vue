<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMissionsStore } from '@/stores/missions';
import apiClient from '@/api/client';

const route = useRoute();
const router = useRouter();
const missionsStore = useMissionsStore();

const missionId = computed(() => Number(route.params.id));
const mission = computed(() => missionsStore.getMissionById(missionId.value));

const isSubmitting = ref(false);
const createdByUser = ref<{ id: number; name: string; username: string } | null>(null);
const approvedByUser = ref<{ id: number; name: string; username: string } | null>(null);
const loadingUsers = ref(false);

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleString();
};

const fetchUserData = async () => {
  if (!mission.value) return;

  loadingUsers.value = true;
  try {
    // Fetch created by user
    if (mission.value.createdById) {
      try {
        createdByUser.value = await apiClient.getUser(mission.value.createdById);
      } catch (err) {
        console.error('Failed to fetch creator user:', err);
      }
    }

    // Fetch approved by user
    if (mission.value.approvedById) {
      try {
        approvedByUser.value = await apiClient.getUser(mission.value.approvedById);
      } catch (err) {
        console.error('Failed to fetch approver user:', err);
      }
    }
  } finally {
    loadingUsers.value = false;
  }
};

const handleApprove = async () => {
  if (!mission.value) return;
  isSubmitting.value = true;
  const success = await missionsStore.approveMission(mission.value.id);
  isSubmitting.value = false;
  if (success) {
    // Mission is updated in store, it will reflect in computed property
  }
};

const handleReject = async () => {
  if (!mission.value) return;
  isSubmitting.value = true;
  const success = await missionsStore.rejectMission(mission.value.id);
  isSubmitting.value = false;
  if (success) {
    // Mission is updated in store, it will reflect in computed property
  }
};

const handleDelete = async () => {
  if (!mission.value) return;
  if (confirm('Are you sure you want to delete this mission?')) {
    const success = await missionsStore.deleteMission(mission.value.id);
    if (success) {
      router.push('/missions');
    }
  }
};

const goBack = () => {
  router.push('/missions');
};

onMounted(() => {
  // Fetch missions if not already loaded
  if (missionsStore.missions.length === 0) {
    missionsStore.fetchMissions();
  }

  // Fetch user data for the mission
  fetchUserData();
});

// Watch for mission changes (e.g., after approve/reject) and refetch user data
watch(
  () => mission.value?.approvedById,
  (newVal, oldVal) => {
    if (newVal !== oldVal && newVal) {
      fetchUserData();
    }
  },
);
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-3">
      <button class="px-3 py-1 text-sm border border-gray-700 text-gray-300 hover:bg-gray-800" @click="goBack">
        ← Back
      </button>
      <h1 class="text-xl font-semibold text-white">Mission Details</h1>
    </div>

    <div v-if="missionsStore.error" class="p-3 bg-red-900 border border-red-700 text-red-200 text-sm">
      {{ missionsStore.error }}
    </div>

    <div v-if="missionsStore.isLoading" class="text-center py-8">
      <p class="text-gray-500 text-sm">Loading...</p>
    </div>

    <div v-else-if="!mission" class="text-center py-8">
      <p class="text-gray-500 text-sm">Mission not found</p>
    </div>

    <div v-else class="space-y-4">
      <!-- Mission Info Card -->
      <div class="border border-gray-800 bg-gray-900 p-4 space-y-3">
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-lg font-semibold text-white">{{ mission.name }}</h2>
            <p class="text-gray-400 mt-1">{{ mission.description }}</p>
          </div>
          <span
            :class="[
              'px-2 py-1 text-xs font-medium border',
              mission.status.toLowerCase() === 'pending'
                ? 'bg-yellow-900 border-yellow-700 text-yellow-200'
                : mission.status.toLowerCase() === 'approved'
                  ? 'bg-green-900 border-green-700 text-green-200'
                  : 'bg-red-900 border-red-700 text-red-200',
            ]"
          >
            {{ mission.status.charAt(0).toUpperCase() + mission.status.slice(1).toLowerCase() }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Mission ID:</span>
            <span class="text-white ml-2">{{ mission.id }}</span>
          </div>
          <div>
            <span class="text-gray-500">Created By:</span>
            <span v-if="loadingUsers" class="text-gray-400 ml-2">Loading...</span>
            <span v-else-if="createdByUser" class="text-white ml-2">
              {{ createdByUser.name }} ({{ createdByUser.username }})
            </span>
            <span v-else class="text-white ml-2">User #{{ mission.createdById }}</span>
          </div>
          <div>
            <span class="text-gray-500">Created At:</span>
            <span class="text-white ml-2">{{ formatDate(mission.createdAt) }}</span>
          </div>
          <div>
            <span class="text-gray-500">Updated At:</span>
            <span class="text-white ml-2">{{ formatDate(mission.updatedAt) }}</span>
          </div>
          <div v-if="mission.approvedAt">
            <span class="text-gray-500">Approved At:</span>
            <span class="text-white ml-2">{{ formatDate(mission.approvedAt) }}</span>
          </div>
          <div v-if="mission.approvedById">
            <span class="text-gray-500">Approved By:</span>
            <span v-if="loadingUsers" class="text-gray-400 ml-2">Loading...</span>
            <span v-else-if="approvedByUser" class="text-white ml-2">
              {{ approvedByUser.name }} ({{ approvedByUser.username }})
            </span>
            <span v-else class="text-white ml-2">User #{{ mission.approvedById }}</span>
          </div>
        </div>
      </div>

      <!-- Location Card -->
      <div class="border border-gray-800 bg-gray-900 p-4 space-y-2">
        <h3 class="text-md font-semibold text-white">Location</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="text-gray-500">Latitude:</span>
            <span class="text-white ml-2">{{ mission.latitude }}</span>
          </div>
          <div>
            <span class="text-gray-500">Longitude:</span>
            <span class="text-white ml-2">{{ mission.longitude }}</span>
          </div>
        </div>
      </div>

      <!-- Task Card -->
      <div v-if="mission.task" class="border border-gray-800 bg-gray-900 p-4 space-y-3">
        <h3 class="text-md font-semibold text-white">Task</h3>

        <div class="space-y-2 text-sm">
          <div>
            <span class="text-gray-500">Task Type:</span>
            <span class="text-white ml-2 font-mono">{{ mission.task.type }}</span>
          </div>

          <div v-if="mission.task.derivativeTask.question">
            <span class="text-gray-500">Question:</span>
            <p class="text-white mt-1">{{ mission.task.derivativeTask.question }}</p>
          </div>

          <!-- For TRUE_OR_FALSE tasks -->
          <div v-if="mission.task.type === 'TRUE_OR_FALSE' && mission.task.derivativeTask.answer !== undefined">
            <span class="text-gray-500">Correct Answer:</span>
            <span class="text-white ml-2">{{ mission.task.derivativeTask.answer ? 'True' : 'False' }}</span>
          </div>

          <!-- For SIMPLE_QUESTION tasks -->
          <div v-if="mission.task.type === 'SIMPLE_QUESTION' && mission.task.derivativeTask.answers">
            <span class="text-gray-500">Correct Answer(s):</span>
            <ul class="text-white mt-1 list-disc list-inside">
              <li v-for="(answer, idx) in mission.task.derivativeTask.answers" :key="idx">
                {{ answer }}
              </li>
            </ul>
          </div>

          <!-- For MULTI_CHOICE tasks -->
          <div v-if="mission.task.type === 'MULTI_CHOICE'">
            <div v-if="mission.task.derivativeTask.answers">
              <span class="text-gray-500">Answer Options:</span>
              <ul class="text-white mt-1 space-y-1">
                <li
                  v-for="(answer, idx) in mission.task.derivativeTask.answers"
                  :key="idx"
                  class="flex items-center gap-2"
                >
                  <span :class="answer.isTrue ? 'text-green-400 font-semibold' : 'text-gray-400'">
                    {{ answer.isTrue ? '✓' : '○' }}
                  </span>
                  <span :class="answer.isTrue ? 'text-green-300 font-semibold' : ''">
                    {{ answer.text }}
                  </span>
                  <span v-if="answer.isTrue" class="text-xs text-green-500">(Correct Answer)</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Raw task data for debugging/other task types -->
          <details class="mt-2">
            <summary class="text-gray-500 cursor-pointer hover:text-gray-400">Show Raw Task Data</summary>
            <pre class="text-xs text-gray-300 mt-2 p-2 bg-gray-800 overflow-x-auto">{{
              JSON.stringify(mission.task, null, 2)
            }}</pre>
          </details>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-2">
        <button
          v-if="mission.status.toLowerCase() === 'pending'"
          class="px-4 py-2 text-sm border border-gray-700 text-white bg-green-900 hover:bg-green-800 disabled:opacity-50"
          :disabled="isSubmitting"
          @click="handleApprove"
        >
          {{ isSubmitting ? 'Processing...' : 'Approve Mission' }}
        </button>
        <button
          v-if="mission.status.toLowerCase() === 'pending'"
          class="px-4 py-2 text-sm border border-gray-700 text-white bg-yellow-900 hover:bg-yellow-800 disabled:opacity-50"
          :disabled="isSubmitting"
          @click="handleReject"
        >
          {{ isSubmitting ? 'Processing...' : 'Reject Mission' }}
        </button>
        <button
          class="px-4 py-2 text-sm border border-gray-700 text-white bg-red-900 hover:bg-red-800"
          @click="handleDelete"
        >
          Delete Mission
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
