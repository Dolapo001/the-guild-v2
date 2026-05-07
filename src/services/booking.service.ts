import { api } from '../lib/api-client';
import { Booking } from '../types/api';

export interface Paginated<T> {
  count: number;
  page: number;
  page_size: number;
  num_pages: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function isPaginated<T>(value: unknown): value is Paginated<T> {
  return !!value && typeof value === 'object' && 'results' in (value as any) && 'count' in (value as any) && Array.isArray((value as any).results);
}

export function asList<T>(value: T[] | Paginated<T> | undefined | null): T[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (isPaginated<T>(value)) return value.results;
  return [];
}

export const bookingService = {
  createBooking: async (data: any): Promise<Booking> => api.post<Booking>('/bookings/', data),

  getAvailability: async (serviceId: string, date: string) =>
    api.get<Array<{ start_time: string; end_time: string; is_available: boolean }>>(
      '/bookings/availability/', { params: { service_id: serviceId, date } },
    ),

  getBookings: async (params?: { page?: number; page_size?: number }) =>
    api.get<Paginated<Booking> | Booking[]>('/bookings/', { params: params as any }),

  getMyBookings: async (params?: { page?: number; page_size?: number }) =>
    api.get<Paginated<Booking> | Booking[]>('/bookings/my/', { params: params as any }),

  getProviderBookings: async (params?: { page?: number; page_size?: number }) =>
    api.get<Paginated<Booking> | Booking[]>('/bookings/provider/', { params: params as any }),

  getBookingDetails: async (id: string) => api.get<Booking>(`/bookings/${id}/`),

  updateBookingStatus: async (id: string, status: string, reason?: string) =>
    api.patch<Booking>(`/bookings/${id}/status/`, { status, reason }),

  assignStaff: async (id: string, staffUid: string) =>
    api.patch<Booking>(`/bookings/${id}/assign-staff/`, { staff_uid: staffUid }),

  acceptReplacement: async (id: string, staffUid: string) =>
    api.post<Booking>(`/bookings/${id}/accept-replacement/`, { staff_uid: staffUid }),

  updateSopChecklist: async (bookingId: string, checklist: any) =>
    api.patch(`/bookings/${bookingId}/sop-checklist/`, { checklist }),

  submitReview: async (data: { booking: string; rating: number; comment: string; after_photos?: string[] }) =>
    api.post('/bookings/review/', data),

  getStaffSchedule: async (params: { month?: string; date?: string }) =>
    api.get('/bookings/staff/schedule/', { params: params as any }),

  getActiveJob: async () => api.get<Booking | null>('/bookings/active/'),

  triggerSos: async (id: string, lat: number, lng: number) =>
    api.post(`/bookings/${id}/sos/`, { lat, lng }),

  addExtra: async (id: string, description: string, price: number) =>
    api.patch(`/bookings/${id}/add-extra/`, { description, price }),

  cancelAndRefund: async (id: string) => api.post<Booking>(`/bookings/${id}/cancel-refund/`, {}),

  contactLog: async (id: string) => api.post(`/bookings/${id}/contact-log/`, {}),
};

export interface Shift {
  uid: string;
  staff: string;
  business: string;
  start_time: string;
  end_time: string;
  status: 'SCHEDULED' | 'COMPLETED' | 'MISSED';
  notes?: string;
}

export const shiftService = {
  list: async () => api.get<Shift[]>('/bookings/shifts/'),
  get: async (uid: string) => api.get<Shift>(`/bookings/shifts/${uid}/`),
  create: async (data: Omit<Shift, 'uid' | 'status'> & { status?: Shift['status'] }) =>
    api.post<Shift>('/bookings/shifts/', data),
  update: async (uid: string, data: Partial<Shift>) => api.patch<Shift>(`/bookings/shifts/${uid}/`, data),
  delete: async (uid: string) => api.delete<void>(`/bookings/shifts/${uid}/`),
};
