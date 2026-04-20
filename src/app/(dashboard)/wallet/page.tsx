"use client";

import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
 Wallet,
 ArrowUpRight,
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
  {currentRole === 'staff' && <StaffWalletView balance={balance} isObscured={isObscured} toggleObscure={toggleObscure} withdraw={withdraw} transactions={filteredTransactions} exportTransactions={exportTransactions} />}
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
 <Button
 onClick={() => fundWallet(50000)}
 className="h-12 px-8 rounded-xl bg-white text-blue-700 font-bold hover:bg-white/90 shadow-lg"
 >
 <Plus className="mr-2 h-4 w-4" /> Fund Wallet
 </Button>
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

function StaffWalletView({ balance, isObscured, toggleObscure, withdraw, transactions, exportTransactions }: any) {
 return (
 <div className="space-y-10">
 <div className="grid gap-8 lg:grid-cols-3">
 {/* Main Card - Gold/Amber */}
 <div className="lg:col-span-2">
 <GlassCard className="p-8 border-amber-500/20 bg-gradient-to-br from-amber-500 to-orange-600 shadow-2xl shadow-amber-500/20 relative overflow-hidden group min-h-[240px] flex flex-col justify-between">
 <div className="absolute -right-10 -top-10 h-64 w-64 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform" />

 <div className="relative z-10 flex justify-between items-start">
 <div>
 <p className="text-[10px] font-extrabold text-white/60 uppercase tracking-widest mb-1">Withdrawable Balance</p>
 <h2 className="text-5xl font-extrabold text-white tracking-tight">
 {isObscured ? "₦ ••••••••" : `₦ ${(balance + 12500).toLocaleString()}`}
 </h2>
 <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-2">Earnings + Tips</p>
 </div>
 <button
 onClick={toggleObscure}
 className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all backdrop-blur-md border border-white/20"
 >
 {isObscured ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
 </button>
 </div>

 <div className="relative z-10">
 <Button
 onClick={() => withdraw(50000)}
 className="h-12 px-8 rounded-xl bg-white text-amber-700 font-bold hover:bg-white/90 shadow-lg"
 >
 <ArrowUpRight className="mr-2 h-4 w-4" /> Request Payout
 </Button>
 </div>
 </GlassCard>
 </div>

 {/* Tip Jar - Pink/Purple */}
 <GlassCard className="p-8 border-purple-500/20 bg-white/5 flex flex-col justify-between relative overflow-hidden group">
 <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
 <Gift className="h-24 w-24 text-purple-500" />
 </div>
 <div className="space-y-4">
 <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
 <Gift className="h-6 w-6 text-purple-500" />
 </div>
 <div>
 <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-1">Tip Jar</p>
 <h3 className="text-3xl font-extrabold text-purple-600">₦ 12,500</h3>
 <p className="text-[10px] font-bold text-purple-600/60 uppercase tracking-widest mt-1">Total tips this month</p>
 </div>
 </div>
 <div className="bg-purple-500/5 border border-purple-500/10 rounded-xl p-3">
 <p className="text-[10px] font-bold text-purple-600 leading-tight">
 You're doing great! <span className="text-purple-700 font-extrabold">(Top 10% of staff)</span>
 </p>
 </div>
 </GlassCard>
 </div>

 {/* Stats Row */}
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
 {[
 { label: "Jobs Completed", value: "42", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10" },
 { label: "Pending Clearance", value: "₦ 18,000", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" },
 { label: "Avg. Tip Rate", value: "15%", icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-500/10" },
 { label: "Total Earned", value: "₦ 245K", icon: DollarSign, color: "text-primary", bg: "bg-primary/10" },
 ].map((stat, i) => (
 <GlassCard key={i} className="p-6 border-white/40 flex items-center gap-4">
 <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", stat.bg)}>
 <stat.icon className={cn("h-5 w-5", stat.color)} />
 </div>
 <div>
 <p className="text-[10px] font-extrabold text-foreground/30 uppercase tracking-widest mb-0.5">{stat.label}</p>
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
                <Button
                  onClick={() => withdraw(100000)}
                  disabled={user?.verificationStatus !== 'verified'}
                  className="flex-1 h-12 rounded-xl bg-white text-primary font-bold hover:bg-white/90 shadow-xl disabled:opacity-50 disabled:grayscale transition-all"
                  title={user?.verificationStatus !== 'verified' ? "CAC Verification Required" : ""}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" /> Withdraw
                </Button>
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
    if (activeFilter === "Withdrawals") matchesFilter = tr.description.includes("Withdraw");
    if (activeFilter === "Job Payouts") matchesFilter = tr.description.includes("Job") || tr.description.includes("Earning");
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
            onClick={exportTransactions}
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
