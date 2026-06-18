"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, CheckCircle2, XCircle, Building2 } from "lucide-react";
import { maestroService } from "@/services/maestro.service";
import { toast } from "sonner";
import { DataTable, type Column } from "@/components/ui/data-table";

type Business = {
  uid: string;
  name?: string;
  businessName?: string;
  locationName?: string;
  city?: string;
  category?: string;
};

export default function AdminBusinessVerificationPage() {
  const [queue, setQueue] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0); // bump to reset table selection after a decision

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setQueue(await maestroService.getBusinessVerificationQueue());
    } catch (err) {
      console.error("Failed to load business verification queue", err);
      setError("We couldn't load the verification queue. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const decide = useCallback(async (ids: string[], decision: "verified" | "rejected") => {
    try {
      await Promise.all(ids.map((id) => maestroService.verifyBusiness(id, decision)));
      const verb = decision === "verified" ? "approved" : "rejected";
      toast.success(`${ids.length} ${ids.length > 1 ? "businesses" : "business"} ${verb}.`);
      setQueue((prev) => prev.filter((b) => !ids.includes(b.uid)));
      setVersion((v) => v + 1);
    } catch (err) {
      console.error("Verification decision failed", err);
      toast.error("Action failed. Please retry.");
    }
  }, []);

  const columns: Column<Business>[] = [
    {
      key: "name",
      header: "Business",
      sortable: true,
      accessor: (b) => b.name || b.businessName || "Unnamed business",
      render: (b) => (
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/5 text-primary/60">
            <Building2 className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold text-foreground">{b.name || b.businessName || "Unnamed business"}</p>
            <p className="truncate text-caption text-muted-foreground">{b.locationName || b.city || "—"}</p>
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", sortable: true, accessor: (b) => b.category ?? "—" },
    {
      key: "status",
      header: "Status",
      align: "center",
      accessor: () => "pending",
      render: () => <Badge className="border-0 bg-warning/10 text-warning">PENDING</Badge>,
    },
    {
      key: "actions",
      header: "Decision",
      align: "right",
      render: (b) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            onClick={() => decide([b.uid], "rejected")}
            className="h-9 rounded-input border-error/30 text-error hover:bg-error/5"
          >
            <XCircle className="mr-1 h-4 w-4" /> Reject
          </Button>
          <Button onClick={() => decide([b.uid], "verified")} className="h-9 rounded-input bg-primary text-white">
            <CheckCircle2 className="mr-1 h-4 w-4" /> Approve
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-card bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-h2 text-foreground">Business Verification</h1>
          <p className="text-small text-muted-foreground">Approve or reject pending business profiles.</p>
        </div>
      </div>

      <DataTable
        key={version}
        data={queue}
        columns={columns}
        getRowId={(b) => b.uid}
        loading={loading}
        error={error}
        onRetry={load}
        searchPlaceholder="Search businesses…"
        pageSize={10}
        selectable
        bulkActions={[
          { label: "Approve", icon: CheckCircle2, onClick: (ids) => decide(ids, "verified") },
          { label: "Reject", icon: XCircle, tone: "danger", onClick: (ids) => decide(ids, "rejected") },
        ]}
        exportFileName="pending-businesses"
        emptyState={{
          icon: ShieldCheck,
          title: "All caught up",
          description: "No businesses are awaiting verification right now.",
        }}
      />
    </div>
  );
}
