import { api } from '../lib/api-client';
import { Service, Product } from '../types/api';

export const maestroService = {
  getDiscovery: async (params: {
    lat?: number;
    lng?: number;
    category?: string;
    search?: string;
  }): Promise<{ results: Service[] }> => {
    return api.get<{ results: Service[] }>('/maestro/discovery/', {
      params: Object.fromEntries(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      )
    });
  },

  getRecommendations: async (): Promise<(Service | Product)[]> => {
    return api.get<(Service | Product)[]>('/maestro/recommendations/');
  },

  getBusiness: async (uid: string): Promise<any> => {
    return api.get<any>(`/maestro/business/${uid}/`);
  },

  getMyBusinesses: async (): Promise<any[]> => {
    return api.get<any[]>('/maestro/portal/my-businesses/');
  },
  
  getCategories: async (): Promise<{id: string, name: string}[]> => {
    return api.get<{id: string, name: string}[]>('/maestro/categories/');
  },
  
  getCities: async (): Promise<{id: string, name: string}[]> => {
    return api.get<{id: string, name: string}[]>('/maestro/cities/');
  },
  
  addService: async (businessUid: string, data: any): Promise<any> => {
    return api.post(`/maestro/business/${businessUid}/services/`, data);
  },
  
  addPortfolioEntry: async (businessUid: string, data: FormData): Promise<any> => {
    return api.post(`/maestro/business/${businessUid}/portfolio/`, data);
  },

  submitVerification: async (businessUid: string, data: FormData): Promise<any> => {
    return api.post(`/maestro/business/${businessUid}/verify-submit/`, data);
  }
};
