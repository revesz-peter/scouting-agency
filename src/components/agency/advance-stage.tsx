"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Download, Send } from "lucide-react"

/**
 * Moving one person to the next stage. The button names the stage rather than
 * saying "advance", because the stage is the thing that matters.
 */
export function AdvanceStage({
    id,
    organizationId,
    next,
    nextLabel,
}: {
    id: string
    organizationId: string
    next: string | null
    nextLabel: string | null
}) {
    const router = useRouter()
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")

    async function move() {
        if (!next) return
        setError("")
        setBusy(true)

        try {
            const response = await fetch("/api/agency/stage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ organizationId, ids: [id], stage: next }),
            })

            if (!response.ok) {
                const body = await response.json().catch(() => ({}))
                setError(body.error ?? "Couldn't move them.")
                setBusy(false)
                return
            }

            setBusy(false)
            router.refresh()
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    return (
        <>
            {next && (
                <button
                    type="button"
                    onClick={move}
                    disabled={busy}
                    className="bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                >
                    {busy ? "Moving…" : `Move to ${nextLabel}`}
                </button>
            )}
            <button
                type="button"
                disabled
                title="Exporting is not built yet"
                className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground disabled:opacity-40"
            >
                <Download className="h-3 w-3" />
                Export as PDF
            </button>
            <button
                type="button"
                disabled
                title="Submitting to clients is not built yet"
                className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground disabled:opacity-40"
            >
                <Send className="h-3 w-3" />
                Submit to client
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </>
    )
}
