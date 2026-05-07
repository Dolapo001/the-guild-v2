import { api } from '../lib/api-client';
import { Service, Product } from '../types/api';

export const maestroService = {
  getDiscovery: async (params: {
    lat?: number;
    lng?: number;
    radius?: number;
    category?: string;
    search?: string;
    min_rating?: number;
    min_price?: number;
    max_price?: number;
    availability?: boolean;
    sort_by?: string;
    page?: number;
    page_size?: number;
  }): Promise<{ results: any[]; pagination: any; filters_applied?: any }> => {
    // Clear undefined/null keys to keep the URL queries clean
    const cleanedParams = Object.fromEntries(
      Object.entries(params)
        .filter(([_, v]) => v !== undefined && v !== null && v !== "")
        .map(([k, v]) => [k, String(v)])
    );
    return api.get<any>('/maestro/discovery/', { params: cleanedParams });
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
  
  getCities: async (): Promise<{id: string, name: string, latitude: number, longitude: number}[]> => {
    return api.get<{id: string, name: string, latitude: number, longitude: number}[]>('/maestro/cities/');
  },
  
  addService: async (businessUid: string, data: any): Promise<any> => {
    return api.post(`/maestro/business/${businessUid}/services/`, data);
  },
  
  // CEO Portal Services CRUD APIs
  getMyServices: async (): Promise<any[]> => {
    return api.get<any[]>('/maestro/my/services/');
  },

  createService: async (data: any): Promise<any> => {
    return api.post('/maestro/services/', data);
  },

  updateService: async (uid: string, data: any): Promise<any> => {
    return api.patch(`/maestro/services/${uid}/`, data);
  },

  deleteService: async (uid: string): Promise<any> => {
    return api.delete(`/maestro/services/${uid}/`);
  },
  
  addPortfolioEntry: async (businessUid: string, data: FormData): Promise<any> => {
    return api.post(`/maestro/business/${businessUid}/portfolio/`, data);
  },

  submitVerification: async (businessUid: string, data: FormData): Promise<any> => {
    return api.post(`/maestro/business/${businessUid}/verify-submit/`, data);
  }
};
