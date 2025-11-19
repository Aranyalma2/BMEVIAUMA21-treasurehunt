<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/client';
import '@/assets/views/CreateMissionView.css';

const router = useRouter();
const isLoading = ref(false);
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const userLocation = ref<{ lat: number; lng: number } | null>(null);

// Form fields
const missionName = ref('');
const missionDescription = ref('');
const taskType = ref<'TRUE_OR_FALSE' | 'MULTI_CHOICE' | 'SIMPLE_QUESTION'>('TRUE_OR_FALSE');
const taskQuestion = ref('');

// TRUE_OR_FALSE
const trueOrFalseAnswer = ref<boolean | null>(null);

// MULTI_CHOICE - Maximum 4 choices
const multiChoiceAnswers = ref<Array<{ text: string; isTrue: boolean }>>([
  { text: '', isTrue: false },
  { text: '', isTrue: false },
]);

// SIMPLE_QUESTION
const simpleQuestionAnswers = ref<string[]>(['']);

const taskTypes = [
  { value: 'TRUE_OR_FALSE', label: 'True or False' },
  { value: 'MULTI_CHOICE', label: 'Multiple Choice' },
  { value: 'SIMPLE_QUESTION', label: 'Simple Question' },
];

const canAddMoreChoices = computed(() => {
  return multiChoiceAnswers.value.length < 4;
});

const addMultiChoiceAnswer = () => {
  if (multiChoiceAnswers.value.length < 4) {
    multiChoiceAnswers.value.push({ text: '', isTrue: false });
  }
};

const removeMultiChoiceAnswer = (index: number) => {
  if (multiChoiceAnswers.value.length > 2) {
    multiChoiceAnswers.value.splice(index, 1);
  }
};

const addSimpleAnswer = () => {
  simpleQuestionAnswers.value.push('');
};

const removeSimpleAnswer = (index: number) => {
  if (simpleQuestionAnswers.value.length > 1) {
    simpleQuestionAnswers.value.splice(index, 1);
  }
};

const setCorrectAnswer = (index: number) => {
  multiChoiceAnswers.value.forEach((answer, i) => {
    answer.isTrue = i === index;
  });
};

const getUserLocation = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation.value = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
      },
      (err) => {
        error.value = 'Unable to get location. Please enable location services.';
        console.error(err);
      },
    );
  } else {
    error.value = 'Geolocation is not supported by your browser';
  }
};

const validateForm = (): boolean => {
  if (!missionName.value.trim()) {
    error.value = 'Mission name is required';
    return false;
  }
  if (!missionDescription.value.trim()) {
    error.value = 'Mission description is required';
    return false;
  }
  if (!taskQuestion.value.trim()) {
    error.value = 'Task question is required';
    return false;
  }
  if (!userLocation.value) {
    error.value = 'Location not available. Please wait for GPS.';
    return false;
  }

  if (taskType.value === 'TRUE_OR_FALSE' && trueOrFalseAnswer.value === null) {
    error.value = 'Please select the correct answer (True or False)';
    return false;
  }

  if (taskType.value === 'MULTI_CHOICE') {
    const filledAnswers = multiChoiceAnswers.value.filter((a) => a.text.trim());
    if (filledAnswers.length < 2) {
      error.value = 'Please provide at least 2 choices';
      return false;
    }
    if (!multiChoiceAnswers.value.some((a) => a.isTrue && a.text.trim())) {
      error.value = 'Please select the correct answer';
      return false;
    }
  }

  if (taskType.value === 'SIMPLE_QUESTION') {
    const filledAnswers = simpleQuestionAnswers.value.filter((a) => a.trim());
    if (filledAnswers.length === 0) {
      error.value = 'Please provide at least one accepted answer';
      return false;
    }
  }

  return true;
};

const buildTaskData = () => {
  if (taskType.value === 'TRUE_OR_FALSE') {
    return {
      type: 'TRUE_OR_FALSE',
      derivativeTask: {
        question: taskQuestion.value,
        answer: trueOrFalseAnswer.value,
      },
    };
  }

  if (taskType.value === 'MULTI_CHOICE') {
    const answers = multiChoiceAnswers.value
      .filter((a) => a.text.trim())
      .map((a) => ({
        text: a.text,
        isTrue: a.isTrue,
      }));

    return {
      type: 'MULTI_CHOICE',
      derivativeTask: {
        question: taskQuestion.value,
        answers,
      },
    };
  }

  if (taskType.value === 'SIMPLE_QUESTION') {
    const answers = simpleQuestionAnswers.value.filter((a) => a.trim());
    return {
      type: 'SIMPLE_QUESTION',
      derivativeTask: {
        question: taskQuestion.value,
        answers,
      },
    };
  }
};

