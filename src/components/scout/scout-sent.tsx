"use client"

import { useMemo, useState } from "react"

import {
    ApplicationGrid,
    SORTS,
    sortRows,
    type SortKey,
} from "@/components/applications/application-card"
import {
    applyFilters,
    FilterColumn,
    WIDE,
    type Filters,
} from "@/components/applications/filters"
import { stageName } from "@/components/applications/talent-profile"
import type { SentApplication } from "@/lib/applications"

/**
 * Everyone a scout has passed on, and where they got to.
 *
 * Filters start wide rather than at a board's bar: a scout is looking back
 * through their own work, not screening against a standard, and a default that
 * hid half of it would be answering a question nobody asked.
 */
export function ScoutSent({ sent }: { sent: SentApplication[] }) {
    const [filters, setFilters] = useState<Filters>(WIDE)
    const [sort, setSort] = useState<SortKey>("applied")

    const matches = useMemo(
        () => sortRows(applyFilters(sent, filters), sort) as SentApplication[],
        [sent, filters, sort],
    )

    if (sent.length === 0) {
        return (
            <div className="mt-10 border-t border-border pt-6">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Sent on
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                    Nothing yet. Anyone you send stays here afterwards.
                </p>
            </div>
        )
    }

    return (
        <div className="mt-10 border-t border-border pt-6">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Sent on
            </p>
            <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted-foreground">
                Everyone you passed on, and how far they got. This is what your
                kept rate is made of.
            </p>

            <div className="mt-6 grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
                <FilterColumn
                    rows={sent}
                    value={filters}
                    onChange={setFilters}
                    matches={matches.length}
                    allSelected={false}
                    onSelectAll={() => {}}
                    selectable={false}
                />

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                        <p className="text-xs text-muted-foreground">
                            {matches.length} of {sent.length}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                Sort
                            </span>
                            {SORTS.map((s) => (
                                <button
                                    key={s.key}
                                    type="button"
                                    onClick={() => setSort(s.key)}
                                    aria-pressed={sort === s.key}
                                    className={`border px-2 py-1 text-xs transition-colors ${
                                        sort === s.key
                                            ? "border-foreground bg-foreground text-background"
                                            : "border-border text-muted-foreground hover:border-foreground/30"
                                    }`}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <ApplicationGrid
                        rows={matches}
                        selected={[]}
                        onToggle={() => {}}
                        selectable={false}
                        hrefFor={(id) => `/scout/applications/${id}`}
                        badgeFor={(r) =>
                            stageName((r as SentApplication).stage)
                        }
                    />

                    {matches.length === 0 && (
                        <p className="py-8 text-center text-xs text-muted-foreground">
                            Nobody matches. Loosen the bar.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
