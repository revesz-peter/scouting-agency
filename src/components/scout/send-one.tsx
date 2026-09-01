"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Send } from "lucide-react"

/** Sending one person on, from their own page. */
export function SendOne({ id }: { id: string }) {
    const router = useRouter()
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")

    async function send() {
        setError("")
        setBusy(true)

        try {
            const response = await fetch("/api/scout/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: [id] }),
            })

            if (!response.ok) {
                const body = await response.json().catch(() => ({}))
                setError(body.error ?? "Couldn't send them on.")
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
            <button
                type="button"
                onClick={send}
                disabled={busy}
                className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
            >
                <Send className="h-3 w-3" />
                {busy ? "Sending…" : "Send to the agency"}
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
        </>
    )
}
