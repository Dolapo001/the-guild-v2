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
 "rounded-xl border border-white/7 bg-[#0f1117] shadow-e2 transition-all duration-300",
 variant === "hover" && "hover:-translate-y-1 hover:shadow-e3 hover:border-white/12",
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