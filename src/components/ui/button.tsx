import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean;
    variant?: "default" | "outline" | "ghost" | "glass" | "secondary" | "destructive";
    size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--ring] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-primary text-white hover:bg-primary/90 shadow-sm": variant === "default",
                        "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm": variant === "secondary",
                        "border border-[--border] bg-background hover:bg-muted hover:text-foreground": variant === "outline",
                        "hover:bg-muted hover:text-foreground": variant === "ghost",
                        "bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-foreground shadow-sm": variant === "glass",
                        "bg-red-500 text-white hover:bg-red-600 shadow-sm": variant === "destructive",
                        "h-10 px-4 py-2": size === "default",
                        "h-9 rounded-lg px-3 text-xs": size === "sm",
                        "h-11 rounded-xl px-8": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
