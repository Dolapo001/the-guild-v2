import { api } from "../lib/api-client";

export interface AnalyticsSummary {
  totalBookings?: number;
  completedBookings?: number;
  cancelled_bookings?: number;
  totalRevenue?: number;
  uniqueCustomers?: number;
  repeatCustomers?: number;
  newSignups?: number;
  avgDau?: number;
  totalFees?: number;
  totalFraudFlags?: number;
}

export interface TrendItem {
  date: string;
  bookings?: number;
  revenue?: number;
  dau?: number;
}

export interface PeakData {
  peakHours: { hour: string; count: number }[];
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
      searchToBooking: number;
      bookingToPayment: number;
      visitorToSignup: number;
    }>(`/analytics/admin/conversions/`);
  }

  async getAdminSectors() {
    return api.get<{
      sectorBookings?: Record<string, number>;
      sector_revenue?: Record<string, number>;
    }>(`/analytics/admin/sectors/`);
  }

  async getAdminFraud(days = 30) {
    return api.get<{ totalFraudFlags: number }>(`/analytics/admin/fraud/`, {
      params: { days: String(days) },
    });
  }
}

export const analyticsService = new AnalyticsService();