const handleSubmit = async () => {
  error.value = null;
  successMessage.value = null;

  if (!validateForm()) {
    return;
  }

  isLoading.value = true;

  try {
    const missionData = {
      name: missionName.value,
      description: missionDescription.value,
      location: {
        longitude: userLocation.value!.lng,
        latitude: userLocation.value!.lat,
      },
      task: buildTaskData(),
    };

    await apiClient.createMission(missionData);
    successMessage.value = 'Mission created successfully!';

    // Redirect back to map after 2 seconds
    setTimeout(() => {
      router.push('/map');
    }, 2000);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create mission';
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  router.push('/map');
};

// Get location on mount
getUserLocation();
</script>

<template>
  <div class="create-mission-container">
    <div class="header">
      <button class="back-button" @click="goBack">Back</button>
      <h1 class="title">Create a mission</h1>
    </div>

    <div class="form-container">
      <!-- Success Message -->
      <div v-if="successMessage" class="success-message">
        {{ successMessage }}
      </div>

      <!-- Error Message -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>

      <!-- Location Status -->
      <div v-if="!userLocation" class="location-status">Getting your location...</div>
      <div v-else class="location-status success">Location acquired</div>

      <form class="form" @submit.prevent="handleSubmit">
        <!-- Mission Name -->
        <div class="form-group">
          <label for="name" class="label">Mission Name *</label>
          <input id="name" v-model="missionName" type="text" class="input" placeholder="Enter mission name" required />
        </div>

        <!-- Mission Description -->
        <div class="form-group">
          <label for="description" class="label">Description *</label>
          <textarea
            id="description"
            v-model="missionDescription"
            class="textarea"
            placeholder="Enter mission description"
            rows="3"
            required
          ></textarea>
        </div>

        <!-- Task Type -->
        <div class="form-group">
          <label for="taskType" class="label">Task Type *</label>
          <select id="taskType" v-model="taskType" class="select">
            <option v-for="type in taskTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
        </div>

        <!-- Task Question -->
        <div class="form-group">
          <label for="question" class="label">Question *</label>
          <textarea
            id="question"
            v-model="taskQuestion"
            class="textarea"
            placeholder="Enter your question"
            rows="2"
            required
          ></textarea>
        </div>

        <!-- TRUE_OR_FALSE Task -->
        <div v-if="taskType === 'TRUE_OR_FALSE'" class="form-group">
          <label class="label">Correct Answer *</label>
          <div class="radio-group">
            <label class="radio-label">
              <input v-model="trueOrFalseAnswer" type="radio" :value="true" class="radio" />
              <span>True</span>
            </label>
            <label class="radio-label">
              <input v-model="trueOrFalseAnswer" type="radio" :value="false" class="radio" />
              <span>False</span>
            </label>
          </div>
        </div>

        <!-- MULTI_CHOICE Task -->
        <div v-if="taskType === 'MULTI_CHOICE'" class="form-group">
          <label class="label">Answer Choices * (Max 4)</label>
          <div class="choices-container">
            <div v-for="(answer, index) in multiChoiceAnswers" :key="index" class="choice-item">
              <input
                v-model="answer.text"
                type="text"
                class="input choice-input"
                :placeholder="`Choice ${index + 1}`"
              />
              <button
                type="button"
                :class="['correct-button', { active: answer.isTrue }]"
                @click="setCorrectAnswer(index)"
              >
                {{ answer.isTrue ? 'Correct' : 'Mark Correct' }}
              </button>
              <button
                v-if="multiChoiceAnswers.length > 2"
                type="button"
                class="remove-button"
                @click="removeMultiChoiceAnswer(index)"
              >
                ×
              </button>
            </div>
          </div>
          <button v-if="canAddMoreChoices" type="button" class="add-button" @click="addMultiChoiceAnswer">
            + Add Choice ({{ multiChoiceAnswers.length }}/4)
          </button>
          <div v-else class="max-choices-note">Maximum 4 choices reached</div>
        </div>

        <!-- SIMPLE_QUESTION Task -->
        <div v-if="taskType === 'SIMPLE_QUESTION'" class="form-group">
          <label class="label">Accepted Answers *</label>
          <div class="answers-container">
            <div v-for="(answer, index) in simpleQuestionAnswers" :key="index" class="answer-item">
              <input
                v-model="simpleQuestionAnswers[index]"
                type="text"
                class="input"
                :placeholder="`Answer ${index + 1}`"
              />
              <button
                v-if="simpleQuestionAnswers.length > 1"
                type="button"
                class="remove-button"
                @click="removeSimpleAnswer(index)"
              >
                ×
              </button>
            </div>
          </div>
          <button type="button" class="add-button" @click="addSimpleAnswer">+ Add Another Answer</button>
        </div>

        <!-- Submit Button -->
        <button type="submit" :disabled="isLoading || !userLocation" class="submit-button">
          {{ isLoading ? 'Creating...' : 'Create Mission' }}
        </button>
      </form>
    </div>
  </div>
</template>
