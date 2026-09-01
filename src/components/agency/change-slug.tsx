"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Field, fieldClass } from "@/components/form-field"
import { siteLink } from "@/lib/site"

/**
 * Changing the link is destructive in a quiet way: nothing breaks here, it
 * breaks out in the world, on cards already printed and bios already written.
 * So the warning names what stops working, and the button says so too.
 */
export function ChangeSlug({
    organizationId,
    slug,
}: {
    organizationId: string
    slug: string
}) {
    const router = useRouter()
    const [next, setNext] = useState(slug)
    const [confirming, setConfirming] = useState(false)
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)

    const changed = next.trim().toLowerCase() !== slug

    async function save() {
        setError("")
        setBusy(true)

        try {
            const response = await fetch("/api/agency/slug", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ organizationId, slug: next }),
            })
            const body = await response.json().catch(() => ({}))

            if (!response.ok) {
                setError(body.error ?? "Couldn't change the link.")
                setBusy(false)
                return
            }

            // The whole agency lives under the slug, so land on the new one.
            router.push(`/agency/${body.slug}/settings`)
            router.refresh()
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    return (
        <div className="mt-4">
            <Field label="Link">
                <input
                    value={next}
                    onChange={(e) => {
                        setNext(e.target.value)
                        setConfirming(false)
                    }}
                    autoCapitalize="none"
                    className={fieldClass()}
                />
            </Field>

            <dl className="mt-4 space-y-1 text-xs text-muted-foreground">
                <div className="flex gap-2">
                    <dt className="w-24 shrink-0">Applicants</dt>
                    <dd className="truncate text-foreground">
                        {siteLink(`/apply/${next.trim().toLowerCase() || "…"}`)}
                    </dd>
                </div>
                <div className="flex gap-2">
                    <dt className="w-24 shrink-0">Scouts</dt>
                    <dd className="truncate text-foreground">
                        {siteLink(`/join/${next.trim().toLowerCase() || "…"}`)}
                    </dd>
                </div>
            </dl>

            {changed && (
                <div className="mt-5 border-l-2 border-foreground pl-4">
                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        The old link stops working
                    </p>
                    <p className="mt-2 max-w-prose text-xs leading-relaxed text-muted-foreground">
                        <span className="text-foreground">
                            {siteLink(`/apply/${slug}`)}
                        </span>{" "}
                        and{" "}
                        <span className="text-foreground">
                            {siteLink(`/join/${slug}`)}
                        </span>{" "}
                        will stop working immediately — anyone opening them gets
                        a page that does not exist. Anywhere the old link is
                        already printed or posted, including scout cards and QR
                        codes, has to be replaced.
                    </p>
                    <p className="mt-2 max-w-prose text-xs leading-relaxed text-muted-foreground">
                        Applications you already have are unaffected, and scouts
                        keep their own links.
                    </p>
                </div>
            )}

            {error && <p className="mt-4 text-xs text-red-400">{error}</p>}

            {changed &&
                (confirming ? (
                    <div className="mt-5 flex flex-wrap gap-3">
                        <button
                            onClick={save}
                            disabled={busy}
                            className="bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                        >
                            {busy ? "Changing…" : "Yes, break the old link"}
                        </button>
                        <button
                            onClick={() => setConfirming(false)}
                            disabled={busy}
                            className="px-2 py-2.5 text-xs uppercase tracking-[0.15em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setConfirming(true)}
                        className="mt-5 bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90"
                    >
                        Change the link
                    </button>
                ))}
        </div>
    )
}
