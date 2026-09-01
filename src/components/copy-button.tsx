"use client"

import { useEffect, useState } from "react"
import { Check, Copy } from "lucide-react"

/**
 * Copies a link to the clipboard and says so.
 *
 * `value` is what lands on the clipboard, which is not always what is on
 * screen: links are shown without their scheme, but a pasted link needs one to
 * be clickable.
 */
export function CopyButton({
    value,
    label = "Copy link",
}: {
    value: string
    label?: string
}) {
    const [copied, setCopied] = useState(false)
    const [failed, setFailed] = useState(false)

    // Clear the confirmation, and cancel it if the component goes away first.
    useEffect(() => {
        if (!copied) return
        const timer = setTimeout(() => setCopied(false), 2000)
        return () => clearTimeout(timer)
    }, [copied])

    async function copy() {
        setFailed(false)
        try {
            // Undefined outside a secure context — localhost counts as one, a
            // bare LAN address does not.
            await navigator.clipboard.writeText(value)
            setCopied(true)
        } catch {
            setFailed(true)
        }
    }

    return (
        <button
            type="button"
            onClick={copy}
            aria-label={copied ? "Copied" : label}
            title={failed ? "Select the link and copy it" : label}
            className="shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground"
        >
            {copied ? (
                <Check className="h-3.5 w-3.5 text-foreground" strokeWidth={2.5} />
            ) : (
                <Copy className="h-3.5 w-3.5" strokeWidth={2} />
            )}
            <span className="sr-only" role="status">
                {copied ? "Link copied" : failed ? "Couldn't copy" : ""}
            </span>
        </button>
    )
}
