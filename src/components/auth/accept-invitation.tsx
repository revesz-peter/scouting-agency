"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { authClient } from "@/lib/auth/client"

/**
 * Accepting is what creates the membership — there is no other path into an
 * agency, so every scout on the roster arrived through an invitation someone
 * can point to.
 */
export function AcceptInvitation({
    id,
    mismatch,
}: {
    id: string
    mismatch: string | null
}) {
    const router = useRouter()
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)

    async function accept() {
        setError("")
        setBusy(true)

        try {
            const { error } = await authClient.organization.acceptInvitation({
                invitationId: id,
            })

            if (error) {
                setError(error.message ?? "Couldn't accept this invitation.")
                setBusy(false)
                return
            }

            router.push("/auth/continue")
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    async function switchAccount() {
        setBusy(true)
        try {
            await authClient.signOut()
            // Back to this same invitation, now signed out, where the page
            // offers creating the invited account.
            router.refresh()
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    if (mismatch) {
        return (
            <>
                <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
                    This invitation is for a different address, and you are
                    signed in as{" "}
                    <span className="text-foreground">{mismatch}</span>.
                </p>
                <button
                    onClick={switchAccount}
                    disabled={busy}
                    className="mt-4 w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                >
                    {busy ? "Signing out…" : "Sign out and use the invited address"}
                </button>
            </>
        )
    }

    return (
        <>
            <button
                onClick={accept}
                disabled={busy}
                className="mt-8 w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
            >
                {busy ? "Accepting…" : "Accept invitation"}
            </button>
            {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
        </>
    )
}
