"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown } from "lucide-react"

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
 * numbers you scan for. Everything else is a click away rather than absent —
 * open a card and it takes the full width of the grid to show the record.
 */
export function ApplicationCard({
    row,
    selected,
    onSelect,
    open,
    onOpen,
    showScout,
    href,
}: {
    row: ApplicationRow
    selected: boolean
    onSelect: () => void
    open: boolean
    onOpen: () => void
    showScout?: boolean
    /** The full profile for this person, when the viewer can reach one. */
    href?: string
}) {
    return (
        <div
            className={`border bg-background transition-colors ${
                open ? "col-span-full" : ""
            } ${selected ? "border-foreground" : "border-border"}`}
        >
            <div className={open ? "grid gap-6 p-3 sm:grid-cols-[200px_1fr]" : "p-3"}>
                <div>
                    {/* The card face stays the select target, as on the landing
                        page — picking people is the common action. */}
                    <button
                        type="button"
                        onClick={onSelect}
                        aria-pressed={selected}
                        aria-label={`Select ${row.name}`}
                        className="relative block w-full text-left"
                    >
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
                    </button>

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <button
                            type="button"
                            onClick={onOpen}
                            aria-expanded={open}
                            className="flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                        >
                            {open ? "Less" : "Everything"}
                            <ChevronDown
                                className={`h-3 w-3 transition-transform ${
                                    open ? "rotate-180" : ""
                                }`}
                            />
                        </button>
                        {href && (
                            <Link
                                href={href}
                                className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                            >
                                Open
                            </Link>
                        )}
                    </div>
                </div>

                {open && <Detail row={row} />}
            </div>
        </div>
    )
}

/** The whole record, laid out to be read rather than scanned. */
function Detail({ row }: { row: ApplicationRow }) {
    const handle = row.instagram?.replace(/^@/, "")

    return (
        <div className="min-w-0 space-y-5 text-xs">
            <div>
                <p className="uppercase tracking-[0.1em] text-muted-foreground">
                    Measurements
                </p>
                <dl className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3">
                    <Line label="Height">{row.height} cm</Line>
                    <Line label="Bust">{row.bust} cm</Line>
                    <Line label="Waist">{row.waist} cm</Line>
                    <Line label="Hips">{row.hips} cm</Line>
                    <Line label="Shoe">{row.shoe} EU</Line>
                    <Line label="Hair">{row.hair}</Line>
                    <Line label="Eyes">{row.eyes}</Line>
                    <Line label="Born">{row.dob}</Line>
                    <Line label="Gender">{row.gender}</Line>
                </dl>
            </div>

            <div>
                <p className="uppercase tracking-[0.1em] text-muted-foreground">
                    Reaching them
                </p>
                <dl className="mt-2 grid gap-x-6 gap-y-1 sm:grid-cols-2">
                    <Line label="Email">
                        <a
                            href={`mailto:${row.email}`}
                            className="break-all underline underline-offset-4"
                        >
                            {row.email}
                        </a>
                    </Line>
                    <Line label="Phone">
                        <a
                            href={`tel:${row.phone}`}
                            className="underline underline-offset-4"
                        >
                            {row.phone}
                        </a>
                    </Line>
                    <Line label="Where">
                        {row.city}, {row.country}
                    </Line>
                    {handle && (
                        <Line label="Instagram">
                            <a
                                href={`https://instagram.com/${handle}`}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="underline underline-offset-4"
                            >
                                @{handle}
                            </a>
                        </Line>
                    )}
                    {row.videoLink && (
                        <Line label="Video">
                            <a
                                href={row.videoLink}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="break-all underline underline-offset-4"
                            >
                                {row.videoLink}
                            </a>
                        </Line>
                    )}
                    {row.portfolioLink && (
                        <Line label="Portfolio">
                            <a
                                href={row.portfolioLink}
                                target="_blank"
                                rel="noreferrer noopener"
                                className="break-all underline underline-offset-4"
                            >
                                {row.portfolioLink}
                            </a>
                        </Line>
                    )}
                    {row.scout && (
                        <Line label="Scouted by">
                            {row.scout}
                            {row.scoutCode && ` · /s/${row.scoutCode}`}
                        </Line>
                    )}
                    <Line label="Applied">
                        {row.applied === 0
                            ? "today"
                            : `${row.applied} days ago`}
                    </Line>
                </dl>
            </div>

            {row.notes && (
                <div>
                    <p className="uppercase tracking-[0.1em] text-muted-foreground">
                        What they wrote
                    </p>
                    <p className="mt-2 max-w-prose leading-relaxed text-foreground">
                        {row.notes}
                    </p>
                </div>
            )}

            {/* Photo storage is not built, so the digitals are still only in the
                notification email. Better to name the gap than leave a hole. */}
            <p className="text-muted-foreground/70">
                Digitals arrive attached to the application email — photo
                storage is not built yet.
            </p>
        </div>
    )
}

function Line({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <div className="flex min-w-0 gap-2">
            <dt className="w-20 shrink-0 text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-foreground">{children}</dd>
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

/**
 * The grid. An open card takes the full row, so the ones after it reflow rather
 * than sitting beside a block of detail.
 */
export function ApplicationGrid({
    rows,
    selected,
    onToggle,
    showScout,
    hrefFor,
}: {
    rows: ApplicationRow[]
    selected: string[]
    onToggle: (id: string) => void
    showScout?: boolean
    hrefFor?: (id: string) => string
}) {
    return rows.length === 0 ? null : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {rows.map((r) => (
                <GridItem
                    key={r.id}
                    row={r}
                    selected={selected.includes(r.id)}
                    onToggle={() => onToggle(r.id)}
                    showScout={showScout}
                    href={hrefFor?.(r.id)}
                />
            ))}
        </div>
    )
}

/** Each card owns whether it is open, so several can be at once. */
function GridItem({
    row,
    selected,
    onToggle,
    showScout,
    href,
}: {
    row: ApplicationRow
    selected: boolean
    onToggle: () => void
    showScout?: boolean
    href?: string
}) {
    const [open, setOpen] = useState(false)
    return (
        <ApplicationCard
            row={row}
            selected={selected}
            onSelect={onToggle}
            open={open}
            onOpen={() => setOpen(!open)}
            showScout={showScout}
            href={href}
        />
    )
}
