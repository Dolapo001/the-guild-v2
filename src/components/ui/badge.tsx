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
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-caption font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80": variant === "default",
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "border-border text-foreground": variant === "outline",
          // state tones — design-system tokens, light + dark aware
          "border-error/20 bg-error/10 text-error": variant === "destructive" || variant === "error",
          "border-success/20 bg-success/10 text-success": variant === "success",
          "border-warning/20 bg-warning/10 text-warning": variant === "warning",
          "border-info/20 bg-info/10 text-info": variant === "info",
          "border-border bg-muted text-muted-foreground": variant === "neutral",
        },
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
