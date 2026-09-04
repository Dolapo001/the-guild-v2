import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
 HTMLTextAreaElement,
 React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
 return (
 <textarea
 className={cn(
 "flex min-h-[80px] w-full rounded-lg border border-white/10 bg-[#161922] px-3 py-2 text-base text-slate-100 ring-offset-background placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
 className
 )}
 ref={ref}
 {...props}
 />
 )
})
textarea.displayName = "Textarea"

export { Textarea }