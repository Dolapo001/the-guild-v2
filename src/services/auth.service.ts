import { api } from '../lib/api-client';
import { AuthResponse, User, UserRole } from '../types/api';

export const authService = {
  // Auth tokens are delivered as httpOnly cookies by the backend; the body
  // only carries the user. Nothing is persisted in JS-readable storage.
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login/', { email, password });
  },

  register: async (data: any): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/register/', data);
  },

  logout: async (): Promise<void> => {
    // Clears the httpOnly cookies + blacklists the refresh token server-side.
    try {
      await api.post('/auth/logout/', {});
    } catch {
      /* best-effort: still clear client state */
    }
  },

  getProfile: async (): Promise<User> => {
    return api.get<User>('/auth/profile/');
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return api.patch<User>('/auth/profile/', data);
  },

  validateInvitation: async (email: string, code: string): Promise<any> => {
    return api.get<any>(`/auth/invitations/validate/?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`);
  }
};
