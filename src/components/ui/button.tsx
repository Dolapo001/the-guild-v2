import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
 extends React.ButtonHTMLAttributes<HTMLButtonElement> {
 asChild?: boolean;
 variant?: "default" | "outline" | "ghost" | "glass" | "secondary" | "destructive" | "success" | "warning" | "info";
 size?: "default" | "sm" | "lg" | "xl" | "icon";
}

const variantClasses: Record<string, string> = {
 default: "bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/20 rounded-lg",
 secondary: "bg-[#161922] border border-white/10 text-slate-200 hover:bg-[#1e2330] rounded-lg",
 outline: "border border-white/10 bg-transparent text-slate-200 hover:bg-white/5 rounded-lg",
 ghost: "bg-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200 rounded-lg",
 glass: "bg-[#161922] border border-white/10 text-slate-200 hover:bg-[#1e2330] rounded-lg",
 destructive: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg",
 success: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-lg",
 warning: "bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 rounded-lg",
 info: "bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-lg",
};

const sizeClasses: Record<string, string> = {
 default: "h-10 px-4 py-2",
 sm: "h-9 rounded-md px-3",
 lg: "h-11 rounded-md px-8",
 xl: "h-14 rounded-xl px-9 text-base",
 icon: "h-10 w-10",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
 ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : "button";
 return (
 <Comp
 ref={ref}
 className={cn(
 "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-[transform,background-color,color,box-shadow] duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100",
 variantClasses[variant] || variantClasses.default,
 sizeClasses[size] || sizeClasses.default,
 className
 )}
 {...props}
 />
 );
 }
);
Button.displayName = "Button";

export { Button };