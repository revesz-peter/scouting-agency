"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { CopyButton } from "@/components/copy-button"
import { Field, fieldClass } from "@/components/form-field"
import { authClient } from "@/lib/auth/client"
import { siteLink, siteUrl } from "@/lib/site"

/**
 * The founder creates their own agency, which is what makes them its owner —
 * Better Auth assigns `owner` to whoever calls create. A verified registration
 * is the gate; this form is only reachable with one.
 */
export function CreateAgencyForm({
    name,
    slug,
}: {
    name: string
    slug: string
}) {
    const router = useRouter()
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setBusy(true)

        try {
            const { error } = await authClient.organization.create({ name, slug })

            if (error) {
                setError(error.message ?? "Couldn't create the agency.")
                setBusy(false)
                return
            }

            // Fill in the details Better Auth has no column for, then land on
            // the dashboard.
            const response = await fetch("/api/agency/provision", {
                method: "POST",
            })
            if (!response.ok) {
                setError("The agency exists, but its details didn't save.")
                setBusy(false)
                return
            }

            router.push(`/agency/${slug}`)
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="mt-10 space-y-4" noValidate>
            <Field label="Agency">
                <input readOnly value={name} className={fieldClass()} />
            </Field>
            <Field label="Apply link">
                <div className="flex items-center gap-2">
                    <input
                        readOnly
                        value={siteLink(`/apply/${slug}`)}
                        className={`${fieldClass()} flex-1`}
                    />
                    {/* Copies the full URL, scheme included — what is shown
                        omits it, but a pasted link needs it. */}
                    <CopyButton
                        value={siteUrl(`/apply/${slug}`)}
                        label="Copy apply link"
                    />
                </div>
            </Field>

            <button
                type="submit"
                disabled={busy}
                className="w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
            >
                {busy ? "Creating…" : "Create the agency"}
            </button>

            {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
    )
}
