import { api } from '../lib/api-client';
import { WalletInfo } from '../types/api';

export const walletService = {
  getWalletInfo: async (): Promise<WalletInfo> => api.get<WalletInfo>('/wallet/info/'),

  fundWallet: async (amount: number) =>
    api.post<{ checkoutUrl: string; authorization_url?: string; reference?: string }>('/wallet/fund/', { amount }),

  verifyPayment: async (reference: string) =>
    api.post<{ status: string; message?: string }>('/wallet/verify/', { reference }),

  withdraw: async (amount: number, bankCode: string, accountNumber: string) =>
    api.post<{ status: string }>('/wallet/withdraw/', { amount, bank_code: bankCode, accountNumber: accountNumber }),

  getBanks: async () => api.get<any[]>('/wallet/banks/'),

  getTransactions: async (params?: { type?: string; status?: string; start_date?: string; end_date?: string }) =>
    api.get<any[]>('/wallet/transactions/', { params: params as any }),

  initializePayment: async (params: { amount?: number; booking_uid?: string; order_uid?: string }) =>
    api.post<{ checkoutUrl: string; authorization_url?: string; reference?: string }>('/wallet/payments/intent/', params),

  releaseEscrow: async (bookingUid: string) => api.post(`/wallet/release-escrow/${bookingUid}/`, {}),

  staffPayout: async (params: { staffUid: string; amount: number; description?: string }) =>
    api.post('/wallet/payout/staff/', params),
};
