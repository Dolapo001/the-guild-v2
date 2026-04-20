import { api } from '../lib/api-client';
import { User } from '../types/api';

export const adminService = {
    getVerificationQueue: async (): Promise<User[]> => {
        return api.get<User[]>('/core/admin/verification-queue/');
    },

    verifyUser: async (userUid: string, status: 'VERIFIED' | 'REJECTED'): Promise<any> => {
        return api.post(`/core/admin/verify/${userUid}/`, { status });
    }
};
