import { api } from '../lib/api-client';
import { Booking } from '../types/api';

export const bookingService = {
  createBooking: async (data: {
    business: string;
    service: string;
    date: string;
    start_time: string;
    staff?: string;
    special_note?: string;
    reference_image?: string;
    walkin_name?: string;
    walkin_phone?: string;
    booking_type?: 'ONE_TIME' | 'SCHEDULED' | 'RECURRING';
    recurrence_rule?: string;
    recurrence_interval?: number;
    recurrence_count?: number;
  }): Promise<Booking> => {
    return api.post<Booking>('/bookings/', data);
  },

  getAvailability: async (serviceId: string, date: string): Promise<Array<{ start_time: string; end_time: string; is_available: boolean }>> => {
    return api.get<Array<{ start_time: string; end_time: string; is_available: boolean }>>('/bookings/availability/', {
      params: { service_id: serviceId, date }
    });
  },

  getBookings: async (): Promise<Booking[]> => {
    return api.get<Booking[]>('/bookings/');
  },

  getMyBookings: async (): Promise<Booking[]> => {
    return api.get<Booking[]>('/bookings/my/');
  },

  getProviderBookings: async (): Promise<Booking[]> => {
    return api.get<Booking[]>('/bookings/provider/');
  },

  getBookingDetails: async (id: string): Promise<Booking> => {
    return api.get<Booking>(`/bookings/${id}/`);
  },

  updateBookingStatus: async (id: string, status: string, reason?: string): Promise<Booking> => {
    return api.patch<Booking>(`/bookings/${id}/status/`, { status, reason });
  },

  assignStaff: async (id: string, staffUid: string): Promise<Booking> => {
    return api.patch<Booking>(`/bookings/${id}/assign-staff/`, { staff_uid: staffUid });
  },

  acceptReplacement: async (id: string, staffUid: string): Promise<Booking> => {
    return api.post<Booking>(`/bookings/${id}/accept-replacement/`, { staff_uid: staffUid });
  },

  updateSopChecklist: async (bookingId: string, checklist: any): Promise<any> => {
    return api.patch(`/bookings/${bookingId}/sop-checklist/`, { checklist });
  },

  submitReview: async (data: { booking: string; rating: number; comment: string; after_photos?: string[] }): Promise<any> => {
    return api.post('/bookings/review/', data);
  },

  getStaffSchedule: async (params: { month?: string; date?: string }): Promise<any> => {
    return api.get('/bookings/staff/schedule/', { params });
  },

  getActiveJob: async (): Promise<Booking | null> => {
    return api.get<Booking | null>('/bookings/active/');
  }
};
