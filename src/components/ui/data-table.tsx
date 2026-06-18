"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  Check,
  ChevronLeft,
  ChevronRight,
  Inbox,
  AlertTriangle,
  X,
  type LucideIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export type Column<T> = {
  key: string;
  header: string;
  /** Raw value used for search, sort and CSV export. */
  accessor?: (row: T) => string | number | null | undefined;
  /** Rich cell renderer (falls back to the accessor value). */
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
  hideOnMobile?: boolean;
};

export type BulkAction = {
  label: string;
  icon?: LucideIcon;
  onClick: (ids: string[]) => void;
  tone?: "default" | "danger";
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  selectable?: boolean;
  bulkActions?: BulkAction[];
  exportFileName?: string;
  emptyState?: { icon: LucideIcon; title: string; description?: string; action?: { label: string; href?: string; onClick?: () => void } };
  onRowClick?: (row: T) => void;
};

function rawValue<T>(col: Column<T>, row: T): string | number | null | undefined {
  if (col.accessor) return col.accessor(row);
  const v = (row as Record<string, unknown>)[col.key];
  return v == null ? v : (v as string | number);
}

function compare(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true });
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  loading = false,
  error = null,
  onRetry,
  searchable = true,
  searchPlaceholder = "Search…",
  pageSize = 10,
  selectable = false,
  bulkActions = [],
  exportFileName,
  emptyState,
  onRowClick,
}: Props<T>) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // search
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) =>
      columns.some((c) => {
        const v = rawValue(c, row);
        return v != null && String(v).toLowerCase().includes(q);
      }),
    );
  }, [data, columns, query]);

  // sort
  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const out = [...filtered].sort((a, b) => compare(rawValue(col, a), rawValue(col, b)));
    return sort.dir === "desc" ? out.reverse() : out;
  }, [filtered, sort, columns]);

  // pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, totalPages);
  const pageRows = sorted.slice((current - 1) * pageSize, current * pageSize);

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : null));

  const pageIds = pageRows.map(getRowId);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allOnPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exportCsv = () => {
    const head = columns.map((c) => `"${c.header.replace(/"/g, '""')}"`).join(",");
    const rowsForExport = selected.size ? sorted.filter((r) => selected.has(getRowId(r))) : sorted;
    const body = rowsForExport
      .map((row) => columns.map((c) => `"${String(rawValue(c, row) ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`${head}\n${body}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${exportFileName || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const colCount = columns.length + (selectable ? 1 : 0);

  return (
    <div className="overflow-hidden rounded-panel border border-border bg-card shadow-e1">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border p-3">
        {searchable && (
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder={searchPlaceholder}
              className="h-10 rounded-input border-border bg-surface-2 pl-9 text-small"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          {!loading && !error && (
            <span className="text-caption uppercase text-muted-foreground">{sorted.length} records</span>
          )}
          {exportFileName && !loading && !error && sorted.length > 0 && (
            <Button variant="outline" onClick={exportCsv} className="h-10 gap-2 rounded-input border-border text-small">
              <Download className="h-4 w-4" /> Export
            </Button>
          )}
        </div>
      </div>

      {/* bulk action bar */}
      <AnimatePresence>
        {selectable && selected.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center justify-between gap-3 border-b border-border bg-primary/5 px-4 py-2.5"
          >
            <span className="flex items-center gap-2 text-small font-bold text-primary">
              <button onClick={() => setSelected(new Set())} aria-label="Clear selection" className="grid h-5 w-5 place-items-center rounded-md hover:bg-primary/10">
                <X className="h-3.5 w-3.5" />
              </button>
              {selected.size} selected
            </span>
            <div className="flex items-center gap-2">
              {bulkActions.map((a) => (
                <Button
                  key={a.label}
                  variant={a.tone === "danger" ? "destructive" : "outline"}
                  onClick={() => a.onClick([...selected])}
                  className="h-9 gap-2 rounded-input text-small"
                >
                  {a.icon && <a.icon className="h-4 w-4" />} {a.label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- states ---- */}
      {error ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-error/10 text-error">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <p className="text-body font-bold text-foreground">Something went wrong</p>
          <p className="max-w-sm text-small text-muted-foreground">{error}</p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry} className="mt-2 rounded-input">
              Try again
            </Button>
          )}
        </div>
      ) : loading ? (
        <TableSkeleton rows={pageSize} cols={colCount} />
      ) : sorted.length === 0 ? (
        query ? (
          <EmptyState icon={Search} title={`No results for “${query}”`} description="Try a different search term." />
        ) : (
          <EmptyState
            icon={emptyState?.icon ?? Inbox}
            title={emptyState?.title ?? "Nothing here yet"}
            description={emptyState?.description}
            action={emptyState?.action}
          />
        )
      ) : (
        <>
          {/* desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {selectable && (
                    <th className="w-12 px-4 py-3">
                      <Checkbox checked={allOnPageSelected} onChange={toggleAll} ariaLabel="Select all on page" />
                    </th>
                  )}
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className={`px-4 py-3 text-caption uppercase text-muted-foreground ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"}`}
                    >
                      {c.sortable ? (
                        <button onClick={() => toggleSort(c.key)} className="inline-flex items-center gap-1.5 hover:text-foreground">
                          {c.header}
                          {sort?.key === c.key ? (
                            sort.dir === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        c.header
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.map((row) => {
                  const id = getRowId(row);
                  const isSel = selected.has(id);
                  return (
                    <tr
                      key={id}
                      onClick={() => onRowClick?.(row)}
                      className={`border-b border-border/60 transition-colors last:border-0 ${onRowClick ? "cursor-pointer" : ""} ${isSel ? "bg-primary/[0.04]" : "hover:bg-muted/50"}`}
                    >
                      {selectable && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox checked={isSel} onChange={() => toggleRow(id)} ariaLabel="Select row" />
                        </td>
                      )}
                      {columns.map((c) => (
                        <td
                          key={c.key}
                          className={`px-4 py-3 text-small text-foreground ${c.align === "right" ? "text-right" : c.align === "center" ? "text-center" : "text-left"} ${c.className ?? ""}`}
                        >
                          {c.render ? c.render(row) : String(rawValue(c, row) ?? "—")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* mobile cards */}
          <div className="divide-y divide-border md:hidden">
            {pageRows.map((row) => {
              const id = getRowId(row);
              return (
                <div key={id} onClick={() => onRowClick?.(row)} className="space-y-1.5 p-4">
                  {columns.filter((c) => !c.hideOnMobile).map((c) => (
                    <div key={c.key} className="flex items-center justify-between gap-3">
                      <span className="text-caption uppercase text-muted-foreground">{c.header}</span>
                      <span className="text-small font-medium text-foreground">{c.render ? c.render(row) : String(rawValue(c, row) ?? "—")}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-border px-4 py-3">
              <span className="text-small text-muted-foreground">
                {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, sorted.length)} of {sorted.length}
              </span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" disabled={current <= 1} onClick={() => setPage(current - 1)} className="h-9 w-9 rounded-input border-border">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-small font-bold text-foreground">{current} / {totalPages}</span>
                <Button variant="outline" size="icon" disabled={current >= totalPages} onClick={() => setPage(current + 1)} className="h-9 w-9 rounded-input border-border">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Checkbox({ checked, onChange, ariaLabel }: { checked: boolean; onChange: () => void; ariaLabel: string }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={onChange}
      className={`grid h-5 w-5 place-items-center rounded-md border transition-colors ${checked ? "border-primary bg-primary text-white" : "border-border bg-surface hover:border-primary/50"}`}
    >
      {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
    </button>
  );
}

function TableSkeleton({ rows, cols }: { rows: number; cols: number }) {
  return (
    <div className="p-4">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-4" style={{ animationDelay: `${r * 50}ms` }}>
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className={`h-6 animate-pulse rounded-md bg-muted ${c === 0 ? "w-8" : "flex-1"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
