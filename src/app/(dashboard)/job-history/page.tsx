"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Briefcase,
  Wallet,
  Star,
  Search,
  Calendar,
  ChevronRight,
  CheckCircle2,
  Clock,
  TrendingUp,
  Filter,
  X,
  Receipt,
  ShoppingBag,
  User,
  Sparkles,
  Loader2,
  Share2,
  Printer,
  Download,
  Sparkle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { bookingService, asList } from "@/services/booking.service";
import { Booking } from "@/types/api";
import { toast } from "sonner";

export default function JobHistoryPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const bookings = asList(await bookingService.getBookings());
      // Map completed and paid bookings from live backend
      const backendHistory = bookings
        .filter((b: any) => ['COMPLETED', 'PAID', 'CLEARING'].includes(b.status))
        .map((b: any) => ({
          id: b.uid,
          service: b.serviceName || b.serviceDetails?.name || b.service?.name || "Premium Session",
          client: b.customerDetails?.name || b.walkinName || "Guest Client",
          date: b.date ? new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Today",
          time: b.startTime,
          duration: `${b.serviceDetails?.durationMinutes || b.service?.durationMinutes || 60} Mins`,
          endTime: b.endTime || "03:30 PM",
          price: b.totalPrice || 12000,
          tip: b.review?.tip || 0,
          status: b.status === 'COMPLETED' ? 'Paid' : 'Paid',
          rating: b.review?.rating || null,
          comment: b.review?.comment || null,
          upsells: b.sopChecklist ? b.sopChecklist.filter((item: any) => item.completed && item.price).map((item: any) => ({ name: item.text, price: item.price })) : []
        }));

      setHistory(backendHistory);
    } catch (err) {
      console.error("Failed to load history", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchHistory();
  }, []);

  // Accurate Filtering Loop
  const filteredJobs = history.filter(job => {
    // 1. Filter Search Query
    const matchesSearch =
      job.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.service.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // 2. Filter Time Ranges
    if (timeFilter === "All Time") return true;

    const jobDate = new Date(job.date);
    if (isNaN(jobDate.getTime())) return true; // Fail-safe for custom formats

    const now = new Date();
    if (timeFilter === "This Week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return jobDate >= oneWeekAgo && jobDate <= now;
    } else if (timeFilter === "This Month") {
      return jobDate.getMonth() === now.getMonth() && jobDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  // Calculate Dynamic Metric Values from Active History Array
  const totalJobsCount = filteredJobs.length;
  const totalEarningsVal = filteredJobs.reduce((acc, curr) => acc + curr.price + (curr.tip || 0), 0);
  const ratedJobs = filteredJobs.filter(h => h.rating !== null);
  const avgRatingVal = ratedJobs.length > 0
    ? (ratedJobs.reduce((acc, curr) => acc + curr.rating, 0) / ratedJobs.length).toFixed(1)
    : "4.9";

  const stats = [
    { label: "Total Jobs", value: totalJobsCount.toString(), icon: Briefcase, color: "text-primary", bg: "bg-primary/5 border-primary/10" },
    { label: "Total Earnings", value: `₦${totalEarningsVal.toLocaleString()}`, icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-100" },
    { label: "Average Rating", value: `${avgRatingVal} ⭐`, icon: Star, color: "text-amber-500", bg: "bg-amber-50 border-amber-100" },
  ];

  const handleShareReceipt = async (job: any) => {
    const totalPayout = job.price + job.tip + (job.upsells ? job.upsells.reduce((acc: number, curr: any) => acc + curr.price, 0) : 0);
    const receiptText = `🧾 THE GUILD SERVICE RECEIPT\nReference ID: #${job.id}\nService: ${job.service}\nClient Name: ${job.client}\nDate: ${job.date} • ${job.time}\nFinal Payout: ₦${totalPayout.toLocaleString()}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Guild Receipt #${job.id}`,
          text: receiptText,
          url: window.location.origin
        });
        toast.success("Receipt shared successfully!");
      } catch (err) {
        console.log("Web share cancelled or failed, falling back to copy", err);
        copyToClipboard(receiptText);
      }
    } else {
      copyToClipboard(receiptText);
    }
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      toast.success("Receipt details copied to clipboard!");
    }
  };

  const downloadReceiptAsImage = (job: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 560;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Backdrop
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 400, 560);

    // Header Color Banner
    const gradient = ctx.createLinearGradient(0, 0, 400, 0);
    gradient.addColorStop(0, '#1e3a8a'); // Brand Blue
    gradient.addColorStop(1, '#3b82f6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 15);

    // Logo Emblem
    ctx.fillStyle = '#eff6ff';
    ctx.beginPath();
    ctx.arc(200, 65, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TG', 200, 72);

    // Header Receipt Text
    ctx.fillStyle = '#0f172a';
    ctx.font = '900 20px sans-serif';
    ctx.fillText('SERVICE RECEIPT', 200, 120);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`REF ID: #${job.id}`, 200, 142);

    // Divider
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(45, 165);
    ctx.lineTo(355, 165);
    ctx.stroke();

    // Service Info
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('SERVICE PROVIDED', 200, 195);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(job.service, 200, 218);

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`with ${job.client}`, 200, 238);

    // Times
    ctx.fillStyle = '#64748b';
    ctx.font = '500 12px sans-serif';
    ctx.fillText(`Date: ${job.date}`, 200, 270);
    ctx.fillText(`Time Range: ${job.time} - ${job.endTime}`, 200, 288);

    // Financials
    ctx.beginPath();
    ctx.moveTo(45, 315);
    ctx.lineTo(355, 315);
    ctx.stroke();

    ctx.setLineDash([]); // solid line
    ctx.textAlign = 'left';
    ctx.font = '600 12px sans-serif';
    ctx.fillStyle = '#64748b';

    ctx.fillText('Base Service Fee', 55, 345);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(`₦${job.price.toLocaleString()}`, 345, 345);

    let currentY = 375;
    if (job.upsells && job.upsells.length > 0) {
      job.upsells.forEach((extra: any) => {
        ctx.textAlign = 'left';
        ctx.fillStyle = '#64748b';
        ctx.fillText(`${extra.name} (Upsell)`, 55, currentY);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#0f172a';
        ctx.fillText(`₦${extra.price.toLocaleString()}`, 345, currentY);
        currentY += 28;
      });
    }

    if (job.tip > 0) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#b45309'; // amber-700
      ctx.fillText('Client Tip', 55, currentY);
      ctx.textAlign = 'right';
      ctx.fillText(`+₦${job.tip.toLocaleString()}`, 345, currentY);
      currentY += 28;
    }

    // Divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(45, currentY - 10);
    ctx.lineTo(355, currentY - 10);
    ctx.stroke();

    // Total amount
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('Final Payout', 55, currentY + 12);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#10b981'; // Emerald
    ctx.font = 'bold 18px sans-serif';
    const totalPayout = job.price + job.tip + (job.upsells ? job.upsells.reduce((acc: number, curr: any) => acc + curr.price, 0) : 0);
    ctx.fillText(`₦${totalPayout.toLocaleString()}`, 345, currentY + 12);

    // Escrow secured border
    ctx.fillStyle = '#ecfdf5';
    ctx.fillRect(45, currentY + 38, 310, 42);
    ctx.strokeStyle = '#a7f3d0';
    ctx.strokeRect(45, currentY + 38, 310, 42);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PAYOUT STATUS: ${job.status.toUpperCase()}`, 200, currentY + 54);
    ctx.fillStyle = '#065f46';
    ctx.font = '500 9px sans-serif';
    ctx.fillText('Processed instantly via Secure Escrow', 200, currentY + 68);

    const link = document.createElement('a');
    link.download = `receipt_${job.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success("Receipt downloaded as PNG image!");
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-slate-100 pb-6"
      >
        <h1 className="text-4xl font-black tracking-tight text-slate-900">My Job History</h1>
        <p className="text-slate-500 font-semibold mt-1.5 text-base">Track your past work, earnings, and client feedback.</p>
      </motion.div>

      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat, i) => (
          <div key={i} className={cn("p-6 rounded-3xl border shadow-sm flex items-center gap-5 bg-white", stat.bg)}>
            <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
              <stat.icon className={cn("h-7 w-7", stat.color)} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-800 mt-0.5">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <GlassCard className="p-4 border-slate-200/80 bg-white shadow-md rounded-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search by client name or service..."
              className="pl-11 bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400 font-semibold rounded-xl h-12 focus:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {["This Week", "This Month", "All Time"].map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? "default" : "outline"}
                onClick={() => setTimeFilter(filter)}
                className={cn(
                  "rounded-xl h-12 px-6 font-bold transition-all text-sm",
                  timeFilter === filter
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50 bg-white"
                )}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* History List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading history...</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job, i) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  layout
                >
                  <GlassCard
                    className="p-5 border-slate-100 bg-white shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group rounded-2xl"
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className="grid md:grid-cols-3 gap-6 items-center">
                      {/* Left: Job Info */}
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                          <Briefcase className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="text-base font-black text-slate-800">{job.service}</h4>
                          <p className="text-sm font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                            <User className="h-3.5 w-3.5 text-slate-400" /> {job.client}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {job.date} • {job.time}
                          </p>
                        </div>
                      </div>

                      {/* Middle: Review */}
                      <div className="flex flex-col justify-center">
                        {job.rating ? (
                          <div className="space-y-1">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("h-3.5 w-3.5", i < job.rating! ? "fill-amber-500 text-amber-500" : "text-slate-200")} />
                              ))}
                            </div>
                            <p className="text-xs text-slate-500 font-medium italic line-clamp-1">"{job.comment}"</p>
                          </div>
                        ) : (
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No rating yet</p>
                        )}
                      </div>

                      {/* Right: Financials & Status */}
                      <div className="flex items-center justify-between md:justify-end gap-8">
                        <div className="text-right">
                          <p className="text-base font-black text-emerald-600">₦{job.price.toLocaleString()}</p>
                          {job.tip > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider mt-1">
                              <Sparkles className="h-2.5 w-2.5 text-amber-500 animate-pulse" /> +₦{job.tip.toLocaleString()} Tip
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            job.status === "Paid"
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                              : "bg-amber-50 text-amber-600 border-amber-200"
                          )}>
                            {job.status === "Paid" ? "✅ Paid" : "⏳ Clearing"}
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-20 text-center"
              >
                <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-200">
                  <Calendar className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-black text-slate-800">History Empty</h3>
                <p className="text-slate-500 font-semibold mt-2">No matching transactions found in this period.</p>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Job Receipt Modal - Compact, non-full-screen sizing */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 rounded-3xl p-0 max-w-[360px] shadow-2xl overflow-hidden mx-auto my-auto max-h-[85vh] flex flex-col">
          {selectedJob && (
            <div className="relative overflow-y-auto">
              {/* Decorative cash receipt serrated style line */}
              <div className="h-1.5 bg-gradient-to-r from-primary via-blue-500 to-amber-500 w-full" />

              <div className="p-6 space-y-4">
                <DialogHeader className="pb-3 border-b border-dashed border-slate-200 text-center relative">
                  <div className="mx-auto h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                    <Receipt className="h-5 w-5 text-primary" />
                  </div>
                  <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">
                    Service Receipt
                  </DialogTitle>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Ref ID: #{selectedJob.id}</p>
                </DialogHeader>

                <div className="text-center space-y-0.5 py-0.5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Service Provided</p>
                  <h4 className="text-lg font-black text-slate-800 leading-tight">{selectedJob.service}</h4>
                  <p className="text-xs font-semibold text-primary flex items-center justify-center gap-1 mt-0.5">
                    <User className="h-3 w-3" /> with {selectedJob.client}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 border-y border-dashed border-slate-200 py-3 text-center">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Date</p>
                    <p className="text-xs font-bold text-slate-800">{selectedJob.date}</p>
                  </div>
                  <div className="border-l border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time Range</p>
                    <p className="text-xs font-bold text-slate-800">{selectedJob.time} - {selectedJob.endTime}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Financial Summary</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Base Service Fee</span>
                      <span className="font-bold text-slate-800">₦{selectedJob.price.toLocaleString()}</span>
                    </div>
                    {selectedJob.upsells && selectedJob.upsells.map((extra: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <span className="text-slate-500 font-semibold">{extra.name} (Upsell)</span>
                        <span className="font-bold text-slate-800">₦{extra.price.toLocaleString()}</span>
                      </div>
                    ))}
                    {selectedJob.tip > 0 && (
                      <div className="flex justify-between">
                        <span className="text-amber-600 font-black flex items-center gap-1">
                          <Sparkle className="h-2.5 w-2.5 fill-amber-500 text-amber-500 animate-pulse" /> Client Tip
                        </span>
                        <span className="font-black text-amber-600">+₦{selectedJob.tip.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="border-t border-dashed border-slate-200 pt-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-slate-800">Final Payout</span>
                      <span className="text-lg font-black text-emerald-600">
                        ₦{(selectedJob.price + selectedJob.tip + (selectedJob.upsells ? selectedJob.upsells.reduce((acc: number, curr: any) => acc + curr.price, 0) : 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-xs font-black text-emerald-700">Payout Status: {selectedJob.status}</p>
                    <p className="text-[9px] font-semibold text-emerald-600/70">Processed instantly via Secure Escrow</p>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-col gap-2 pt-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleShareReceipt(selectedJob)}
                      className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-black flex items-center justify-center gap-1.5 text-xs shadow-md shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Share2 className="h-3.5 w-3.5" /> Share App
                    </Button>
                    <Button
                      onClick={() => downloadReceiptAsImage(selectedJob)}
                      className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center justify-center gap-1.5 text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <Download className="h-3.5 w-3.5" /> Download PNG
                    </Button>
                  </div>
                  <Button
                    onClick={() => setSelectedJob(null)}
                    className="h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-black hover:bg-slate-200 hover:text-slate-800 transition-all text-xs"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
