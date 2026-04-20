import { api } from '../lib/api-client';
import { AuthResponse, User, UserRole } from '../types/api';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login/', { email, password });
    if (response.access) {
      localStorage.setItem('the-guild-token', response.access);
      localStorage.setItem('the-guild-refresh', response.refresh);
      localStorage.setItem('the-guild-user', JSON.stringify(response.user));
    }
    return response;
  },

  register: async (data: any): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register/', data);
    if (response.access) {
      localStorage.setItem('the-guild-token', response.access);
      localStorage.setItem('the-guild-refresh', response.refresh);
      localStorage.setItem('the-guild-user', JSON.stringify(response.user));
    }
    return response;
  },

  logout: () => {
    localStorage.removeItem('the-guild-token');
    localStorage.removeItem('the-guild-refresh');
    localStorage.removeItem('the-guild-user');
  },

  getProfile: async (): Promise<User> => {
    return api.get<User>('/auth/profile/');
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return api.patch<User>('/auth/profile/', data);
  }
};
