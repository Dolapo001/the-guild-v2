"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)
    const [isOpen, setIsOpen] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="h-10 w-10 rounded-full border border-glass-border bg-glass-surface/50 opacity-50" />
        )
    }

    const themes = [
        { id: "light", icon: Sun, label: "Light" },
        { id: "dark", icon: Moon, label: "Dark" },
        { id: "system", icon: Monitor, label: "System" },
    ]

    const activeTheme = themes.find(t => t.id === theme) || themes[2]

    return (
        <motion.div
            layout
            className={cn(
                "relative flex items-center p-1 rounded-full border border-glass-border bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl shadow-sm overflow-hidden",
                isOpen ? "gap-1" : ""
            )}
            initial={false}
            animate={{
                width: isOpen ? "auto" : 42,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            onMouseLeave={() => setIsOpen(false)}
        >
            <AnimatePresence mode="popLayout" initial={false}>
                {isOpen ? (
                    themes.map((t) => (
                        <motion.button
                            layout
                            key={t.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => {
                                setTheme(t.id)
                                setIsOpen(false)
                            }}
                            className={cn(
                                "relative flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                                theme === t.id
                                    ? "bg-primary text-white shadow-md"
                                    : "text-foreground/60 hover:bg-black/5 dark:hover:bg-white/10"
                            )}
                            title={t.label}
                        >
                            <t.icon className="h-4 w-4" />
                        </motion.button>
                    ))
                ) : (
                    <motion.button
                        layout
                        key="active-toggle"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setIsOpen(true)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-foreground/80 hover:text-primary transition-colors"
                    >
                        <activeTheme.icon className="h-5 w-5" />
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
