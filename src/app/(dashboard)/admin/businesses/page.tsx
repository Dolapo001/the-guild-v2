"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, XCircle, Loader2, Building2 } from "lucide-react";
import { maestroService } from "@/services/maestro.service";
import { toast } from "sonner";

export default function AdminBusinessVerificationPage() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      setQueue(await maestroService.getBusinessVerificationQueue());
    } catch (err) {
      console.error("Failed to load business verification queue", err);
      toast.error("Could not load the verification queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDecision = async (uid: string, decision: "verified" | "rejected") => {
    setSubmitting(uid);
    try {
      await maestroService.verifyBusiness(uid, decision);
      toast.success(`Business ${decision}.`);
      setQueue((prev) => prev.filter((b) => b.uid !== uid));
    } catch (err) {
      console.error("Verification decision failed", err);
      toast.error("Action failed. Please retry.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Business Verification</h1>
          <p className="text-sm font-medium text-foreground/50">Approve or reject pending business profiles.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-foreground/40">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : queue.length === 0 ? (
        <GlassCard className="p-12 text-center text-foreground/50 font-medium">
          No businesses awaiting verification. 🎉
        </GlassCard>
      ) : (
        <div className="grid gap-4">
          {queue.map((b) => (
            <GlassCard key={b.uid} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-primary/60" />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-primary truncate">{b.name || b.businessName || "Unnamed business"}</p>
                  <p className="text-xs font-medium text-foreground/50 truncate">
                    {b.locationName || b.city || "—"}
                    {b.category ? ` • ${b.category}` : ""}
                  </p>
                </div>
                <Badge className="bg-amber-500/10 text-amber-600 border-0 ml-2 shrink-0">PENDING</Badge>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  disabled={submitting === b.uid}
                  onClick={() => handleDecision(b.uid, "rejected")}
                  className="h-10 rounded-xl border-red-500/30 text-red-600 hover:bg-red-500/5"
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button
                  disabled={submitting === b.uid}
                  onClick={() => handleDecision(b.uid, "verified")}
                  className="h-10 rounded-xl bg-primary text-white"
                >
                  {submitting === b.uid ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle2 className="h-4 w-4 mr-1" /> Approve</>}
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
