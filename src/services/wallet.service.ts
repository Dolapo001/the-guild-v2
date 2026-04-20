import { api } from '../lib/api-client';
import { WalletInfo, Transaction } from '../types/api';

export const walletService = {
  getWalletInfo: async (): Promise<WalletInfo> => {
    return api.get<WalletInfo>('/wallet/info/');
  },

  fundWallet: async (amount: number): Promise<{checkout_url: string}> => {
    return api.post<{checkout_url: string}>('/wallet/fund/', { amount });
  },

  withdraw: async (amount: number, bankCode: string, accountNumber: string): Promise<{status: string}> => {
    return api.post<{status: string}>('/wallet/withdraw/', { amount, bank_code: bankCode, account_number: accountNumber });
  },

  getBanks: async (): Promise<any[]> => {
    return api.get<any[]>('/wallet/banks/');
  }
};
