import { defineStore } from 'pinia';
import { ref } from 'vue';
import apiClient from '@/api/client';

interface User {
  id: number;
  username: string;
  name: string;
  role: string;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(localStorage.getItem('admin_token'));
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  if (token.value) {
    apiClient.setToken(token.value);
  }

  const login = async (username: string, password: string) => {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await apiClient.login(username, password);
      // support responses that return { access_token: "..." }
      const access = (response.access_token ?? response.token) as string;
      token.value = access;
      // some backends return user info, some don't — keep user null if not provided
      user.value = response.user ?? null;

      localStorage.setItem('admin_token', access);
      apiClient.setToken(access);

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    token.value = null;
    localStorage.removeItem('admin_token');
    apiClient.clearToken();
  };

  const isAuthenticated = () => {
    // consider a user authenticated when we have a valid token;
    // user info may be fetched separately by the app.
    return !!token.value;
  };

  return {
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated,
  };
});
