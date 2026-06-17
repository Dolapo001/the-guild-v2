import { api } from '../lib/api-client';

export interface DashboardStats {
    totalRevenue: number;
    activeBookings: number;
    staffActive: number;
    pendingVerifications: number;
    averageRating: number;
    trends: {
        revenue: string;
        bookings: string;
        staff: string;
        rating: string;
    };
}

export const dashboardService = {
    getStats: async (): Promise<DashboardStats> => {
        return api.get<DashboardStats>('/core/dashboard/stats/');
    },
    getRevenue: async (period: string = 'monthly', offset: number = 0): Promise<{month: string, amount: number}[]> => {
        return api.get<{month: string, amount: number}[]>(`/core/dashboard/revenue/?period=${period}&offset=${offset}`);
    }
};
