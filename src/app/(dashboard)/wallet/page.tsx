"use client";

import { useState, useEffect } from "react";
import { walletService } from "@/services/wallet.service";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useWallet } from "@/contexts/WalletContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
 Wallet,
 ArrowUpRight,
 Loader2,
 ArrowDownLeft,
 Eye,
 EyeOff,
 Plus,
 Download,
 Search,
 Filter,
 TrendingUp,
 CreditCard,
 ShieldCheck,
 Gift,
 CheckCircle2,
 Clock,
 DollarSign,
 ArrowRight,
 ChevronLeft,
 ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { useAuth } from "@/contexts/AuthContext";

export default function WalletPage() {
 const { user } = useAuth();
  const { 
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
    exportTransactions 
  } = useWallet();
 const [searchTerm, setSearchTerm] = useState("");

 const currentRole = user?.role || 'customer';

 const filteredTransactions = transactions.filter(tr =>
 tr.description.toLowerCase().includes(searchTerm.toLowerCase())
 );

 return (
 <div className="space-y-10">
 <motion.div
 initial={{ opacity: 0, y: -20 }}
 animate={{ opacity: 1, y: 0 }}
 className="flex flex-col md:flex-row md:items-center justify-between gap-4"
 >
 <div>
 <h1 className="text-3xl font-extrabold tracking-tight text-primary">
 {currentRole === 'staff' ? 'My Earnings' : 'Financial Hub'}
 </h1>
 <p className="text-foreground/50 font-medium">
 {currentRole === 'customer' && "Manage your secure payments and escrow funds."}
 {currentRole === 'staff' && "Track your payouts, tips, and performance stats."}
 {currentRole === 'ceo' && "Manage your business revenue, liabilities, and profit."}
 </p>
 </div>
 <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10">
 <span className="text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Active View:</span>
 <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest">{currentRole}</span>
 </div>
 </motion.div>

  {currentRole === 'customer' && <CustomerWalletView balance={balance} pendingEscrow={pendingEscrow} isObscured={isObscured} toggleObscure={toggleObscure} fundWallet={fundWallet} transactions={filteredTransactions} exportTransactions={exportTransactions} />}
  {currentRole === 'staff' && <StaffWalletView balance={balance} tipsBalance={tipsBalance} isObscured={isObscured} toggleObscure={toggleObscure} withdraw={withdraw} transactions={filteredTransactions} exportTransactions={exportTransactions} />}
  {currentRole === 'ceo' && <BusinessWalletView balance={balance} pendingEscrow={pendingEscrow} totalRevenue={totalRevenue} growthPercentage={growthPercentage} netProfit={netProfit} isObscured={isObscured} toggleObscure={toggleObscure} withdraw={withdraw} transactions={filteredTransactions} exportTransactions={exportTransactions} isSolo={user?.isSoloOperator} />}
 {currentRole === 'admin' && (
 <div className="py-20 text-center">
 <p className="text-foreground/40 font-medium">Admin financial dashboard is under construction.</p>
 </div>
 )}
 </div>
 );
}

