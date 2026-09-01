"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Send } from "lucide-react"

import {
    ApplicationGrid,
    SORTS,
    sortRows,
    type SortKey,
} from "@/components/applications/application-card"
import type { ApplicationRow } from "@/lib/applications"

/**
 * What a scout is holding. Nothing reaches the agency until it is sent, so this
 * is the one screen where a scout decides what their name goes on.
 */
export function ScoutQueue({ waiting }: { waiting: ApplicationRow[] }) {
    const router = useRouter()
    const [sort, setSort] = useState<SortKey>("applied")
    const [picked, setPicked] = useState<string[]>([])
    const [sent, setSent] = useState(0)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")

    const rows = useMemo(() => sortRows(waiting, sort), [waiting, sort])

    function toggle(id: string) {
        setSent(0)
        setPicked((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )
    }

    async function send() {
        setError("")
        setBusy(true)

        try {
            const response = await fetch("/api/scout/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: picked }),
            })

            if (!response.ok) {
                const body = await response.json().catch(() => ({}))
                setError(body.error ?? "Couldn't send those on.")
                setBusy(false)
                return
            }

            setSent(picked.length)
            setPicked([])
            setBusy(false)
            router.refresh()
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    return (
        <div className="mt-8 border-t border-border pt-6">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Waiting on you
            </p>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted-foreground">
                Nothing goes to the agency until you send it. Look first —
                everything you pass on counts towards your kept rate.
            </p>

            {waiting.length === 0 ? (
                <p className="mt-5 text-xs text-muted-foreground">
                    Nothing waiting. Applications through your link land here
                    first.
                </p>
            ) : (
                <>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                        <p className="text-xs text-muted-foreground">
                            {picked.length > 0
                                ? `${picked.length} selected`
                                : `${rows.length} waiting`}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                Sort
                            </span>
                            {SORTS.map((s) => (
                                <button
                                    key={s.key}
                                    type="button"
                                    onClick={() => setSort(s.key)}
                                    aria-pressed={sort === s.key}
                                    className={`border px-2 py-1 text-xs transition-colors ${
                                        sort === s.key
                                            ? "border-foreground bg-foreground text-background"
                                            : "border-border text-muted-foreground hover:border-foreground/30"
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ApplicationGrid
                        rows={rows}
                        selected={picked}
                        onToggle={toggle}
                        hrefFor={(id) => `/scout/applications/${id}`}
                    />

                    <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                        <button
                            type="button"
                            disabled={picked.length === 0 || busy}
                            onClick={send}
                            className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                        >
                            <Send className="h-3 w-3" />
                            {busy
                                ? "Sending…"
                                : `Send ${picked.length || ""} to the agency`}
                        </button>
                        {error ? (
                            <p className="text-xs text-red-400">{error}</p>
                        ) : (
                            sent > 0 && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-xs text-foreground"
                                >
                                    {sent} sent · now in their Applied column
                                </motion.p>
                            )
                        )}
                    </div>
                </>
            )}
        </div>
    )
}

/**
 * Applied, then sent on. The demo also counts link opens; that needs view
 * tracking we do not do, and a made-up number would be worse than one fewer
 * bar.
 */
export function ScoutFunnel({
    applied,
    sent,
}: {
    applied: number
    sent: number
}) {
    const steps = [
        { label: "Applied", value: applied },
        { label: "Sent on", value: sent },
    ]

    return (
        <div className="mt-8 space-y-4">
            {steps.map((step, i) => {
                const previous = steps[i - 1]
                return (
                    <div key={step.label}>
                        <div className="flex items-baseline justify-between gap-4">
                            <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                {step.label}
                            </span>
                            <span className="text-xs text-foreground">
                                {step.value.toLocaleString("en-GB")}
                                {previous && previous.value > 0 && (
                                    <span className="ml-2 text-muted-foreground">
                                        {Math.round(
                                            (step.value / previous.value) * 100,
                                        )}
                                        % of {previous.label.toLowerCase()}
                                    </span>
                                )}
                            </span>
                        </div>
                        <span className="mt-1.5 block h-1.5 w-full bg-black/[0.06]">
                            <span
                                className="block h-full bg-foreground"
                                style={{
                                    width: `${
                                        steps[0].value > 0
                                            ? (step.value / steps[0].value) * 100
                                            : 0
                                    }%`,
                                }}
                            />
                        </span>
                    </div>
                )
            })}
        </div>
    )
}
