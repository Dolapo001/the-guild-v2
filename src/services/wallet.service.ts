import { api } from '../lib/api-client';
import { WalletInfo, Transaction } from '../types/api';

export const walletService = {
  getWalletInfo: async (): Promise<WalletInfo> => {
    return api.get<WalletInfo>('/wallet/info/');
  },

  fundWallet: async (amount: number): Promise<{ checkout_url: string; authorization_url?: string; reference?: string }> => {
    return api.post('/wallet/fund/', { amount });
  },

  verifyPayment: async (reference: string): Promise<{ status: string; message?: string }> => {
    return api.post('/wallet/verify/', { reference });
  },

  withdraw: async (amount: number, bankCode: string, accountNumber: string): Promise<{ status: string }> => {
    return api.post<{ status: string }>('/wallet/withdraw/', {
      amount,
      bank_code: bankCode,
      account_number: accountNumber,
    });
  },

  getBanks: async (): Promise<any[]> => {
    return api.get<any[]>('/wallet/banks/');
  },

  getTransactions: async (params?: { type?: string; status?: string; start_date?: string; end_date?: string }): Promise<any[]> => {
    return api.get<any[]>('/wallet/transactions/', { params: params as any });
  },

  initializePayment: async (params: { amount?: number; booking_uid?: string; order_uid?: string }): Promise<{ checkout_url: string; authorization_url?: string; reference?: string }> => {
    return api.post('/wallet/payments/intent/', params);
  },
};
