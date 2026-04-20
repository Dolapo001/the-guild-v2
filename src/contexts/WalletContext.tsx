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
  pendingEscrow: number;
  totalRevenue: number;
  growthPercentage: number;
  netProfit: number;
  transactions: Transaction[];
  fundWallet: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
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
      setPendingEscrow(parseFloat(data.pending_escrow.toString()));
      setTotalRevenue(data.total_revenue || 0);
      setGrowthPercentage(data.growth_percentage || 0);
      setNetProfit(data.net_profit || 0);
      setTransactions((data.transactions || []).map((t: any) => ({
        id: t.uid,
        date: t.created_at.split('T')[0],
        description: t.description,
        amount: parseFloat(t.amount.toString()),
        type: ['DEBIT', 'STAFF_PAYOUT', 'OPERATING_COST'].includes(t.transaction_type) ? 'debit' : 'credit',
        status: 'Success'
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
      if (response.checkout_url) {
        window.location.href = response.checkout_url;
      }
    } catch (err) {
      console.error("Funding failed", err);
      // Mock update
      setBalance(prev => prev + amount);
    }
  };

  const withdraw = async (amount: number) => {
    const toastId = toast.loading("Processing withdrawal request...");
    try {
      await walletService.withdraw(amount, "044", "0011223344");
      toast.success("Withdrawal request submitted successfully!", { id: toastId });
      fetchWallet();
    } catch (err) {
      console.error("Withdrawal failed", err);
      toast.error("Withdrawal failed. Please try again.", { id: toastId });
    }
  };

  const toggleObscure = () => setIsObscured(!isObscured);

  return (
    <WalletContext.Provider value={{
      balance,
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
