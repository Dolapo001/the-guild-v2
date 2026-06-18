"use client";

import { useCallback, useEffect, useState } from "react";
import { ScrollText } from "lucide-react";
import { auditService, AuditLog } from "@/services/audit.service";
import { DataTable, type Column } from "@/components/ui/data-table";

const columns: Column<AuditLog>[] = [
  {
    key: "action",
    header: "Action",
    sortable: true,
    accessor: (l) => l.action,
    render: (l) => (
      <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-caption font-bold text-primary">
        {l.action}
      </span>
    ),
  },
  {
    key: "actor",
    header: "Actor",
    sortable: true,
    accessor: (l) => l.actorName || l.actor || "system",
    render: (l) => <span className="font-semibold">{l.actorName || l.actor || "system"}</span>,
  },
  {
    key: "metadata",
    header: "Details",
    hideOnMobile: true,
    accessor: (l) => (l.metadata && Object.keys(l.metadata).length ? JSON.stringify(l.metadata) : ""),
    render: (l) =>
      l.metadata && Object.keys(l.metadata).length ? (
        <code className="text-caption text-muted-foreground">{JSON.stringify(l.metadata)}</code>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
  },
  {
    key: "createdAt",
    header: "When",
    sortable: true,
    align: "right",
    accessor: (l) => l.createdAt,
    render: (l) => (
      <span className="whitespace-nowrap text-muted-foreground">
        {l.createdAt ? new Date(l.createdAt).toLocaleString() : "—"}
      </span>
    ),
  },
];

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLogs(await auditService.getLogs());
    } catch (err) {
      console.error("Failed to load audit logs", err);
      setError("We couldn't load the audit trail. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-card bg-primary/10">
          <ScrollText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-h2 text-foreground">Audit Trail</h1>
          <p className="text-small text-muted-foreground">Security &amp; activity events across the platform.</p>
        </div>
      </div>

      <DataTable
        data={logs}
        columns={columns}
        getRowId={(l) => l.uid}
        loading={loading}
        error={error}
        onRetry={load}
        searchPlaceholder="Search actions, actors…"
        pageSize={12}
        exportFileName="guild-audit-log"
        emptyState={{ icon: ScrollText, title: "No audit events yet", description: "Security and activity events will appear here as they happen." }}
      />
    </div>
  );
}
