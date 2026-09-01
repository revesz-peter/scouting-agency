"use client"

import { useMemo, useState } from "react"

import { Control } from "@/components/applications/application-table"
import type { ApplicationRow } from "@/lib/applications"

export interface Filters {
    minHeight: number
    maxAge: number
    minAge: number
    maxWaist: number
    maxHips: number
    hair: string
    country: string
    recent: boolean
    query: string
}

const HAIR = ["Any", "Blonde", "Brown", "Dark", "Red", "Black"]

export const EMPTY: Filters = {
    minHeight: 150,
    maxAge: 40,
    minAge: 14,
    maxWaist: 110,
    maxHips: 120,
    hair: "Any",
    country: "Any",
    recent: false,
    query: "",
}

export function applyFilters(rows: ApplicationRow[], f: Filters) {
    const q = f.query.trim().toLowerCase()
    return rows.filter(
        (a) =>
            a.height >= f.minHeight &&
            a.age <= f.maxAge &&
            a.age >= f.minAge &&
            a.waist <= f.maxWaist &&
            a.hips <= f.maxHips &&
            (f.hair === "Any" ||
                a.hair.toLowerCase().includes(f.hair.toLowerCase())) &&
            (f.country === "Any" || a.country === f.country) &&
            (!f.recent || a.applied <= 30) &&
            (!q ||
                a.name.toLowerCase().includes(q) ||
                a.city.toLowerCase().includes(q) ||
                a.email.toLowerCase().includes(q)),
    )
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
    const [open, setOpen] = useState(false)
    const set = <K extends keyof Filters>(key: K, v: Filters[K]) =>
        onChange({ ...value, [key]: v })

    // Only offer countries that actually appear — a list of 67 to pick from
    // when six are represented is a worse control.
    const countries = useMemo(
        () => ["Any", ...[...new Set(rows.map((r) => r.country))].sort()],
        [rows],
    )

    const dirty = JSON.stringify(value) !== JSON.stringify(EMPTY)

    return (
        <div className="space-y-5">
            <input
                type="search"
                value={value.query}
                onChange={(e) => set("query", e.target.value)}
                placeholder="Name, city or email"
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

            {/* The rest is there when you want it and out of the way when you
                do not — most triage never touches these. */}
            <div className="border-t border-border pt-4">
                <button
                    type="button"
                    onClick={() => setOpen(!open)}
                    aria-expanded={open}
                    className="text-xs uppercase tracking-[0.1em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                >
                    {open ? "Fewer filters" : "More filters"}
                </button>

                {open && (
                    <div className="mt-4 space-y-5">
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
                    </div>
                )}
            </div>

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
                <button
                    type="button"
                    onClick={onSelectAll}
                    disabled={matches === 0}
                    className="mt-2 block text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-40"
                >
                    {allSelected ? "Clear selection" : "Select all matching"}
                </button>
                {dirty && (
                    <button
                        type="button"
                        onClick={() => onChange(EMPTY)}
                        className="mt-1.5 block text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                        Reset filters
                    </button>
                )}
            </div>
        </div>
    )
}
