"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, Users, Calendar, DollarSign, Download, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, Activity, Map
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { analyticsService, AnalyticsSummary, TrendItem } from "@/services/analytics.service";
import { toast } from "sonner";

const COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B"];

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{ summary: AnalyticsSummary; trends: TrendItem[] } | null>(null);
  const [conversionData, setConversionData] = useState<any>(null);
  const [sectorData, setSectorData] = useState<any>(null);
  const [fraudData, setFraudData] = useState<{ totalFraudFlags: number } | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usr, conv, sect, frd] = await Promise.all([
        analyticsService.getAdminUsers(days),
        analyticsService.getAdminConversions(),
        analyticsService.getAdminSectors(),
        analyticsService.getAdminFraud(days)
      ]);
      setUserData(usr);
      setConversionData(conv);
      setSectorData(sect);
      setFraudData(frd);
    } catch (err: any) {
      toast.error("Failed to fetch admin analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const sectorChartData = Object.keys(sectorData?.sectorBookings || {}).map(key => ({
    name: key,
    value: sectorData.sectorBookings[key]
  }));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Platform Intelligence</h1>
          <p className="text-foreground/50 font-medium">Global overview of platform growth, conversion and health.</p>
        </motion.div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white/40 border border-glass-border rounded-xl p-1">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  days === d ? "bg-primary text-white shadow-lg" : "hover:bg-white/50 text-foreground/60"
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="New Signups" 
          value={userData?.summary.newSignups || 0} 
          icon={<Users className="h-5 w-5" />}
          trend="+15%"
          isUp={true}
        />
        <StatCard 
          title="Avg Daily Active" 
          value={userData?.summary.avgDau || 0} 
          icon={<Activity className="h-5 w-5" />}
          trend="+5.2%"
          isUp={true}
        />
        <StatCard 
          title="Platform Fees" 
          value={`₦${(userData?.summary.totalFees || 0).toLocaleString()}`} 
          icon={<DollarSign className="h-5 w-5" />}
          trend="+12%"
          isUp={true}
        />
        <StatCard 
          title="Fraud Alerts" 
          value={fraudData?.totalFraudFlags || 0} 
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={fraudData?.totalFraudFlags ? "+1" : "Stable"}
          isUp={false}
          isWarning={!!fraudData?.totalFraudFlags}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Growth */}
        <GlassCard className="lg:col-span-2 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Daily Active Users (DAU)</h3>
            <Activity className="h-5 w-5 text-primary/30" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userData?.trends || []}>
                <defs>
                  <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip />
                <Area type="monotone" dataKey="dau" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorDau)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Conversion Funnel */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Conversion Rates</h3>
            <TrendingUp className="h-5 w-5 text-primary/30" />
          </div>
          <div className="space-y-6">
            <FunnelItem label="Search → Booking" value={conversionData?.searchToBooking} color="bg-primary" />
            <FunnelItem label="Booking → Payment" value={conversionData?.bookingToPayment} color="bg-pink-500" />
            <FunnelItem label="Visitor → Signup" value={conversionData?.visitorToSignup} color="bg-blue-500" />
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sector Performance */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Sector Distribution</h3>
            <Map className="h-5 w-5 text-primary/30" />
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({name, percent}) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {sectorChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Recent Fraud Reports */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Security & Trust</h3>
            <AlertTriangle className="h-5 w-5 text-primary/30" />
          </div>
          <div className="space-y-4">
             {fraudData?.totalFraudFlags ? (
               <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                 <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                 <div>
                   <p className="text-sm font-bold text-rose-900">Anomalous Booking Velocity</p>
                   <p className="text-xs text-rose-700">Multiple high-value bookings from User #129 within 5 minutes.</p>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 text-foreground/30">
                 <Activity className="h-12 w-12 mb-4 opacity-20" />
                 <p className="font-bold">No critical alerts detected</p>
               </div>
             )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, isUp, isWarning }: any) {
  return (
    <GlassCard className={`p-6 ${isWarning ? "border-rose-200/50" : ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isWarning ? "bg-rose-100 text-rose-500" : "bg-primary/10 text-primary"}`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? "text-emerald-500" : isWarning ? "text-rose-500" : "text-foreground/40"}`}>
          {isUp && <ArrowUpRight className="h-3 w-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-xs font-extrabold text-foreground/40 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-2xl font-black text-primary">{value}</h4>
      </div>
    </GlassCard>
  );
}

function FunnelItem({ label, value, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-bold text-foreground/60">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 w-full bg-white/20 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full ${color}`} 
        />
      </div>
    </div>
  );
}
