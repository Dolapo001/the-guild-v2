import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
 variant?:
 | "default"
 | "secondary"
 | "outline"
 | "destructive"
 | "error"
 | "success"
 | "warning"
 | "info"
 | "neutral";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
 const variantClasses: Record<string, string> = {
 default: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
 secondary: "bg-amber-500/10 text-amber-400 border-amber-500/20",
 outline: "border-white/10 text-slate-300 bg-transparent",
 destructive: "bg-red-500/10 text-red-400 border-red-500/20",
 error: "bg-red-500/10 text-red-400 border-red-500/20",
 success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
 warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
 info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
 neutral: "border-white/10 bg-[#161922] text-slate-400",
 };

 return (
 <div
 className={cn(
 "inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
 variantClasses[variant] || variantClasses.default,
 className,
 )}
 {...props}
 />
 );
}

export { Badge };