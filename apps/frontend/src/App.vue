<script setup lang="ts">
import { onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
  
  // Disable context menu (right-click menu)
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
});
</script>

<template>
  <div id="app" @contextmenu.prevent>
    <RouterView />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

#app {
  height: 100%;
  width: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Mobile-first responsive design */
@media (max-width: 640px) {
  html {
    font-size: 16px;
  }
}

/* Prevent pull-to-refresh on mobile */
body {
  overscroll-behavior-y: contain;
}

/* Button reset */
button {
  font-family: inherit;
}

/* Input reset */
input, textarea {
  font-family: inherit;
}
</style>
