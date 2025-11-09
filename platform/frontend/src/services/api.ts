import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            const { accessToken } = response.data.tokens;
            localStorage.setItem('accessToken', accessToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(name: string, email: string, password: string) {
    const response = await this.client.post('/auth/register', { name, email, password });
    return response.data;
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    await this.client.post('/auth/logout', { refreshToken });
  }

  async getCurrentUser() {
    const response = await this.client.get('/auth/me');
    return response.data.user;
  }

  // Meeting endpoints
  async createMeeting(data: any) {
    const response = await this.client.post('/meetings', data);
    return response.data.meeting;
  }

  async getMeetings(params?: any) {
    const response = await this.client.get('/meetings', { params });
    return response.data;
  }

  async getMeeting(id: string) {
    const response = await this.client.get(`/meetings/${id}`);
    return response.data.meeting;
  }

  async updateMeeting(id: string, data: any) {
    const response = await this.client.patch(`/meetings/${id}`, data);
    return response.data.meeting;
  }

  async endMeeting(id: string) {
    const response = await this.client.post(`/meetings/${id}/end`);
    return response.data.meeting;
  }

  async deleteMeeting(id: string) {
    await this.client.delete(`/meetings/${id}`);
  }

  async getMeetingStats(period: 'week' | 'month' | 'year' = 'month') {
    const response = await this.client.get('/meetings/stats', { params: { period } });
    return response.data.stats;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