function CustomerWalletView({ balance, pendingEscrow, isObscured, toggleObscure, fundWallet, transactions, exportTransactions }: any) {
  const [fundOpen, setFundOpen] = useState(false);
  const [fundAmount, setFundAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(fundAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount to fund.");
      return;
    }
    setIsSubmitting(true);
    try {
      await fundWallet(amount);
      setFundOpen(false);
      setFundAmount("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Card - Blue/Purple */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8 border-blue-500/20 bg-gradient-to-br from-blue-600 to-indigo-700 shadow-2xl shadow-blue-500/20 relative overflow-hidden group min-h-[240px] flex flex-col justify-between">
            <div className="absolute -right-10 -top-10 h-64 w-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform" />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-1">Wallet Balance</p>
                <h2 className="text-5xl font-extrabold text-white tracking-tight">
                  {isObscured ? "₦ ••••••••" : `₦ ${balance.toLocaleString()}`}
                </h2>
              </div>
              <button
                onClick={toggleObscure}
                className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/20"
              >
                {isObscured ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </button>
            </div>

            <div className="relative z-10 flex gap-4">
              <Dialog open={fundOpen} onOpenChange={setFundOpen}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-8 rounded-xl bg-card text-blue-700 font-bold hover:bg-white/90 shadow-lg">
                    <Plus className="mr-2 h-4 w-4" /> Fund Wallet
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-card text-foreground rounded-3xl p-8">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-black">Top-up Wallet</DialogTitle>
                    <p className="text-xs font-semibold text-muted-foreground">Securely add funds to your wallet for bookings.</p>
                  </DialogHeader>
                  <form onSubmit={handleFundSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Amount (₦)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 5000"
                        value={fundAmount}
                        onChange={e => setFundAmount(e.target.value)}
                        className="h-12 rounded-xl border-slate-200 font-bold"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-12 rounded-xl bg-primary text-secondary font-black"
                    >
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Proceed to Payment"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
              <Button
                variant="ghost"
                className="h-12 px-6 rounded-xl text-white font-bold hover:bg-white/10 border border-white/20"
              >
                <CreditCard className="mr-2 h-4 w-4" /> Manage Cards
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Escrow Card - Green/Shield */}
        <GlassCard className="p-8 border-green-500/20 bg-white/5 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="h-24 w-24 text-green-500" />
          </div>
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">Funds in Escrow</p>
                <div className="group/tooltip relative">
                  <Clock className="h-3 w-3 text-foreground/30 cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded-lg opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50">
                    Held safely until you confirm service delivery.
                  </div>
                </div>
              </div>
              <h3 className="text-3xl font-extrabold text-green-600">₦ {pendingEscrow.toLocaleString()}</h3>
              <p className="text-[10px] font-bold text-green-600/60 uppercase tracking-widest mt-1">Protected Payments</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-between h-10 text-xs font-bold text-foreground/40 hover:text-primary group/btn">
            View Active Escrows <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </GlassCard>
      </div>

      <TransactionSection title="Payment History" filters={["All", "Payments Sent", "Refunds", "Top-ups", "Withdrawals"]} transactions={transactions} exportTransactions={exportTransactions} />
    </div>
  );
}



function StaffWalletView({ balance, tipsBalance, isObscured, toggleObscure, withdraw, transactions, exportTransactions }: any) {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [banksList, setBanksList] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);

  useEffect(() => {
    if (withdrawOpen && banksList.length === 0) {
      setLoadingBanks(true);
      walletService.getBanks()
        .then(res => {
          const list = Array.isArray(res) ? res : (res as any).data || [];
          setBanksList(list);
          if (list.length > 0) setBankCode(list[0].code);
        })
        .catch(err => console.error("Failed to load banks", err))
        .finally(() => setLoadingBanks(false));
    }
  }, [withdrawOpen]);

  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(withdrawAmount);
    const withdrawableBalance = balance + tipsBalance;
    if (!parsedAmount || parsedAmount <= 0) {
      toast.error("Please enter a valid payout amount.");
      return;
    }
    if (parsedAmount > withdrawableBalance) {
      toast.error("Insufficient withdrawable balance.");
      return;
    }
    if (!bankCode) {
      toast.error("Please select a target bank.");
      return;
    }
    if (accountNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit account number.");
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      await withdraw(parsedAmount, bankCode, accountNumber);
      setWithdrawOpen(false);
      setWithdrawAmount("");
      setAccountNumber("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const withdrawableBalance = balance + tipsBalance;
  const actualServiceEarnings = balance;

  return (
    <div className="space-y-10">
      {/* Partner Integration Info Banner */}
      <GlassCard className="p-5 border-indigo-200 bg-indigo-50/70 text-indigo-900 flex items-center gap-4 rounded-2xl shadow-sm backdrop-blur-md">
        <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-indigo-600">Partner Payroll Integration</h4>
          <p className="text-xs text-indigo-800/90 font-semibold leading-relaxed mt-0.5">
            Core service earnings are dispatched via automated payroll by your Business Owner (CEO). Client tips are credited directly to your Tip Jar and can be withdrawn instantly!
          </p>
        </div>
      </GlassCard>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Card - Sleek Lighter Royal Violet Gradient */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8 border-indigo-300 bg-gradient-to-br from-indigo-600 via-indigo-50 to-violet-600 shadow-xl shadow-indigo-500/15 relative overflow-hidden group min-h-[240px] flex flex-col justify-between rounded-3xl text-white">
            <div className="absolute -right-10 -top-10 h-64 w-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform" />

            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-[10px] font-extrabold text-indigo-100/80 uppercase tracking-widest mb-1">Withdrawable Balance</p>
                <h2 className="text-5xl font-extrabold text-white tracking-tight">
                  {isObscured ? "₦ ••••••••" : `₦ ${withdrawableBalance.toLocaleString()}`}
                </h2>
                <p className="text-[10px] font-bold text-indigo-100/80 uppercase tracking-widest mt-2">Active Wallet Tips & Payouts</p>
              </div>
              <button
                onClick={toggleObscure}
                className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/25"
              >
                {isObscured ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
              </button>
            </div>

            <div className="relative z-10">
              <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-8 rounded-xl bg-card text-indigo-600 font-bold hover:bg-white/90 shadow-lg hover:shadow-indigo-500/10 transition-all">
                    <ArrowUpRight className="mr-2 h-4 w-4 text-indigo-600" /> Request Payout
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-card border border-slate-200 text-foreground rounded-3xl p-8 shadow-2xl">
                  <DialogHeader className="space-y-2">
                    <DialogTitle className="text-xl font-black text-foreground">Secure Withdrawal</DialogTitle>
                    <p className="text-xs font-semibold text-muted-foreground">Instant payout from your Tip Jar to any Nigerian Bank Account.</p>
                  </DialogHeader>

                  <form onSubmit={handleWithdrawalSubmit} className="space-y-6 pt-4">
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Payout Amount (₦)</label>
                      <Input
                        type="number"
                        placeholder="e.g. 500"
                        value={withdrawAmount}
                        onChange={e => setWithdrawAmount(e.target.value)}
                        className="h-12 rounded-xl border-slate-200 font-bold focus:ring-primary focus:border-primary text-foreground"
                        required
                      />
                      <p className="text-[10px] font-bold text-slate-400">Withdrawable Balance: ₦ {withdrawableBalance.toLocaleString()}</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Target Bank</label>
                      {loadingBanks ? (
                        <div className="flex items-center justify-center h-12 bg-slate-50 rounded-xl border border-border">
                          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        </div>
                      ) : (
                        <select
                          value={bankCode}
                          onChange={e => setBankCode(e.target.value)}
                          className="w-full h-12 rounded-xl border border-slate-200 px-3 bg-card font-bold text-slate-700 text-sm focus:ring-primary focus:border-primary"
                          required
                        >
                          {banksList.map((b: any) => (
                            <option key={b.uid} value={b.code}>{b.name}</option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Account Number</label>
                      <Input
                        type="text"
                        maxLength={10}
                        placeholder="10-digit NUBAN number"
                        value={accountNumber}
                        onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                        className="h-12 rounded-xl border-slate-200 font-bold tracking-widest focus:ring-primary focus:border-primary text-foreground"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submittingWithdrawal}
                      className="w-full h-12 rounded-xl bg-primary text-secondary font-black hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                    >
                      {submittingWithdrawal ? (
                        <Loader2 className="h-5 w-5 animate-spin text-secondary" />
                      ) : (
                        <>Confirm & Withdraw ₦ {parseFloat(withdrawAmount || "0").toLocaleString()}</>
                      )}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </GlassCard>
        </div>

        {/* Tip Jar Card - Elegant Light Purple/Indigo Gradient */}
        <GlassCard className="p-8 border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 shadow-lg shadow-purple-500/5 flex flex-col justify-between relative overflow-hidden group rounded-3xl">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Gift className="h-24 w-24 text-purple-600" />
          </div>
          <div className="space-y-4">
            <div className="h-12 w-12 rounded-xl bg-purple-600/10 flex items-center justify-center">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-purple-700/60 uppercase tracking-widest mb-1">Tip Jar</p>
              <h3 className="text-3xl font-extrabold text-purple-600">₦ {tipsBalance.toLocaleString()}</h3>
              <p className="text-[10px] font-bold text-purple-600/60 uppercase tracking-widest mt-1">Total tips this month</p>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
            <p className="text-[10px] font-bold text-purple-600 leading-tight">
              You're doing great! <span className="text-purple-700 font-extrabold">(Top 10% of staff)</span>
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Jobs Completed", value: "42", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100/50 border border-green-200" },
          { label: "Pending Clearance", value: "₦ 18,000", icon: Clock, color: "text-amber-600", bg: "bg-amber-100/50 border border-amber-200" },
          { label: "Base Service Earnings", value: `₦ ${actualServiceEarnings.toLocaleString()}`, icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-100/50 border border-indigo-200" },
          { label: "Total Earned", value: "₦ 245K", icon: DollarSign, color: "text-primary", bg: "bg-primary/10 border border-primary/20" },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-6 border-slate-200 bg-card shadow-sm flex items-center gap-4 rounded-3xl">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("h-6 w-6", stat.color)} />
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-lg font-extrabold text-primary">{stat.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      <TransactionSection title="Earnings History" filters={["All", "Job Payouts", "Tips Received", "Withdrawals"]} transactions={transactions} exportTransactions={exportTransactions} />
    </div>
  );
}

function BusinessWalletView({ 
  balance, 
  pendingEscrow, 
  totalRevenue, 
  growthPercentage, 
  netProfit, 
  isObscured, 
  toggleObscure, 
  withdraw, 
  transactions, 
  exportTransactions,
  isSolo 
}: any) {
  const { user } = useAuth();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount to withdraw.");
      return;
    }
    if (amount > balance) {
      toast.error("Insufficient operating balance.");
      return;
    }
    setIsSubmitting(true);
    try {
      const bankList = await walletService.getBanks();
      const firstBank = Array.isArray(bankList) ? bankList[0] : (bankList as any).data?.[0];
      const targetBankCode = firstBank?.code || "MOCK_BANK";
      
      await withdraw(amount, targetBankCode, "0000000000");
      setWithdrawOpen(false);
      setWithdrawAmount("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Wallet Card */}
        <div className="lg:col-span-1">
          <GlassCard className="p-8 border-primary/20 bg-primary shadow-2xl shadow-primary/20 relative overflow-hidden group h-full flex flex-col justify-between">
            <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 bg-secondary/20 rounded-full blur-3xl" />

            <div className="relative z-10 space-y-8">
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <button
                  onClick={toggleObscure}
                  className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                >
                  {isObscured ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              <div>
                <p className="text-[10px] font-extrabold text-white/40 uppercase tracking-widest mb-1">Operating Balance</p>
                <h2 className="text-4xl font-extrabold text-white tracking-tight">
                  {isObscured ? "₦ ••••••••" : `₦ ${balance.toLocaleString()}`}
                </h2>
              </div>

              <div className="flex gap-3">
                <Button
                  disabled
                  className="flex-1 h-12 rounded-xl bg-white/50 text-primary/40 cursor-not-allowed border-0 backdrop-blur-sm"
                  title="Funding restricted for business accounts"
                >
                  <Plus className="mr-2 h-4 w-4" /> Fund
                </Button>
                
                <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                  <DialogTrigger asChild>
                    <Button
                      disabled={user?.verificationStatus !== 'verified'}
                      className="flex-1 h-12 rounded-xl bg-card text-primary font-bold hover:bg-white/90 shadow-xl disabled:opacity-50 disabled:grayscale transition-all"
                      title={user?.verificationStatus !== 'verified' ? "CAC Verification Required" : ""}
                    >
                      <ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-card text-foreground rounded-3xl p-8">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black">Business Withdrawal</DialogTitle>
                      <p className="text-xs font-semibold text-muted-foreground">Transfer funds from your business balance to your linked bank account.</p>
                    </DialogHeader>
                    <form onSubmit={handleWithdrawSubmit} className="space-y-6 pt-4">
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Amount (₦)</label>
                        <Input
                          type="number"
                          placeholder="e.g. 10000"
                          value={withdrawAmount}
                          onChange={e => setWithdrawAmount(e.target.value)}
                          className="h-12 rounded-xl border-slate-200 font-bold"
                          required
                        />
                        <p className="text-[10px] font-bold text-slate-400">Available: ₦ {balance.toLocaleString()}</p>
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 rounded-xl bg-primary text-secondary font-black"
                      >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Withdrawal"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Quick Stats */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-8 border-white/40 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <span className={cn(
                "text-xs font-bold px-2 py-1 rounded-lg",
                growthPercentage >= 0 ? "text-green-600 bg-green-500/10" : "text-red-600 bg-red-500/10"
              )}>
                {growthPercentage >= 0 ? '+' : ''}{growthPercentage}%
              </span>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Total Revenue</p>
              <h3 className="text-3xl font-extrabold text-primary">₦ {totalRevenue.toLocaleString()}</h3>
              <p className="text-[10px] font-bold text-green-600/60 uppercase tracking-widest mt-1">Growth this month</p>
            </div>
          </GlassCard>
          <GlassCard className="p-8 border-white/40 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-secondary" />
              </div>
              <span className="text-xs font-bold text-secondary bg-secondary/10 px-2 py-1 rounded-lg">Liability</span>
            </div>
            <div>
              <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Escrow Holding</p>
              <h3 className="text-3xl font-extrabold text-primary">₦ {pendingEscrow.toLocaleString()}</h3>
              <p className="text-[10px] font-bold text-secondary/60 uppercase tracking-widest mt-1">Owed to staff/business</p>
            </div>
          </GlassCard>
          <GlassCard className="p-8 border-white/40 flex flex-col justify-between md:col-span-2 bg-gradient-to-r from-primary/5 to-transparent">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <div className="text-right">
                <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Net Profit</p>
                <h3 className="text-3xl font-extrabold text-accent">₦ {netProfit.toLocaleString()}</h3>
              </div>
            </div>
            <div className="w-full bg-accent/10 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-accent h-full transition-all duration-1000" 
                style={{ width: `${Math.min((netProfit / (totalRevenue || 1)) * 100, 100)}%` }} 
              />
            </div>
            <p className="text-[10px] font-bold text-foreground/40 mt-2">
              {totalRevenue > 0 
                ? `${Math.round((netProfit / totalRevenue) * 100)}% of revenue is profit after payouts and costs.` 
                : "Start processing bookings to see profit benchmarks."}
            </p>
          </GlassCard>
        </div>
      </div>

      <TransactionSection 
        title="Business Transactions" 
        filters={isSolo ? ["All", "Revenue", "Operating Costs", "Withdrawals"] : ["All", "Revenue", "Staff Payouts", "Operating Costs", "Withdrawals"]} 
        transactions={transactions} 
        exportTransactions={exportTransactions}
      />
    </div>
  );
}

function TransactionSection({ title, filters, transactions, exportTransactions }: any) {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredTransactions = transactions.filter((tr: any) => {
    const matchesSearch = tr.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === "Revenue") matchesFilter = tr.description.includes("Revenue") || tr.description.includes("Booking") || tr.description.includes("Payment");
    if (activeFilter === "Staff Payouts") matchesFilter = tr.description.includes("Payout");
    if (activeFilter === "Operating Costs") matchesFilter = tr.description.includes("Cost") || tr.description.includes("Fee") || tr.description.includes("Commission");
    if (activeFilter === "Top-ups") matchesFilter = tr.description.includes("Fund") || tr.description.includes("Top-up");
    if (activeFilter === "Withdrawals") matchesFilter = tr.description.includes("Withdraw") || tr.description.includes("payout") || tr.description.includes("Transfer");
    if (activeFilter === "Job Payouts") matchesFilter = tr.description.includes("Job") || tr.description.includes("Earning") || tr.description.includes("Payout");
    if (activeFilter === "Tips Received") matchesFilter = tr.description.includes("Tip");
    if (activeFilter === "Payments Sent") matchesFilter = tr.type === 'debit' && (tr.description.includes("Payment") || tr.description.includes("Order"));
    if (activeFilter === "Refunds") matchesFilter = tr.description.includes("Refund");
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilteredExportCSV = () => {
    toast.info(`Preparing ${activeFilter} report CSV...`);
    const csvRows = [
      ["Date", "Description", "Amount (NGN)", "Type", "Status"],
      ...filteredTransactions.map((tr: any) => [
        tr.date,
        `"${tr.description}"`,
        tr.amount,
        tr.type,
        tr.status
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `earnings_${activeFilter.toLowerCase().replace(" ", "_")}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV transaction report downloaded successfully!");
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
        <h3 className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest">{title}</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
            <input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 pr-4 py-2 rounded-xl bg-white/40 border border-glass-border text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/10 w-64"
            />
          </div>
          <Button 
            onClick={handleFilteredExportCSV}
            variant="outline" 
            size="sm" 
            className="rounded-xl border-glass-border font-bold text-primary"
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map((f: string) => (
          <button
            key={f}
            onClick={() => {
              setActiveFilter(f);
              setCurrentPage(1);
            }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all whitespace-nowrap border",
              activeFilter === f
                ? "bg-primary text-white border-primary shadow-md"
                : "bg-white/40 text-foreground/40 border-glass-border hover:border-primary/30"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <GlassCard className="overflow-hidden border-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/5 border-b border-glass-border">
                <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-primary/40 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-border">
              {paginatedTransactions.map((tr: any) => (
                <tr key={tr.id} className="hover:bg-primary/[0.02] transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-foreground/40">{tr.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${tr.type === 'credit' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        {tr.type === 'credit' ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                      </div>
                      <span className="font-bold text-primary">{tr.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-extrabold ${tr.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                      {tr.type === 'credit' ? '+' : '-'} ₦{Math.abs(tr.amount).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${tr.status === "Success" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {tr.status}
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-20 text-center opacity-30 italic">No transactions found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="p-4 border-t border-glass-border flex items-center justify-between">
            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 rounded-lg"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </GlassCard>
    </section>
  );
}
