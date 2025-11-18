import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/client';

interface Location {
  id?: number;
  name?: string;
  longitude: number;
  latitude: number;
}

interface User {
  id: number;
  username: string;
  name: string;
}

interface DerivativeTask {
  question: string;
  answer?: any;
  answers?: string[] | Array<{ text: string; isTrue: boolean }>;
  options?: string[];
}

interface Task {
  type: string;
  derivativeTask: DerivativeTask;
}

export interface Mission {
  id: number;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  task?: Task;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  createdById: number;
  approvedAt?: string | Date;
  approvedById?: number;
}

export const useMissionsStore = defineStore('missions', () => {
  const missions = ref<Mission[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const filter = ref<'pending' | 'approved' | 'rejected' | 'all'>('all');

  const fetchMissions = async (status?: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      missions.value = await apiClient.getAllMissions(status);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch missions';
    } finally {
      isLoading.value = false;
    }
  };

  const approveMission = async (id: number) => {
    try {
      const updated = await apiClient.approveMission(id);
      const index = missions.value.findIndex((m) => m.id === id);
      if (index !== -1) {
        missions.value[index] = updated;
      }
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to approve mission';
      return false;
    }
  };

  const rejectMission = async (id: number) => {
    try {
      const updated = await apiClient.rejectMission(id);
      const index = missions.value.findIndex((m) => m.id === id);
      if (index !== -1) {
        missions.value[index] = updated;
      }
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to reject mission';
      return false;
    }
  };

  const deleteMission = async (id: number) => {
    try {
      await apiClient.deleteMission(id);
      missions.value = missions.value.filter((m) => m.id !== id);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete mission';
      return false;
    }
  };

  const getMissionById = (id: number): Mission | undefined => {
    return missions.value.find((m) => m.id === id);
  };

  return {
    missions,
    isLoading,
    error,
    filter,
    fetchMissions,
    approveMission,
    rejectMission,
    deleteMission,
    getMissionById,
  };
});
