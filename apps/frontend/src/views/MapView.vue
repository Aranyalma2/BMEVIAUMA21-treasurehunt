<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@/assets/views/MapView.css';

// Make Leaflet available globally for leaflet-rotate
if (typeof window !== 'undefined') {
  (window as any).L = L;
}

import 'leaflet-rotate';
import { LMap, LTileLayer, LMarker, LIcon, LPopup } from '@vue-leaflet/vue-leaflet';
import apiClient from '@/api/client';
import BottomNav from '@/components/BottomNav.vue';
import type { LatLngExpression } from 'leaflet';

const zoom = ref(16);
const minZoom = 16; // Lock the minimum zoom level
const maxZoom = 20; // Allow zooming in

// Load cached location from localStorage
const loadCachedLocation = (): { lat: number; lng: number } | null => {
  try {
    const cached = localStorage.getItem('lastKnownLocation');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Check if cache is less than 1 hour old
      if (parsed.timestamp && Date.now() - parsed.timestamp < 3600000) {
        return { lat: parsed.lat, lng: parsed.lng };
      }
    }
  } catch (e) {
    console.error('Failed to load cached location', e);
  }
  return null;
};

// Save location to localStorage
const saveCachedLocation = (location: { lat: number; lng: number }) => {
  try {
    localStorage.setItem(
      'lastKnownLocation',
      JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        timestamp: Date.now(),
      }),
    );
  } catch (e) {
    console.error('Failed to cache location', e);
  }
};

const userLocation = ref<{ lat: number; lng: number } | null>(loadCachedLocation());
const missions = ref<any[]>([]);
const selectedMission = ref<any | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);
const watchId = ref<number | null>(null);
const showMissionPanel = ref(false);
const currentTask = ref<any | null>(null);
const userAnswer = ref<any>(null);
const taskResult = ref<string | null>(null);

// Computed property for map center
const center = computed<LatLngExpression>(() => {
  if (userLocation.value) {
    return [userLocation.value.lat, userLocation.value.lng];
  }
  return [47.4979, 19.0402]; // Budapest default
});

// User location icon (blue dot)
const userIcon = {
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" stroke-width="3"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
};

// Mission icon (red pin)
const missionIcon = {
  iconUrl:
    'data:image/svg+xml;base64,' +
    btoa(`
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 12 16 24 16 24s16-12 16-24C32 7.2 24.8 0 16 0z" fill="#EF4444"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>
  `),
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
};

