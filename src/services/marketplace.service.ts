import { api } from '../lib/api-client';
import { Product } from '../types/api';

export interface ServicePackage {
  uid: string;
  owner_username: string;
  name: string;
  description: string;
  price: string;
  city: string;
  is_active: boolean;
  servicesDetails: any[];
}

export interface CartItem {
  uid: string;
  product?: Product;
  package?: ServicePackage;
  productDetails?: Product;
  packageDetails?: ServicePackage;
  quantity: number;
  price_at_time: string;
}

export interface Cart {
  uid: string;
  user_username: string;
  city: string | null;
  items: CartItem[];
}

export interface Order {
  uid: string;
  customerName: string;
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  totalItemsPrice: string;
  totalPrice: string;
  deliveryAddress: string;
  city: string;
  createdAt: string;
  items: {
    uid: string;
    productDetails?: Product;
    packageDetails?: ServicePackage;
    quantity: number;
    priceAtOrder: string;
  }[];
}

export const marketplaceService = {
  getProducts: async (params?: { city?: string }): Promise<Product[]> => {
    return api.get<Product[]>('/marketplace/products/', { params: params as any });
  },

  getPackages: async (params?: { city?: string }): Promise<ServicePackage[]> => {
    return api.get<ServicePackage[]>('/marketplace/packages/', { params: params as any });
  },

  createPackage: async (data: any): Promise<ServicePackage> => {
    return api.post<ServicePackage>('/marketplace/packages/', data);
  },

  getCart: async (): Promise<Cart> => {
    return api.get<Cart>('/marketplace/cart/');
  },

  addToCart: async (data: { product_uid?: string; package_uid?: string; quantity?: number }): Promise<CartItem> => {
    return api.post<CartItem>('/marketplace/cart/add/', data);
  },

  updateCartItem: async (uid: string, quantity: number): Promise<CartItem | null> => {
    return api.patch<CartItem | null>(`/marketplace/cart/item/${uid}/`, { quantity });
  },

  removeCartItem: async (uid: string): Promise<any> => {
    return api.delete(`/marketplace/cart/item/${uid}/`);
  },

  checkout: async (data: { deliveryAddress: string; city: string }): Promise<Order> => {
    return api.post<Order>('/marketplace/orders/checkout/', data);
  },

  getMyOrders: async (): Promise<Order[]> => {
    return api.get<Order[]>('/marketplace/orders/my/');
  },

  getOrderDetail: async (uid: string): Promise<Order> => {
    return api.get<Order>(`/marketplace/orders/${uid}/`);
  },

  getProviderOrders: async (): Promise<Order[]> => {
    return api.get<Order[]>('/marketplace/orders/manage/');
  },

  getBusinessOrders: async (): Promise<Order[]> => {
    return api.get<Order[]>('/marketplace/orders/manage/');
  },

  setDeliveryFee: async (orderId: string, deliveryFee: number): Promise<Order> => {
    return api.patch<Order>(`/marketplace/orders/${orderId}/fee/`, { deliveryFee });
  },

  dispatchOrder: async (orderId: string, data: { rider_name: string; rider_phone: string; logistics_company: string }): Promise<Order> => {
    return api.post<Order>(`/marketplace/orders/${orderId}/dispatch/`, data);
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<Order> => {
    return api.patch<Order>(`/marketplace/orders/${orderId}/status/`, { status });
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

  getLogisticsCompanies: async (): Promise<any[]> => {
    return api.get<any[]>('/marketplace/logistics/');
  }
};
