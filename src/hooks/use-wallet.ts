"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletService } from "@/services/wallet.service";

/**
 * React Query-based replacement for `WalletContext`. Co-existed during the
 * audit migration; once all consumers have switched, WalletContext can be
 * deleted.
 *
 * Cache key: `["wallet", "info"]`. Mutations (`useFundWallet`,
 * `useWithdraw`) invalidate it, so any component using `useWallet()` updates
 * automatically.
 */
export const walletQueryKey = ["wallet", "info"] as const;

export function useWallet() {
  return useQuery({
    queryKey: walletQueryKey,
    queryFn: () => walletService.getWalletInfo(),
  });
}

export function useTransactions(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ["wallet", "transactions", params],
    queryFn: () => walletService.getTransactions(params),
  });
}

export function useFundWallet() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => walletService.fundWallet(amount),
    onSettled: () => qc.invalidateQueries({ queryKey: walletQueryKey }),
  });
}

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { amount: number; bankCode: string; accountNumber: string }) =>
      walletService.withdraw(vars.amount, vars.bankCode, vars.accountNumber),
    onSettled: () => qc.invalidateQueries({ queryKey: walletQueryKey }),
  });
}
