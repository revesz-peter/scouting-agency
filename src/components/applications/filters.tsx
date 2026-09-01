"use client"

import { useMemo } from "react"

import { Control } from "@/components/applications/application-card"
import type { ApplicationRow } from "@/lib/applications"

export interface Filters {
    minHeight: number
    maxAge: number
    minAge: number
    maxBust: number
    maxWaist: number
    maxHips: number
    hair: string
    country: string
    recent: boolean
    query: string
}

const HAIR = ["Any", "Blonde", "Brown", "Dark", "Red", "Black"]

/**
 * Where the sliders start: roughly the bar a women's board actually works to,
 * around 88 / 60 / 92 and 170 up.
 *
 * This hides people on arrival, which is the point of a bar — but it is also
 * how someone misses an applicant, so the count says how many are out of view
 * and one click widens everything.
 */
export const DEFAULTS: Filters = {
    minHeight: 170,
    maxAge: 40,
    minAge: 14,
    maxBust: 88,
    maxWaist: 60,
    maxHips: 92,
    hair: "Any",
    country: "Any",
    recent: false,
    query: "",
}

/** Every slider at its limit: nobody is filtered out. */
export const WIDE: Filters = {
    ...DEFAULTS,
    minHeight: 150,
    maxBust: 115,
    maxWaist: 110,
    maxHips: 120,
}

/**
 * Age is deliberately wide in both. A board has a view on measurements; a
 * default that quietly buried applicants by age would be a different kind of
 * decision, and not one a slider should make on an agency's behalf.
 */

/**
 * Everything on the record, as one lowercase string.
 *
 * Field names go in beside their values, so "waist 60" and "eyes green" find
 * what you would expect — a number on its own is ambiguous across five
 * measurements, and typing the label is the natural way to say which you meant.
 */
function haystack(a: ApplicationRow): string {
    const pairs: [string, string | number | null][] = [
        ["", a.name],
        ["email", a.email],
        ["phone", a.phone],
        ["born", a.dob],
        ["age", a.age],
        ["gender", a.gender],
        ["city", a.city],
        ["country", a.country],
        ["instagram", a.instagram],
        ["height", a.height],
        ["bust", a.bust],
        ["waist", a.waist],
        ["hips", a.hips],
        ["shoe", a.shoe],
        ["hair", a.hair],
        ["eyes", a.eyes],
        ["video", a.videoLink],
        ["portfolio", a.portfolioLink],
        ["notes", a.notes],
        ["scout", a.scout],
        ["scout", a.scoutCode],
    ]

    return pairs
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .map(([label, v]) => `${label} ${v}`)
        .join(" ")
        .toLowerCase()
}

/** Field names the search understands as "this label, this value". */
const LABELS = [
    "email", "phone", "born", "age", "gender", "city", "country", "instagram",
    "height", "bust", "waist", "hips", "shoe", "hair", "eyes", "video",
    "portfolio", "notes", "scout",
]

/**
 * Split a query into things that must appear in the haystack.
 *
 * A label followed by anything binds to it, so "hips 60" asks for hips of 60
 * and does not quietly match someone whose waist is 60 — matching the two words
 * independently is how a search says yes to the wrong person.
 */
function requirements(query: string): string[] {
    const tokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const out: string[] = []

    for (let i = 0; i < tokens.length; i++) {
        if (LABELS.includes(tokens[i]) && tokens[i + 1]) {
            out.push(`${tokens[i]} ${tokens[i + 1]}`)
            i++
        } else {
            out.push(tokens[i])
        }
    }

    return out
}

export function applyFilters(rows: ApplicationRow[], f: Filters) {
    const needed = requirements(f.query)

    return rows.filter((a) => {
        if (
            a.height < f.minHeight ||
            a.age > f.maxAge ||
            a.age < f.minAge ||
            a.bust > f.maxBust ||
            a.waist > f.maxWaist ||
            a.hips > f.maxHips ||
            (f.hair !== "Any" &&
                !a.hair.toLowerCase().includes(f.hair.toLowerCase())) ||
            (f.country !== "Any" && a.country !== f.country) ||
            (f.recent && a.applied > 30)
        ) {
            return false
        }

        if (needed.length === 0) return true
        const hay = haystack(a)
        return needed.every((t) => hay.includes(t))
    })
}

