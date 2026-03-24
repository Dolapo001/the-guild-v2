import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[--ring] focus:ring-offset-2",
                {
                    "border-transparent bg-primary text-white hover:bg-primary/80": variant === "default",
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
                    "border-transparent bg-red-500 text-white hover:bg-red-600": variant === "destructive",
                    "border-[--border] text-foreground": variant === "outline",
                    "border-green-200 bg-green-500/10 text-green-700 dark:text-green-400 dark:border-green-500/30 hover:bg-green-500/20": variant === "success",
                    "border-yellow-200 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:border-yellow-500/30 hover:bg-yellow-500/20": variant === "warning",
                },
                className
            )}
            {...props}
        />
    );
}

export { Badge };
