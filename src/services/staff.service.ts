import { api } from '../lib/api-client';
import { User } from '../types/api';

export interface PerformanceData {
    revenue_chart: { label: string; amount: number }[];
    rating: number;
    completion_rate: string;
    total_jobs: number;
    active_hours?: string;
    trend?: {
        value: string;
        label: string;
    };
}

export const staffService = {
    getStaffList: async (): Promise<User[]> => {
        return api.get<User[]>('/core/staff/');
    },

    inviteStaff: async (email: string, role: string): Promise<any> => {
        return api.post('/core/staff/invite/', { email, role });
    },

    getStaffPerformance: async (staffUid: string, period: string = 'monthly'): Promise<PerformanceData> => {
        return api.get<PerformanceData>(`/core/staff/${staffUid}/performance/?period=${period}`);
    },

    getStaffDetails: async (staffUid: string): Promise<User> => {
        return api.get<User>(`/core/staff/${staffUid}/`);
    },

    getStaffBookings: async (staffUid: string): Promise<any[]> => {
        return api.get<any[]>(`/bookings/?staff=${staffUid}`);
    },

    removeStaff: async (staffUid: string): Promise<void> => {
        return api.delete(`/core/staff/${staffUid}/`);
    },

    updateStaff: async (staffUid: string, data: any): Promise<User> => {
        return api.patch<User>(`/core/staff/${staffUid}/`, data);
    },
    getStaffRoles: async (): Promise<any[]> => {
        return api.get<any[]>('/core/staff/roles/');
    },
    createStaffRole: async (name: string, description?: string): Promise<any> => {
        return api.post('/core/staff/roles/', { name, description });
    },
    getInvitations: async (): Promise<any[]> => {
        return api.get<any[]>('/core/staff/invitations/');
    },
    getInviteDetails: async (token: string): Promise<any> => {
        return api.get(`/core/staff/join/${token}/`);
    },
    acceptInvite: async (token: string): Promise<any> => {
        return api.post(`/core/staff/join/${token}/`, {});
    },
    resendInvitation: async (uid: string): Promise<any> => {
        return api.post(`/core/staff/invitations/${uid}/resend/`, {});
    }
};
