"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Application {
    id: string
    name: string
    email: string
    city: string | null
    country: string | null
    message: string | null
}

/**
 * Accepting sends an invitation rather than adding a member directly, so every
 * scout on the roster arrived the same way and the trail is the same.
 */
export function ScoutApplications({
    applications,
    organizationId,
}: {
    applications: Application[]
    organizationId: string
}) {
    const router = useRouter()
    const [busy, setBusy] = useState("")
    const [error, setError] = useState("")

    async function accept(application: Application) {
        setError("")
        setBusy(application.id)

        try {
            const response = await fetch("/api/agency/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: application.email,
                    organizationId,
                    applicationId: application.id,
                }),
            })

            setBusy("")

            if (!response.ok) {
                const body = await response.json().catch(() => ({}))
                setError(body.error ?? "Couldn't send that invitation.")
                return
            }

            router.refresh()
        } catch {
            setBusy("")
            setError("Couldn't reach the server. Check your connection.")
        }
    }

    async function reject(application: Application) {
        setError("")
        setBusy(application.id)

        try {
            const response = await fetch("/api/agency/scout-application", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: application.id, organizationId }),
            })

            setBusy("")

            if (!response.ok) {
                setError("Couldn't update that application.")
                return
            }

            router.refresh()
        } catch {
            setBusy("")
            setError("Couldn't reach the server. Check your connection.")
        }
    }

    if (applications.length === 0) {
        return (
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Nothing waiting. Applications through your open link show up here.
            </p>
        )
    }

    return (
        <>
            <ul className="mt-4 space-y-5">
                {applications.map((a) => {
                    const where = [a.city, a.country].filter(Boolean).join(", ")
                    return (
                        <li key={a.id} className="border-b border-border pb-5 last:border-0">
                            <p className="text-sm text-foreground">{a.name}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                {a.email}
                                {where && ` · ${where}`}
                            </p>
                            {a.message && (
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                    {a.message}
                                </p>
                            )}
                            <div className="mt-3 flex gap-4">
                                <button
                                    onClick={() => accept(a)}
                                    disabled={busy === a.id}
                                    className="text-xs uppercase tracking-[0.1em] text-foreground underline underline-offset-4 disabled:opacity-40"
                                >
                                    {busy === a.id ? "Working…" : "Invite"}
                                </button>
                                <button
                                    onClick={() => reject(a)}
                                    disabled={busy === a.id}
                                    className="text-xs uppercase tracking-[0.1em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-40"
                                >
                                    Pass
                                </button>
                            </div>
                        </li>
                    )
                })}
            </ul>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
        </>
    )
}
