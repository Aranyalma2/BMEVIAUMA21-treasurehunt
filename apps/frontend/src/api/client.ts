const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002/api';

class ApiClient {
  private token: string | null = null;
  private handle403Callback: (() => void) | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  getToken(): string | null {
    return this.token;
  }

  onForbidden(callback: () => void) {
    this.handle403Callback = callback;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (typeof options.headers === 'object' && options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `API error: ${response.status}` }));

      if (response.status === 403 && this.handle403Callback) {
        this.clearToken();
        localStorage.removeItem('user_token');
        this.handle403Callback();
      }

      throw new Error(error.message || `API error: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  register(username: string, name: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, name, password }),
    });
  }

  // Mission endpoints
  getNearbyMissions(longitude: number, latitude: number) {
    return this.request(`/mission?longitude=${longitude}&latitude=${latitude}`);
  }

  getMission(id: number) {
    return this.request(`/mission/${id}`);
  }

  createMission(data: any) {
    return this.request('/mission', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  startMission(id: number, location: { longitude: number; latitude: number }) {
    return this.request(`/mission/${id}/start`, {
      method: 'POST',
      body: JSON.stringify({ location }),
    });
  }

  submitMission(id: number, location: { longitude: number; latitude: number }, task: any) {
    return this.request(`/mission/${id}/submissions`, {
      method: 'POST',
      body: JSON.stringify({ location, task }),
    });
  }

  // Leaderboard endpoints
  getLeaderboard() {
    return this.request('/leaderboard');
  }

  getLeaderboardByTasks() {
    return this.request('/leaderboard/bytasks');
  }

  // Profile endpoints
  getCurrentUser() {
    return this.request('/user/me');
  }

  deleteCurrentUser() {
    return this.request('/user/me', { method: 'DELETE' });
  }
}

export default new ApiClient();
