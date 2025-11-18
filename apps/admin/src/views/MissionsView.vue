<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMissionsStore } from '@/stores/missions';

const router = useRouter();
const missionsStore = useMissionsStore();
const statusFilter = ref<'all' | 'pending' | 'approved' | 'rejected'>('all');

const filteredMissions = computed(() => {
  if (statusFilter.value === 'all') {
    return missionsStore.missions;
  }
  return missionsStore.missions.filter((m) => m.status.toLowerCase() === statusFilter.value.toLowerCase());
});

const viewDetails = (id: number) => {
  router.push(`/missions/${id}`);
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString();
};

onMounted(() => {
  missionsStore.fetchMissions();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h1 class="text-xl font-semibold text-white">Missions</h1>
      <div class="flex gap-1">
        <button
          v-for="status in ['all', 'pending', 'approved', 'rejected']"
          :key="status"
          :class="[
            'px-2 py-1 text-xs font-medium border',
            statusFilter === status
              ? 'bg-gray-700 text-white border-gray-700'
              : 'bg-gray-800 text-gray-300 border-gray-700 hover:border-gray-600',
          ]"
          @click="statusFilter = status as any"
        >
          {{ status.charAt(0).toUpperCase() + status.slice(1) }}
        </button>
      </div>
    </div>

    <div v-if="missionsStore.error" class="p-3 bg-red-900 border border-red-700 text-red-200 text-sm">
      {{ missionsStore.error }}
    </div>

    <div v-if="missionsStore.isLoading" class="text-center py-8">
      <p class="text-gray-500 text-sm">Loading...</p>
    </div>

    <div v-else-if="filteredMissions.length === 0" class="text-center py-8">
      <p class="text-gray-500 text-sm">No missions</p>
    </div>

    <div v-else class="overflow-x-auto border border-gray-800">
      <table class="w-full text-sm">
        <thead class="bg-gray-800 border-b border-gray-700">
          <tr>
            <th class="px-4 py-2 text-left font-semibold text-gray-300">Name</th>
            <th class="px-4 py-2 text-left font-semibold text-gray-300">Description</th>
            <th class="px-4 py-2 text-left font-semibold text-gray-300">Location</th>
            <th class="px-4 py-2 text-left font-semibold text-gray-300">Status</th>
            <th class="px-4 py-2 text-left font-semibold text-gray-300">Created</th>
            <th class="px-4 py-2 text-center font-semibold text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-800">
          <tr v-for="mission in filteredMissions" :key="mission.id" class="hover:bg-gray-800">
            <td class="px-4 py-3 text-white font-medium">{{ mission.name }}</td>
            <td class="px-4 py-3 text-gray-400">
              {{ mission.description?.substring(0, 40) }}{{ (mission.description?.length ?? 0 > 40) ? '...' : '' }}
            </td>
            <td class="px-4 py-3 text-gray-400">
              lat: {{ mission.latitude || '—' }} long: {{ mission.longitude || '—' }}
            </td>
            <td class="px-4 py-3">
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
            </td>
            <td class="px-4 py-3 text-gray-400">{{ formatDate(mission.createdAt) }}</td>
            <td class="px-4 py-3 text-center">
              <button
                class="px-3 py-1 text-xs border border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600"
                title="View Details"
                @click="viewDetails(mission.id)"
              >
                Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped></style>
