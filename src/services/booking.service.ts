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
  }): Promise<Booking> => {
    return api.post<Booking>('/bookings/', data);
  },

  getBookings: async (): Promise<Booking[]> => {
    return api.get<Booking[]>('/bookings/');
  },

  getBookingDetails: async (id: string): Promise<Booking> => {
    return api.get<Booking>(`/bookings/${id}/`);
  },

  updateBookingStatus: async (id: string, status: string, reason?: string): Promise<Booking> => {
    return api.patch<Booking>(`/bookings/${id}/`, { status, reason });
  },

  assignStaff: async (id: string, staffUid: string): Promise<Booking> => {
    return api.patch<Booking>(`/bookings/${id}/`, { staff: staffUid });
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
