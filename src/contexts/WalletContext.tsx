"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
    transactions: Transaction[];
    fundWallet: (amount: number) => void;
    withdraw: (amount: number) => void;
    isObscured: boolean;
    toggleObscure: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const [balance, setBalance] = useState(2450000);
    const [isObscured, setIsObscured] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([
        { id: "tr1", date: "2026-01-08", description: "Booking Payment - #1024", amount: 15000, type: "credit", status: "Success" },
        { id: "tr2", date: "2026-01-07", description: "Withdrawal to Bank", amount: 50000, type: "debit", status: "Success" },
        { id: "tr3", date: "2026-01-06", description: "Product Sale - Organic Face Oil", amount: 12500, type: "credit", status: "Success" },
        { id: "tr4", date: "2026-01-05", description: "Wallet Funding", amount: 20000, type: "credit", status: "Success" },
        { id: "tr5", date: "2026-01-04", description: "Service Fee", amount: 2500, type: "debit", status: "Success" },
    ]);

    const fundWallet = (amount: number) => {
        setBalance(prev => prev + amount);
        const newTransaction: Transaction = {
            id: `tr-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: "Wallet Funding",
            amount,
            type: "credit",
            status: "Success"
        };
        setTransactions(prev => [newTransaction, ...prev]);
    };

    const withdraw = (amount: number) => {
        if (balance >= amount) {
            setBalance(prev => prev - amount);
            const newTransaction: Transaction = {
                id: `tr-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                description: "Withdrawal to Bank",
                amount,
                type: "debit",
                status: "Success"
            };
            setTransactions(prev => [newTransaction, ...prev]);
        }
    };

    const toggleObscure = () => setIsObscured(!isObscured);

    return (
        <WalletContext.Provider value={{ balance, transactions, fundWallet, withdraw, isObscured, toggleObscure }}>
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
