"use client"

import { AnimatePresence, motion } from "framer-motion"

// ─── Field wrapper ────────────────────────────────────────

export function Field({
    label,
    required,
    error,
    children,
}: {
    label: string
    required?: boolean
    error?: string
    children: React.ReactNode
}) {
    return (
        <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {label}
                {required && (
                    <span className="ml-0.5 text-foreground/30">*</span>
                )}
            </label>
            {children}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className="mt-0.5 text-xs text-red-400"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    )
}

// ─── Shared input class ───────────────────────────────────

export function fieldClass(error?: { message?: string }) {
    return `w-full border-b bg-transparent py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground/50 ${
        error
            ? "border-red-400/50 focus:border-red-400"
            : "border-border focus:border-foreground/30"
    }`
}