const getUserLocation = () => {
  if ('geolocation' in navigator) {
    watchId.value = navigator.geolocation.watchPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        // Cache the location
        saveCachedLocation(userLocation.value);
        // Only fetch missions if not actively solving one
        if (!showMissionPanel.value) {
          fetchNearbyMissions();
        }
      },
      (err) => {
        error.value = 'Unable to get location. Please enable location services.';
        console.error(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  } else {
    error.value = 'Geolocation is not supported by your browser';
  }
};

const fetchNearbyMissions = async () => {
  if (!userLocation.value) return;

  isLoading.value = true;
  try {
    missions.value = await apiClient.getNearbyMissions(userLocation.value.lng, userLocation.value.lat);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load missions';
  } finally {
    isLoading.value = false;
  }
};

const selectMission = (mission: any) => {
  selectedMission.value = mission;
  showMissionPanel.value = true;
};

const isWithinRadius = (mission: any) => {
  if (!userLocation.value) return false;

  const distance = calculateDistance(
    userLocation.value.lat,
    userLocation.value.lng,
    mission.latitude,
    mission.longitude,
  );

  return distance <= 100; // 100 meters
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3; // Earth radius in meters
  const phi_1 = (lat1 * Math.PI) / 180;
  const phi_2 = (lat2 * Math.PI) / 180;
  const delta_phi = ((lat2 - lat1) * Math.PI) / 180;
  const delta_lambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(delta_phi / 2) * Math.sin(delta_phi / 2) +
    Math.cos(phi_1) * Math.cos(phi_2) * Math.sin(delta_lambda / 2) * Math.sin(delta_lambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const startMission = async () => {
  if (!selectedMission.value || !userLocation.value) return;

  isLoading.value = true;
  error.value = null;
  try {
    currentTask.value = await apiClient.startMission(selectedMission.value.id, {
      longitude: userLocation.value.lng,
      latitude: userLocation.value.lat,
    });

    // Initialize userAnswer based on task type
    if (currentTask.value.type === 'SIMPLE_QUESTION') {
      userAnswer.value = { answer: '' };
    } else {
      userAnswer.value = null;
    }

    taskResult.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to start mission';
  } finally {
    isLoading.value = false;
  }
};

const submitAnswer = async () => {
  if (!selectedMission.value || !userLocation.value || !currentTask.value) return;

  isLoading.value = true;
  error.value = null;
  try {
    const result = await apiClient.submitMission(
      selectedMission.value.id,
      {
        longitude: userLocation.value.lng,
        latitude: userLocation.value.lat,
      },
      {
        id: selectedMission.value.id,
        answer: userAnswer.value,
      },
    );
    taskResult.value = result.result;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to submit answer';
  } finally {
    isLoading.value = false;
  }
};

const closeMissionPanel = () => {
  showMissionPanel.value = false;
  selectedMission.value = null;
  currentTask.value = null;
  userAnswer.value = null;
  taskResult.value = null;
  error.value = null;
  fetchNearbyMissions();
};

onMounted(() => {
  getUserLocation();
});

onUnmounted(() => {
  if (watchId.value !== null) {
    navigator.geolocation.clearWatch(watchId.value);
  }
});
</script>

<template>
  <div class="map-container">
    <!-- Error Banner -->
    <div v-if="error && !showMissionPanel" class="error-banner">
      {{ error }}
    </div>

    <!-- Loading Location Indicator (overlays map, doesn't block it) -->
    <div v-if="!userLocation" class="location-loading-indicator">
      <div class="location-loading-content">
        <div class="small-spinner"></div>
        <span>Getting location...</span>
      </div>
    </div>

    <!-- Leaflet Map - Always visible -->
    <l-map
      ref="map"
      :zoom="zoom"
      :min-zoom="minZoom"
      :max-zoom="maxZoom"
      :center="center"
      :use-global-leaflet="false"
      :options="{
        zoomControl: true,
        dragging: false,
        touchZoom: 'center',
        doubleClickZoom: 'center',
        scrollWheelZoom: 'center',
        boxZoom: false,
        keyboard: false,
        tap: false,
        rotate: true,
        bearing: 0,
        touchRotate: true,
        shiftKeyRotate: true,
        rotateControl: {
          closeOnZeroBearing: false,
          position: 'topleft',
        },
      }"
      class="map"
    >
      <!-- OpenStreetMap Tiles - Simple Style -->
      <l-tile-layer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        :max-zoom="20"
      ></l-tile-layer>

      <!-- User Location Marker (only shows when location is available) -->
      <l-marker v-if="userLocation" :lat-lng="[userLocation.lat, userLocation.lng]">
        <l-icon :icon-url="userIcon.iconUrl" :icon-size="userIcon.iconSize" :icon-anchor="userIcon.iconAnchor" />
        <l-popup>
          <div class="popup-content">
            <strong>Your Location</strong>
          </div>
        </l-popup>
      </l-marker>

      <!-- Mission Markers -->
      <l-marker
        v-for="mission in missions"
        :key="mission.id"
        :lat-lng="[mission.latitude, mission.longitude]"
        @click="selectMission(mission)"
      >
        <l-icon
          :icon-url="missionIcon.iconUrl"
          :icon-size="missionIcon.iconSize"
          :icon-anchor="missionIcon.iconAnchor"
        />
        <l-popup>
          <div class="popup-content">
            <strong>{{ mission.name }}</strong>
            <p class="popup-description">{{ mission.description }}</p>
          </div>
        </l-popup>
      </l-marker>
    </l-map>

    <!-- Mission Detail Panel -->
    <div v-if="showMissionPanel && selectedMission" class="mission-panel">
      <div class="panel-content">
        <div class="panel-header">
          <h2 class="panel-title">{{ selectedMission.name }}</h2>
          <button class="close-button" @click="closeMissionPanel">×</button>
        </div>

        <p class="mission-description">{{ selectedMission.description }}</p>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <!-- Not Started -->
        <div v-if="!currentTask && !taskResult">
          <button
            v-if="isWithinRadius(selectedMission)"
            :disabled="isLoading"
            class="start-button"
            @click="startMission"
          >
            {{ isLoading ? 'Starting...' : 'Start Mission' }}
          </button>
          <div v-else class="distance-warning">Get within 100m to start this mission</div>
        </div>

        <!-- Task Display -->
        <div v-else-if="currentTask && !taskResult" class="task-container">
          <div class="question-box">
            <div class="question-label">Question:</div>
            <div class="question-text">{{ currentTask.derivativeTask.question }}</div>
          </div>

          <!-- True/False Task -->
          <div v-if="currentTask.type === 'TRUE_OR_FALSE'" class="answer-options">
            <button
              :class="['option-button', 'true-button', { selected: userAnswer?.answer === true }]"
              @click="userAnswer = { answer: true }"
            >
              True
            </button>
            <button
              :class="['option-button', 'false-button', { selected: userAnswer?.answer === false }]"
              @click="userAnswer = { answer: false }"
            >
              False
            </button>
          </div>

          <!-- Multiple Choice Task -->
          <div v-else-if="currentTask.type === 'MULTI_CHOICE'" class="answer-options">
            <button
              v-for="(option, index) in currentTask.derivativeTask.answers"
              :key="index"
              :class="['option-button', 'choice-button', { selected: userAnswer?.selectedIndex === index }]"
              @click="userAnswer = { selectedIndex: index }"
            >
              {{ option.text }}
            </button>
          </div>

          <!-- Simple Question Task -->
          <div v-else-if="currentTask.type === 'SIMPLE_QUESTION'" class="answer-input-container">
            <input
              v-model="userAnswer.answer"
              type="text"
              placeholder="Type your answer here..."
              class="answer-input"
              @keyup.enter="submitAnswer"
            />
          </div>

          <button :disabled="!userAnswer || isLoading" class="submit-button" @click="submitAnswer">
            {{ isLoading ? 'Submitting...' : 'Submit Answer' }}
          </button>
        </div>

        <!-- Result Display -->
        <div v-else-if="taskResult" class="result-container">
          <div v-if="taskResult === 'Success'" class="success-result">
            <div class="result-title">Correct!</div>
            <div class="result-message">You've completed this mission</div>
          </div>
          <div v-else class="failure-result">
            <div class="result-title">Incorrect</div>
            <div class="result-message">Better luck next time!</div>
          </div>
          <button class="close-result-button" @click="closeMissionPanel">Close</button>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>
