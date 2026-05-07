import { api } from "./api.service";

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
    const res = await api.get(\`/analytics/business/bookings/?days=\${days}\`);
    return res.data.data;
  }

  async getBusinessRevenue(days = 30) {
    const res = await api.get(\`/analytics/business/revenue/?days=\${days}\`);
    return res.data.data;
  }

  async getBusinessCustomers(days = 30) {
    const res = await api.get(\`/analytics/business/customers/?days=\${days}\`);
    return res.data.data;
  }

  async getBusinessPeakHours() {
    const res = await api.get(\`/analytics/business/peak-hours/\`);
    return res.data.data;
  }

  // Admin Analytics
  async getAdminUsers(days = 30) {
    const res = await api.get(\`/analytics/admin/users/?days=\${days}\`);
    return res.data.data;
  }

  async getAdminConversions() {
    const res = await api.get(\`/analytics/admin/conversions/\`);
    return res.data.data;
  }

  async getAdminSectors() {
    const res = await api.get(\`/analytics/admin/sectors/\`);
    return res.data.data;
  }

  async getAdminFraud(days = 30) {
    const res = await api.get(\`/analytics/admin/fraud/?days=\${days}\`);
    return res.data.data;
  }
}

export const analyticsService = new AnalyticsService();
