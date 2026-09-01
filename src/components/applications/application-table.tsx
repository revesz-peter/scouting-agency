"use client"

import { Fragment, useState } from "react"
import { Check, ChevronDown } from "lucide-react"

import type { ApplicationRow } from "@/lib/applications"

/**
 * The working view of a set of applications.
 *
 * A card grid is what the landing page shows because it reads as faces; the
 * people triaging these are comparing numbers, so the default is a table where
 * measurements line up in columns. Any row opens to the whole record — contact
 * details, links and whatever the applicant wrote — without leaving the list.
 */

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

export function ApplicationTable({
    rows,
    selected,
    onToggle,
    showScout,
}: {
    rows: ApplicationRow[]
    selected: string[]
    onToggle: (id: string) => void
    showScout?: boolean
}) {
    const [open, setOpen] = useState<string | null>(null)

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-xs">
                <thead>
                    <tr className="border-b border-border text-left uppercase tracking-[0.1em] text-muted-foreground">
                        <th className="w-8 py-2 font-medium" />
                        <th className="py-2 pr-3 font-medium">Name</th>
                        <th className="py-2 pr-3 font-medium">Age</th>
                        <th className="py-2 pr-3 font-medium">Height</th>
                        {/* Bust, waist and hips read as one measurement, not three */}
                        <th className="py-2 pr-3 font-medium">B · W · H</th>
                        <th className="py-2 pr-3 font-medium">Shoe</th>
                        <th className="py-2 pr-3 font-medium">Hair · Eyes</th>
                        <th className="py-2 pr-3 font-medium">From</th>
                        {showScout && (
                            <th className="py-2 pr-3 font-medium">Scout</th>
                        )}
                        <th className="py-2 pr-3 font-medium">Applied</th>
                        <th className="w-8 py-2 font-medium" />
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r) => {
                        const on = selected.includes(r.id)
                        const expanded = open === r.id
                        return (
                            <Fragment key={r.id}>
                                <tr
                                    className={`border-b border-border transition-colors ${
                                        on ? "bg-black/[0.03]" : ""
                                    }`}
                                >
                                    <td className="py-2.5">
                                        <button
                                            type="button"
                                            onClick={() => onToggle(r.id)}
                                            aria-pressed={on}
                                            aria-label={`Select ${r.name}`}
                                            className={`flex h-4 w-4 items-center justify-center border transition-colors ${
                                                on
                                                    ? "border-foreground bg-foreground"
                                                    : "border-border hover:border-foreground/40"
                                            }`}
                                        >
                                            {on && (
                                                <Check
                                                    className="h-2.5 w-2.5 text-background"
                                                    strokeWidth={3}
                                                />
                                            )}
                                        </button>
                                    </td>
                                    <td className="py-2.5 pr-3 text-foreground">
                                        {r.name}
                                    </td>
                                    <td className="py-2.5 pr-3 text-muted-foreground">
                                        {r.age}
                                    </td>
                                    <td className="py-2.5 pr-3 text-muted-foreground">
                                        {r.height}
                                    </td>
                                    <td className="py-2.5 pr-3 text-muted-foreground">
                                        {r.bust} · {r.waist} · {r.hips}
                                    </td>
                                    <td className="py-2.5 pr-3 text-muted-foreground">
                                        {r.shoe}
                                    </td>
                                    <td className="py-2.5 pr-3 text-muted-foreground">
                                        {r.hair.toLowerCase()} ·{" "}
                                        {r.eyes.toLowerCase()}
                                    </td>
                                    <td className="py-2.5 pr-3 text-muted-foreground">
                                        {r.city}, {r.country}
                                    </td>
                                    {showScout && (
                                        <td className="py-2.5 pr-3 text-muted-foreground">
                                            {r.scout ?? "—"}
                                        </td>
                                    )}
                                    <td className="py-2.5 pr-3 text-muted-foreground">
                                        {r.applied === 0
                                            ? "today"
                                            : `${r.applied}d`}
                                    </td>
                                    <td className="py-2.5">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpen(expanded ? null : r.id)
                                            }
                                            aria-expanded={expanded}
                                            aria-label={`Details for ${r.name}`}
                                            className="text-muted-foreground transition-colors hover:text-foreground"
                                        >
                                            <ChevronDown
                                                className={`h-3.5 w-3.5 transition-transform ${
                                                    expanded ? "rotate-180" : ""
                                                }`}
                                            />
                                        </button>
                                    </td>
                                </tr>
                                {expanded && (
                                    <tr className="border-b border-border bg-black/[0.02]">
                                        <td />
                                        <td
                                            colSpan={showScout ? 10 : 9}
                                            className="py-4 pr-3"
                                        >
                                            <Detail row={r} />
                                        </td>
                                    </tr>
                                )}
                            </Fragment>
                        )
                    })}
                </tbody>
            </table>

            {rows.length === 0 && (
                <p className="py-8 text-center text-xs text-muted-foreground">
                    Nothing here.
                </p>
            )}
        </div>
    )
}

/** Everything the table has no column for. */
function Detail({ row }: { row: ApplicationRow }) {
    const handle = row.instagram?.replace(/^@/, "")

    return (
        <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div className="space-y-1">
                <Line label="Email">
                    <a
                        href={`mailto:${row.email}`}
                        className="underline underline-offset-4"
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
                <Line label="Born">{row.dob}</Line>
                <Line label="Gender">{row.gender}</Line>
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
            </div>

            <div className="space-y-1">
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
                {row.notes && (
                    <div className="pt-1">
                        <p className="uppercase tracking-[0.1em] text-muted-foreground">
                            Notes
                        </p>
                        <p className="mt-1 max-w-prose leading-relaxed text-foreground">
                            {row.notes}
                        </p>
                    </div>
                )}
            </div>

            {/* The digitals are still only in the notification email, so say so
                rather than leaving an unexplained gap where they belong. */}
            <p className="text-muted-foreground/70 sm:col-span-2">
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
        <div className="flex gap-2">
            <span className="w-20 shrink-0 uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </span>
            <span className="min-w-0 text-foreground">{children}</span>
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
