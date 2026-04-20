import { api } from '../lib/api-client';
import { Product } from '../types/api';

export const marketplaceService = {
  getProducts: async (params?: { category?: string; search?: string }): Promise<Product[]> => {
    return api.get<Product[]>('/marketplace/products/', { params: params as any });
  },

  createOrder: async (data: {
    items: { product: string; quantity: number }[];
    shipping_address: string;
  }): Promise<any> => {
    return api.post('/marketplace/orders/', data);
  },

  setDeliveryFee: async (orderId: string, delivery_fee: number): Promise<any> => {
    return api.patch(`/marketplace/orders/${orderId}/set-fee/`, { delivery_fee });
  },

  getInventory: async (): Promise<Product[]> => {
    return api.get<Product[]>('/marketplace/inventory/');
  },

  createProduct: async (data: any): Promise<Product> => {
    return api.post<Product>('/marketplace/products/', data);
  },

  updateProduct: async (uid: string, data: any): Promise<Product> => {
    return api.patch<Product>(`/marketplace/products/${uid}/`, data);
  },

  deleteProduct: async (uid: string): Promise<any> => {
    return api.delete(`/marketplace/products/${uid}/`);
  },

  getBusinessOrders: async (): Promise<any[]> => {
    return api.get<any[]>('/marketplace/orders/manage/');
  },

  dispatchOrder: async (orderId: string, riderData: any): Promise<any> => {
    return api.post(`/marketplace/orders/${orderId}/dispatch/`, riderData);
  },

  getLogisticsCompanies: async (): Promise<any[]> => {
    return api.get<any[]>('/marketplace/logistics/');
  }
};
