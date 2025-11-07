const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api';

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

  // Set callback for handling 403 errors
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
      const error = await response.json();
      
      // Handle 403 Forbidden - logout and redirect to login
      if (response.status === 403 && this.handle403Callback) {
        this.clearToken();
        localStorage.removeItem('admin_token');
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

  // Admin Mission endpoints
  getAllMissions(status?: string) {
    const query = status ? `?status=${status}` : '';
    return this.request(`/missions/all${query}`);
  }

  deleteMission(id: number) {
    return this.request(`/missions/${id}`, { method: 'DELETE' });
  }

  approveMission(id: number) {
    return this.request(`/missions/${id}/approve`, { method: 'POST' });
  }

  rejectMission(id: number) {
    return this.request(`/missions/${id}/reject`, { method: 'POST' });
  }

  // Admin User endpoints
  getRoles() {
    return this.request('/roles');
  }

  getAllUsers() {
    return this.request('/user/all');
  }

  getUser(id: number) {
    return this.request(`/user/${id}`);
  }

  updateUser(id: number, role: string) {
    return this.request(`/user/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  deleteUser(id: number) {
    return this.request(`/user/${id}`, { method: 'DELETE' });
  }

  // Profile endpoints
  getCurrentUser() {
    return this.request('/user/me');
  }
}

export default new ApiClient();
