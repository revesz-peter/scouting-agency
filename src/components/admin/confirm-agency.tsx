"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

/**
 * Confirming is what puts an agency's public links live. Suspending takes them
 * down again without touching anything the agency has already collected.
 */
export function ConfirmAgency({
    organizationId,
    agency,
    status,
}: {
    organizationId: string
    agency: string
    status: string
}) {
    const router = useRouter()
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)

    async function set(next: "active" | "pending" | "suspended") {
        setError("")
        setBusy(true)

        try {
            const response = await fetch("/api/admin/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ organizationId, status: next }),
            })

            if (!response.ok) {
                const body = await response.json().catch(() => ({}))
                setError(body.error ?? "Couldn't update that agency.")
                setBusy(false)
                return
            }

            router.refresh()
            setBusy(false)
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    return (
        <>
            <div className="mt-3 flex flex-wrap items-center gap-4">
                <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    {status === "active"
                        ? "Live"
                        : status === "suspended"
                          ? "Suspended"
                          : "Not live"}
                </span>

                {status !== "active" && (
                    <button
                        onClick={() => set("active")}
                        disabled={busy}
                        className="bg-foreground px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                    >
                        {busy ? "Working…" : `Confirm ${agency}`}
                    </button>
                )}

                {status === "active" && (
                    <button
                        onClick={() => set("suspended")}
                        disabled={busy}
                        className="text-xs uppercase tracking-[0.1em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-40"
                    >
                        Take the links down
                    </button>
                )}

                {status === "suspended" && (
                    <button
                        onClick={() => set("pending")}
                        disabled={busy}
                        className="text-xs uppercase tracking-[0.1em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-40"
                    >
                        Back to waiting
                    </button>
                )}
            </div>

            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </>
    )
}
