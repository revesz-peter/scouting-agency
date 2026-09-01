"use client"

import { Check } from "lucide-react"

import type { ApplicationCard as Card } from "@/lib/applications"

/**
 * One face, as a card. The same shape on both sides — an agency picking who to
 * shortlist and a scout picking who to send on are doing the same thing, so
 * they should be looking at the same object.
 */
export function ApplicationCard({
    application,
    selected,
    onSelect,
    showScout,
}: {
    application: Card
    selected?: boolean
    onSelect?: () => void
    /** Agencies want to know whose link it came through; a scout knows. */
    showScout?: boolean
}) {
    const body = (
        <>
            <span className="mb-2 flex aspect-4/5 items-end bg-black/[0.04] p-2">
                <span className="text-xs text-foreground/25 font-[family-name:var(--font-libre)]">
                    {application.name.charAt(0)}
                </span>
            </span>
            <span className="block text-xs font-medium text-foreground">
                {application.name}
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
                {application.age} · {application.height} cm
            </span>
            <span className="block text-xs text-muted-foreground">
                {application.city} · {application.hair.toLowerCase()}
            </span>
            {showScout && application.scout && (
                <span className="mt-1 block truncate text-xs text-muted-foreground/70">
                    via {application.scout}
                </span>
            )}
        </>
    )

    if (!onSelect) {
        return (
            <div className="border border-border bg-background p-3">{body}</div>
        )
    }

    return (
        <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            className={`relative border bg-background p-3 text-left transition-colors ${
                selected
                    ? "border-foreground"
                    : "border-border hover:border-foreground/30"
            }`}
        >
            <span
                className={`absolute right-4 top-4 flex h-4 w-4 items-center justify-center border ${
                    selected
                        ? "border-foreground bg-foreground"
                        : "border-border bg-background/80"
                }`}
            >
                {selected && (
                    <Check className="h-2.5 w-2.5 text-background" strokeWidth={3} />
                )}
            </span>
            {body}
        </button>
    )
}

/** A labelled slider, as the filters use. */
export function Control({
    label,
    value,
    min,
    max,
    onChange,
}: {
    label: string
    value: number
    min: number
    max: number
    onChange: (v: number) => void
}) {
    return (
        <label className="block">
            <span className="flex items-baseline justify-between text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {label}
                <span className="text-foreground">{value}</span>
            </span>
            <input
                type="range"
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="mt-2 w-full accent-foreground"
            />
        </label>
    )
}
