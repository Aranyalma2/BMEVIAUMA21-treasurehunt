import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/client';

export interface User {
  id: number;
  username: string;
  name: string;
  role: string;
  score?: number;
  completedMissions?: any[];
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const error = ref<string | null>(null);
  const isLoading = ref(false);

  const initAuth = () => {
    const savedToken = localStorage.getItem('user_token');
    if (savedToken) {
      token.value = savedToken;
      apiClient.setToken(savedToken);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiClient.login(username, password);
      token.value = response.access_token;
      apiClient.setToken(response.access_token);
      localStorage.setItem('user_token', response.access_token);

      // Fetch user data
      await fetchCurrentUser();
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const register = async (username: string, name: string, password: string): Promise<boolean> => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiClient.register(username, name, password);
      token.value = response.access_token;
      apiClient.setToken(response.access_token);
      localStorage.setItem('user_token', response.access_token);

      // Fetch user data
      await fetchCurrentUser();
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Registration failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchCurrentUser = async () => {
    try {
      user.value = await apiClient.getCurrentUser();
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout();
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    apiClient.clearToken();
    localStorage.removeItem('user_token');
  };

  const isAuthenticated = (): boolean => {
    return !!token.value;
  };

  const deleteAccount = async (): Promise<boolean> => {
    try {
      await apiClient.deleteCurrentUser();
      logout();
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete account';
      return false;
    }
  };

  return {
    user,
    token,
    error,
    isLoading,
    initAuth,
    login,
    register,
    logout,
    isAuthenticated,
    fetchCurrentUser,
    deleteAccount,
  };
});
