<script setup lang="ts">
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const currentTab = ref(route.name || 'map');

const tabs = [
  { name: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  { name: 'map', label: 'Map', icon: '🗺️' },
  { name: 'profile', label: 'Profile', icon: '👤' },
];

const goToTab = (tabName: string) => {
  currentTab.value = tabName;
  router.push(`/${tabName}`);
};
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg z-50 safe-area-bottom">
    <div class="flex justify-around items-center h-16">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        :class="[
          'flex flex-col items-center justify-center flex-1 h-full transition-colors',
          currentTab === tab.name ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50',
        ]"
        @click="goToTab(tab.name)"
      >
        <span class="text-2xl mb-1">{{ tab.icon }}</span>
        <span class="text-xs font-medium">{{ tab.label }}</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}
</style>