/**
 * The bar an agency sets. Wider than the landing page's three sliders because
 * this one is used against a real board: name and city search, both ends of the
 * age range, hips as well as waist, and the country the applicant is in.
 */
export function FilterColumn({
    rows,
    value,
    onChange,
    matches,
    onSelectAll,
    allSelected,
}: {
    rows: ApplicationRow[]
    value: Filters
    onChange: (f: Filters) => void
    matches: number
    onSelectAll: () => void
    allSelected: boolean
}) {
    const set = <K extends keyof Filters>(key: K, v: Filters[K]) =>
        onChange({ ...value, [key]: v })

    // Only offer countries that actually appear — a list of 67 to pick from
    // when six are represented is a worse control.
    const countries = useMemo(
        () => ["Any", ...[...new Set(rows.map((r) => r.country))].sort()],
        [rows],
    )

    const wideOpen = JSON.stringify(value) === JSON.stringify(WIDE)
    const hidden = rows.length - matches

    return (
        <div className="space-y-5">
            <input
                type="search"
                value={value.query}
                onChange={(e) => set("query", e.target.value)}
                placeholder="Search everything"
                className="w-full border-b border-border bg-transparent py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-foreground/30"
            />

            <Control
                label="Height from"
                value={value.minHeight}
                min={150}
                max={200}
                suffix=" cm"
                onChange={(v) => set("minHeight", v)}
            />
            <Control
                label="Age from"
                value={value.minAge}
                min={14}
                max={40}
                onChange={(v) => set("minAge", v)}
            />
            <Control
                label="Age up to"
                value={value.maxAge}
                min={14}
                max={40}
                onChange={(v) => set("maxAge", v)}
            />

            <div>
                <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    Hair
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {HAIR.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => set("hair", option)}
                            aria-pressed={value.hair === option}
                            className={`border px-2 py-1 text-xs transition-colors ${
                                value.hair === option
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border text-muted-foreground hover:border-foreground/30"
                            }`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>

            {/* Measurements are the job, so they are all here rather than
                behind a toggle — a filter you have to go looking for is one
                nobody uses. */}
            <Control
                label="Bust up to"
                value={value.maxBust}
                min={65}
                max={115}
                suffix=" cm"
                onChange={(v) => set("maxBust", v)}
            />
            <Control
                label="Waist up to"
                value={value.maxWaist}
                min={45}
                max={110}
                suffix=" cm"
                onChange={(v) => set("maxWaist", v)}
            />
            <Control
                label="Hips up to"
                value={value.maxHips}
                min={65}
                max={120}
                suffix=" cm"
                onChange={(v) => set("maxHips", v)}
            />

            <label className="block">
                <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                    Country
                </span>
                <select
                    value={value.country}
                    onChange={(e) => set("country", e.target.value)}
                    className="mt-2 w-full appearance-none border-b border-border bg-transparent py-1.5 text-xs outline-none focus:border-foreground/30"
                >
                    {countries.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </label>

            <label className="flex items-center gap-2.5">
                <input
                    type="checkbox"
                    checked={value.recent}
                    onChange={(e) => set("recent", e.target.checked)}
                    className="h-3.5 w-3.5 accent-foreground"
                />
                <span className="text-xs text-muted-foreground">
                    Applied in the last 30 days
                </span>
            </label>

            <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">
                    <span className="text-foreground">{matches}</span> of{" "}
                    {rows.length} match
                </p>
                {/* The bar hides people by design; saying how many keeps that
                    from being a surprise. */}
                {hidden > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {hidden} below the bar
                    </p>
                )}
                <button
                    type="button"
                    onClick={onSelectAll}
                    disabled={matches === 0}
                    className="mt-2 block text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-40"
                >
                    {allSelected ? "Clear selection" : "Select all matching"}
                </button>
                <button
                    type="button"
                    onClick={() => onChange(wideOpen ? DEFAULTS : WIDE)}
                    className="mt-1.5 block text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                >
                    {wideOpen ? "Back to the usual bar" : "Show everyone"}
                </button>
            </div>
        </div>
    )
}
