"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Field, fieldClass } from "@/components/form-field"

/**
 * Invites go out as `member` — a scout who can send applications in but cannot
 * see the dashboard or vote. Promoting them to admin is a separate, deliberate
 * act.
 */
export function InviteScout({ organizationId }: { organizationId: string }) {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [error, setError] = useState("")
    const [sent, setSent] = useState("")
    const [busy, setBusy] = useState(false)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setSent("")
        setBusy(true)

        let body: { error?: string; sent?: boolean } = {}
        let ok = false
        try {
            const response = await fetch("/api/agency/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, organizationId }),
            })
            body = await response.json().catch(() => ({}))
            ok = response.ok
        } catch {
            body = { error: "Couldn't reach the server. Check your connection." }
        }

        setBusy(false)

        if (!ok) {
            setError(body.error ?? "Couldn't send that invitation.")
            return
        }

        // The invitation always exists; the email is the part that can fail.
        setSent(
            body.sent
                ? `Invitation sent to ${email}.`
                : `Invitation created for ${email}, but the email didn't go out. Check email settings.`,
        )
        setEmail("")
        router.refresh()
    }

    return (
        <>
            <form onSubmit={onSubmit} className="mt-4 flex items-end gap-3" noValidate>
                <div className="flex-1">
                    <Field label="Email">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={fieldClass()}
                        />
                    </Field>
                </div>
                <button
                    type="submit"
                    disabled={busy || !email}
                    className="bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                >
                    {busy ? "Sending…" : "Invite"}
                </button>
            </form>

            {error && <p className="mt-3 text-xs text-red-400">{error}</p>}
            {sent && <p className="mt-3 text-xs text-muted-foreground">{sent}</p>}
        </>
    )
}
