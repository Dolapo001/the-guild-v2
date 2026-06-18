"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { ScrollText, Loader2 } from "lucide-react";
import { auditService, AuditLog } from "@/services/audit.service";
import { toast } from "sonner";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLogs(await auditService.getLogs());
      } catch (err) {
        console.error("Failed to load audit logs", err);
        toast.error("Could not load the audit trail.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-primary/10 flex items-center justify-center">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-primary">Audit Trail</h1>
          <p className="text-sm font-medium text-foreground/50">Security & activity events across the platform.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-foreground/40">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : logs.length === 0 ? (
        <GlassCard className="p-12 text-center text-foreground/50 font-medium">No audit events recorded.</GlassCard>
      ) : (
        <GlassCard className="p-0 overflow-hidden">
          <div className="divide-y divide-glass-border">
            {logs.map((log) => (
              <div key={log.uid} className="flex items-start justify-between gap-4 px-5 py-3.5 hover:bg-primary/[0.02]">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-primary">{log.action}</p>
                  <p className="text-xs font-medium text-foreground/50 truncate">
                    {log.actorName || log.actor || "system"}
                    {log.metadata && Object.keys(log.metadata).length > 0
                      ? ` • ${JSON.stringify(log.metadata)}`
                      : ""}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-foreground/40 whitespace-nowrap shrink-0">
                  {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
