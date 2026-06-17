import { api } from '../lib/api-client';
import { Service, Product } from '../types/api';

export const maestroService = {
  getDiscovery: async (params: any) => {
    const cleanedParams = Object.fromEntries(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => [k, String(v)]),
    );
    return api.get<any>('/maestro/discovery/', { params: cleanedParams });
  },

  getRecommendations: async (): Promise<(Service | Product)[]> => api.get('/maestro/recommendations/'),

  getBusiness: async (uid: string) => api.get(`/maestro/business/${uid}/`),

  getMyBusinesses: async () => api.get<any[]>('/maestro/portal/my-businesses/'),

  getCategories: async () => api.get<{ id: string; name: string }[]>('/maestro/categories/'),

  getCities: async () => api.get<{ id: string; name: string; latitude: number; longitude: number }[]>('/maestro/cities/'),

  addService: async (businessUid: string, data: any) => api.post(`/maestro/business/${businessUid}/services/`, data),

  getMyServices: async () => api.get<any[]>('/maestro/my/services/'),

  createService: async (data: any) => api.post('/maestro/services/', data),

  updateService: async (uid: string, data: any) => api.patch(`/maestro/services/${uid}/`, data),

  deleteService: async (uid: string) => api.delete(`/maestro/services/${uid}/`),

  addPortfolioEntry: async (businessUid: string, data: FormData) =>
    api.post(`/maestro/business/${businessUid}/portfolio/`, data),

  updatePortfolioEntry: async (entryUid: string, data: any) =>
    api.patch(`/maestro/portfolio/${entryUid}/`, data),

  deletePortfolioEntry: async (entryUid: string) =>
    api.delete(`/maestro/portfolio/${entryUid}/`),

  submitVerification: async (businessUid: string, data: FormData) =>
    api.post(`/maestro/business/${businessUid}/verify-submit/`, data),

  uploadBusinessAssets: async (businessUid: string, data: FormData) =>
    api.post<{ logo?: string; banner?: string }>(`/maestro/portal/business/${businessUid}/upload-assets/`, data),

  chatbot: async (message: string) => api.post<{ response: string }>('/maestro/chat/', { message }),
};
