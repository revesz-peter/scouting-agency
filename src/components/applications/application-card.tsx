"use client"

import Link from "next/link"
import { Check, Star } from "lucide-react"

import type { ApplicationRow } from "@/lib/applications"

export type SortKey = "applied" | "name" | "age" | "height"

export const SORTS: { key: SortKey; label: string }[] = [
    { key: "applied", label: "Newest" },
    { key: "name", label: "Name" },
    { key: "height", label: "Tallest" },
    { key: "age", label: "Youngest" },
]

export function sortRows(rows: ApplicationRow[], key: SortKey) {
    const sorted = [...rows]
    switch (key) {
        case "name":
            return sorted.sort((a, b) => a.name.localeCompare(b.name))
        case "height":
            return sorted.sort((a, b) => b.height - a.height)
        case "age":
            return sorted.sort((a, b) => a.age - b.age)
        default:
            // `applied` counts days since arrival, so smallest is newest.
            return sorted.sort((a, b) => a.applied - b.applied)
    }
}

/**
 * One applicant, as the landing page shows them: a face, a name, and the two
 * numbers you scan for. The card face selects, and the whole record is one
 * click away on their own page — there is no second, lesser version of it here.
 */
export function ApplicationCard({
    row,
    selected,
    onSelect,
    showScout,
    href,
    badge,
    starred,
    selectable = true,
}: {
    row: ApplicationRow
    selected: boolean
    onSelect: () => void
    showScout?: boolean
    /** The full profile for this person, when the viewer can reach one. */
    href?: string
    /** Where they got to — what a scout wants to know about someone they sent. */
    badge?: string
    /** Kept, and still sitting with everyone else. */
    starred?: boolean
    /** Some lists are for reading, not picking. */
    selectable?: boolean
}) {
    return (
        <div
            className={`border bg-background p-3 transition-colors ${
                selected ? "border-foreground" : "border-border"
            }`}
        >
            {starred && (
                <span className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.1em] text-foreground">
                    <Star className="h-2.5 w-2.5 fill-foreground" strokeWidth={0} />
                    Shortlisted
                </span>
            )}
            <button
                type="button"
                onClick={onSelect}
                aria-pressed={selectable ? selected : undefined}
                aria-label={selectable ? `Select ${row.name}` : row.name}
                disabled={!selectable}
                className="relative block w-full text-left"
            >
                {selectable && (
                    <span
                        className={`absolute right-1 top-1 flex h-4 w-4 items-center justify-center border ${
                            selected
                                ? "border-foreground bg-foreground"
                                : "border-border bg-background/80"
                        }`}
                    >
                        {selected && (
                            <Check
                                className="h-2.5 w-2.5 text-background"
                                strokeWidth={3}
                            />
                        )}
                    </span>
                )}
                <span className="mb-2 flex aspect-4/5 items-end bg-black/[0.04] p-2">
                    <span className="text-xs text-foreground/25 font-[family-name:var(--font-libre)]">
                        {row.name.charAt(0)}
                    </span>
                </span>
                <span className="block text-xs font-medium text-foreground">
                    {row.name}
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                    {row.age} · {row.height} cm
                </span>
                <span className="block text-xs text-muted-foreground">
                    {row.city} · {row.hair.toLowerCase()}
                </span>
                {showScout && row.scout && (
                    <span className="mt-1 block truncate text-xs text-muted-foreground/70">
                        via {row.scout}
                    </span>
                )}
                {badge && (
                    <span className="mt-1.5 inline-block border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                        {badge}
                    </span>
                )}
            </button>

            {href && (
                <Link
                    href={href}
                    className="mt-2 inline-block text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                >
                    Open
                </Link>
            )}
        </div>
    )
}

/** A labelled slider, as the filters use. */
export function Control({
    label,
    value,
    min,
    max,
    onChange,
    suffix,
}: {
    label: string
    value: number
    min: number
    max: number
    onChange: (v: number) => void
    suffix?: string
}) {
    return (
        <label className="block">
            <span className="flex items-baseline justify-between text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {label}
                <span className="text-foreground">
                    {value}
                    {suffix}
                </span>
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

export function ApplicationGrid({
    rows,
    selected,
    onToggle,
    showScout,
    hrefFor,
    badgeFor,
    starredFor,
    selectable = true,
}: {
    rows: ApplicationRow[]
    selected: string[]
    onToggle: (id: string) => void
    showScout?: boolean
    hrefFor?: (id: string) => string
    badgeFor?: (row: ApplicationRow) => string | undefined
    starredFor?: (row: ApplicationRow) => boolean
    selectable?: boolean
}) {
    return rows.length === 0 ? null : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {rows.map((r) => (
                <ApplicationCard
                    key={r.id}
                    row={r}
                    selected={selected.includes(r.id)}
                    onSelect={() => onToggle(r.id)}
                    showScout={showScout}
                    href={hrefFor?.(r.id)}
                    badge={badgeFor?.(r)}
                    starred={starredFor?.(r)}
                    selectable={selectable}
                />
            ))}
        </div>
    )
}
