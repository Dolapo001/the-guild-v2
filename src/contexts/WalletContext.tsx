"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { walletService } from "@/services/wallet.service";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "credit" | "debit";
  status: "Success" | "Pending" | "Failed";
}

interface WalletContextType {
  balance: number;
  tipsBalance: number;
  pendingEscrow: number;
  totalRevenue: number;
  growthPercentage: number;
  netProfit: number;
  transactions: Transaction[];
  fundWallet: (amount: number) => Promise<void>;
  withdraw: (amount: number, bankCode: string, accountNumber: string) => Promise<void>;
  isObscured: boolean;
  toggleObscure: () => void;
  loading: boolean;
  notification: string | null;
  clearNotification: () => void;
  exportTransactions: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [tipsBalance, setTipsBalance] = useState(0);
  const [pendingEscrow, setPendingEscrow] = useState(0);
  const [isObscured, setIsObscured] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [growthPercentage, setGrowthPercentage] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const clearNotification = () => setNotification(null);

  const fetchWallet = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await walletService.getWalletInfo();
      setBalance(parseFloat(data.balance.toString()));
      setTipsBalance(data.tipsBalance ? parseFloat(data.tipsBalance.toString()) : 0);
      setPendingEscrow(parseFloat(data.pendingEscrow.toString()));
      setTotalRevenue(data.totalRevenue || 0);
      setGrowthPercentage(data.growthPercentage || 0);
      setNetProfit(data.netProfit || 0);
      setTransactions((data.transactions || []).map((t: any) => ({
        id: t.uid,
        date: t.createdAt.split('T')[0],
        description: t.description,
        amount: parseFloat(t.amount.toString()),
        type: ['DEBIT', 'STAFF_PAYOUT', 'OPERATING_COST', 'COMMISSION', 'PAYOUT'].includes(t.transactionType) ? 'debit' : 'credit',
        status: t.status === 'SUCCESS' ? 'Success' : (t.status === 'PENDING' ? 'Pending' : 'Failed')
      })));
    } catch (err) {
      console.warn("Using empty wallet state due to fetch error", err);
      // Ensure state is cleared on error if no data was fetched
      setBalance(0);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, [user]);

  const fundWallet = async (amount: number) => {
    try {
      const response = await walletService.fundWallet(amount);
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      }
    } catch (err: any) {
      console.error("Funding failed", err);
      toast.error(err?.data?.detail || err?.data?.message || err?.message || "Failed to initialize payment gateway.");
    }
  };

  const withdraw = async (amount: number, bankCode: string, accountNumber: string) => {
    const toastId = toast.loading("Processing withdrawal request...");
    try {
      await walletService.withdraw(amount, bankCode, accountNumber);
      toast.success("Withdrawal request submitted successfully!", { id: toastId });
      fetchWallet();
    } catch (err: any) {
      console.error("Withdrawal failed", err);
      const msg = err?.data?.detail || err?.data?.message || err?.message || "Withdrawal failed. Please try again.";
      toast.error(msg, { id: toastId });
      throw new Error(msg);
    }
  };

  const toggleObscure = () => setIsObscured(!isObscured);

  return (
    <WalletContext.Provider value={{
      balance,
      tipsBalance,
      pendingEscrow,
      totalRevenue,
      growthPercentage,
      netProfit,
      transactions,
      fundWallet,
      withdraw,
      isObscured,
      toggleObscure,
      loading,
      notification,
      clearNotification,
      exportTransactions: () => {
        toast.info("Exporting transaction history...");
        const csv = [
          ['Date', 'Description', 'Amount', 'Type', 'Status'],
          ...transactions.map(t => [t.date, t.description, t.amount, t.type, t.status])
        ].map(e => e.join(",")).join("\n");
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        toast.success("Export complete! Check your downloads.");
      }
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
