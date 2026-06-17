"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";
import { 
  TrendingUp, Users, Calendar, DollarSign, Download, 
  Clock, ArrowUpRight, ArrowDownRight, Filter
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { analyticsService, AnalyticsSummary, TrendItem, PeakData } from "@/services/analytics.service";
import { toast } from "sonner";

const COLORS = ["#8B5CF6", "#EC4899", "#3B82F6", "#10B981", "#F59E0B"];

export default function BusinessAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [bookingsData, setBookingsData] = useState<{ summary: AnalyticsSummary; trends: TrendItem[] } | null>(null);
  const [revenueData, setRevenueData] = useState<{ summary: AnalyticsSummary; trends: TrendItem[] } | null>(null);
  const [customersData, setCustomersData] = useState<{ summary: AnalyticsSummary } | null>(null);
  const [peakData, setPeakData] = useState<PeakData | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    fetchData();
  }, [days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bk, rv, cs, pk] = await Promise.all([
        analyticsService.getBusinessBookings(days),
        analyticsService.getBusinessRevenue(days),
        analyticsService.getBusinessCustomers(days),
        analyticsService.getBusinessPeakHours()
      ]);
      setBookingsData(bk);
      setRevenueData(rv);
      setCustomersData(cs);
      setPeakData(pk);
    } catch (err: any) {
      toast.error("Failed to fetch analytics data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.success("Generating CSV report...");
    // Mock export logic
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">Business Analytics</h1>
          <p className="text-foreground/50 font-medium">Detailed insights into your performance and growth.</p>
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
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/40 border border-glass-border rounded-xl text-sm font-bold hover:bg-white/60 transition-all"
          >
            <Download className="h-4 w-4" /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`₦${revenueData?.summary.totalRevenue?.toLocaleString() || 0}`} 
          icon={<DollarSign className="h-5 w-5" />}
          trend="+12.5%"
          isUp={true}
        />
        <StatCard 
          title="Total Bookings" 
          value={bookingsData?.summary.totalBookings || 0} 
          icon={<Calendar className="h-5 w-5" />}
          trend="+8.2%"
          isUp={true}
        />
        <StatCard 
          title="Repeat Customers" 
          value={customersData?.summary.repeatCustomers || 0} 
          icon={<Users className="h-5 w-5" />}
          trend="-2.4%"
          isUp={false}
        />
        <StatCard 
          title="Success Rate" 
          value={`${Math.round(((bookingsData?.summary.completedBookings || 0) / (bookingsData?.summary.totalBookings || 1)) * 100)}%`} 
          icon={<TrendingUp className="h-5 w-5" />}
          trend="+5.1%"
          isUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Revenue Growth</h3>
            <DollarSign className="h-5 w-5 text-primary/30" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData?.trends || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Booking Trends */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Booking Activity</h3>
            <Calendar className="h-5 w-5 text-primary/30" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingsData?.trends || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip 
                   cursor={{fill: 'rgba(139, 92, 246, 0.05)'}}
                   contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="bookings" fill="#EC4899" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Peak Hours */}
        <GlassCard className="lg:col-span-2 p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Peak Booking Hours</h3>
            <Clock className="h-5 w-5 text-primary/30" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakData?.peakHours || []}>
                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: 'rgba(139, 92, 246, 0.05)'}} />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Retention */}
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold">Customer Mix</h3>
            <Users className="h-5 w-5 text-primary/30" />
          </div>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: "New", value: (customersData?.summary.uniqueCustomers || 0) - (customersData?.summary.repeatCustomers || 0) },
                    { name: "Returning", value: customersData?.summary.repeatCustomers || 0 }
                  ]}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#8B5CF6" />
                  <Cell fill="#10B981" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span className="text-xs font-bold text-foreground/60">New</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-foreground/60">Returning</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, isUp }: any) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${isUp ? "text-emerald-500" : "text-rose-500"}`}>
          {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
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
