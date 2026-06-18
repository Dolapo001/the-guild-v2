"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Reusable empty state — illustration + context + guidance + a primary action.
 * Never leave the user at a dead end.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; onClick?: () => void; href?: string };
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center px-6 py-16 text-center ${className ?? ""}`}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-xl" aria-hidden />
        <div className="relative grid h-16 w-16 place-items-center rounded-3xl border border-border bg-surface text-primary shadow-e2">
          <Icon className="h-7 w-7" />
        </div>
      </div>
      <h3 className="text-h4 text-foreground">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-small text-muted-foreground">{description}</p>}
      {action &&
        (action.href ? (
          <Button asChild className="mt-6 rounded-input">
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button onClick={action.onClick} className="mt-6 rounded-input">
            {action.label}
          </Button>
        ))}
    </motion.div>
  );
}
