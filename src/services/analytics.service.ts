import { api } from "../lib/api-client";

export interface AnalyticsSummary {
  total_bookings?: number;
  completed_bookings?: number;
  cancelled_bookings?: number;
  total_revenue?: number;
  unique_customers?: number;
  repeat_customers?: number;
  new_signups?: number;
  avg_dau?: number;
  total_fees?: number;
  total_fraud_flags?: number;
}

export interface TrendItem {
  date: string;
  bookings?: number;
  revenue?: number;
  dau?: number;
}

export interface PeakData {
  peak_hours: { hour: string; count: number }[];
  peak_days: { day: string; count: number }[];
}

class AnalyticsService {
  // Business Analytics
  async getBusinessBookings(days = 30) {
    return api.get<{ summary: AnalyticsSummary; trends: TrendItem[] }>(
      `/analytics/business/bookings/`,
      { params: { days: String(days) } }
    );
  }

  async getBusinessRevenue(days = 30) {
    return api.get<{ summary: AnalyticsSummary; trends: TrendItem[] }>(
      `/analytics/business/revenue/`,
      { params: { days: String(days) } }
    );
  }

  async getBusinessCustomers(days = 30) {
    return api.get<{ summary: AnalyticsSummary }>(
      `/analytics/business/customers/`,
      { params: { days: String(days) } }
    );
  }

  async getBusinessPeakHours() {
    return api.get<PeakData>(`/analytics/business/peak-hours/`);
  }

  // Admin Analytics
  async getAdminUsers(days = 30) {
    return api.get<{ summary: AnalyticsSummary; trends: TrendItem[] }>(
      `/analytics/admin/users/`,
      { params: { days: String(days) } }
    );
  }

  async getAdminConversions() {
    return api.get<{
      search_to_booking: number;
      booking_to_payment: number;
      visitor_to_signup: number;
    }>(`/analytics/admin/conversions/`);
  }

  async getAdminSectors() {
    return api.get<{
      sector_bookings?: Record<string, number>;
      sector_revenue?: Record<string, number>;
    }>(`/analytics/admin/sectors/`);
  }

  async getAdminFraud(days = 30) {
    return api.get<{ total_fraud_flags: number }>(`/analytics/admin/fraud/`, {
      params: { days: String(days) },
    });
  }
}

export const analyticsService = new AnalyticsService();
