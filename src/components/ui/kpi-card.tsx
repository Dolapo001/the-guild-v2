"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";

type Trend = "up" | "down" | "neutral";

/** Compact trend sparkline. `up`/`down` only tints it — the shape is illustrative. */
function Sparkline({ values, trend }: { values: number[]; trend: Trend }) {
  const w = 96;
  const h = 32;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / span) * h;
    return [x, y] as const;
  });
  const line = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;
  const stroke = trend === "down" ? "var(--color-error)" : trend === "up" ? "var(--color-success)" : "var(--color-muted-foreground)";
  const gid = `spark-${trend}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline points={line} fill="none" stroke={stroke} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const ILLUSTRATIVE: Record<Trend, number[]> = {
  up: [3, 4, 3.5, 5, 4.5, 6, 7.5],
  down: [7.5, 6, 6.5, 5, 5.5, 4, 3],
  neutral: [5, 5.2, 4.8, 5.1, 4.9, 5, 5.05],
};

/**
 * Insight-driven KPI card: value + trend delta + sparkline, with an
 * interactive hover lift. Built on the design-system tokens.
 */
export function KpiCard({
  label,
  value,
  delta,
  trend = "neutral",
  icon: Icon,
  iconClassName = "bg-primary/10 text-primary",
  spark,
  delay = 0,
}: {
  label: string;
  value: string | number;
  delta?: string;
  trend?: Trend;
  icon: LucideIcon;
  iconClassName?: string;
  /** Real series for the sparkline; falls back to an illustrative trend shape. */
  spark?: number[];
  delay?: number;
}) {
  const series = spark && spark.length > 1 ? spark : ILLUSTRATIVE[trend];
  const deltaTone =
    trend === "up" ? "bg-success/10 text-success" : trend === "down" ? "bg-error/10 text-error" : "bg-muted text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -3 }}
      className="group rounded-card border border-border bg-card p-5 shadow-e1 transition-shadow hover:shadow-e2"
    >
      <div className="flex items-start justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-xl transition-transform group-hover:scale-110 ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </span>
        {delta && (
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-caption font-bold ${deltaTone}`}>
            {trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : trend === "down" ? <ArrowDownRight className="h-3 w-3" /> : null}
            {delta}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-caption uppercase text-muted-foreground">{label}</p>
          <p className="mt-1 text-h2 text-foreground">{value}</p>
        </div>
        <div className="shrink-0 opacity-80">
          <Sparkline values={series} trend={trend} />
        </div>
      </div>
    </motion.div>
  );
}
