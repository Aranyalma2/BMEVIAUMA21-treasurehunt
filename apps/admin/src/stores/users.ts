import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/client';

export interface User {
  id: number;
  username: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  completedMissions: any[];
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const roles = ref<string[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const fetchUsers = async () => {
    isLoading.value = true;
    error.value = null;

    try {
      users.value = await apiClient.getAllUsers();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users';
    } finally {
      isLoading.value = false;
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await apiClient.getRoles();
      // API returns {roles: ["USER", "ADMIN"]}, extract the array
      roles.value = response.roles || response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch roles';
    }
  };

  const getUser = async (id: number) => {
    try {
      return await apiClient.getUser(id);
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch user';
      return null;
    }
  };

  const updateUserRole = async (id: number, role: string) => {
    try {
      const updated = await apiClient.updateUser(id, role);
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = updated;
      }
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user';
      return false;
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await apiClient.deleteUser(id);
      users.value = users.value.filter((u) => u.id !== id);
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user';
      return false;
    }
  };

  return {
    users,
    roles,
    isLoading,
    error,
    fetchUsers,
    fetchRoles,
    getUser,
    updateUserRole,
    deleteUser,
  };
});
