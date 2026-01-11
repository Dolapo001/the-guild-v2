import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "hover" | "active";
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    ({ className, variant = "default", children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "rounded-2xl border border-glass-border bg-glass-surface backdrop-blur-md shadow-premium transition-all duration-300",
                    variant === "hover" && "hover:-translate-y-1 hover:shadow-xl hover:bg-glass-highlight",
                    variant === "active" && "active:scale-[0.98]",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
