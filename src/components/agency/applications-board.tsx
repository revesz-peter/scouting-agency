"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ListPlus, Send } from "lucide-react"

import {
    ApplicationTable,
    SORTS,
    sortRows,
    type SortKey,
} from "@/components/applications/application-table"
import {
    applyFilters,
    EMPTY,
    FilterColumn,
    type Filters,
} from "@/components/applications/filters"
import type { ApplicationRow } from "@/lib/applications"

/**
 * The agency's Applied column.
 *
 * Filtering has to end in something you can do, so the bar at the foot moves
 * the ones worth keeping into Pre-Select. Nothing is discarded by filtering it
 * out of view — what does not match is still there when the bar moves.
 */
export function ApplicationsBoard({
    applications,
    organizationId,
}: {
    applications: ApplicationRow[]
    organizationId: string
}) {
    const router = useRouter()

    const [filters, setFilters] = useState<Filters>(EMPTY)
    const [sort, setSort] = useState<SortKey>("applied")
    const [picked, setPicked] = useState<string[]>([])
    const [moved, setMoved] = useState(0)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")

    const matches = useMemo(
        () => sortRows(applyFilters(applications, filters), sort),
        [applications, filters, sort],
    )

    // Only ever act on people who still pass the filters.
    const selected = picked.filter((id) => matches.some((m) => m.id === id))
    const allSelected = selected.length === matches.length && matches.length > 0

    function toggle(id: string) {
        setMoved(0)
        setPicked((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )
    }

    async function shortlist() {
        setError("")
        setBusy(true)

        try {
            const response = await fetch("/api/agency/stage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationId,
                    ids: selected,
                    stage: "pre_select",
                }),
            })

            if (!response.ok) {
                const body = await response.json().catch(() => ({}))
                setError(body.error ?? "Couldn't move those.")
                setBusy(false)
                return
            }

            setMoved(selected.length)
            setPicked([])
            setBusy(false)
            router.refresh()
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    return (
        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
            <FilterColumn
                rows={applications}
                value={filters}
                onChange={(f) => {
                    setMoved(0)
                    setFilters(f)
                }}
                matches={matches.length}
                allSelected={allSelected}
                onSelectAll={() => {
                    setMoved(0)
                    setPicked(allSelected ? [] : matches.map((m) => m.id))
                }}
            />

            <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                    <p className="text-xs text-muted-foreground">
                        {selected.length > 0
                            ? `${selected.length} selected`
                            : `${matches.length} shown`}
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

                {applications.length === 0 ? (
                    <p className="py-10 text-center text-xs text-muted-foreground">
                        Nothing here yet. Applications through your link land in
                        this column, and anything a scout sends on arrives here
                        too.
                    </p>
                ) : (
                    <ApplicationTable
                        rows={matches}
                        selected={selected}
                        onToggle={toggle}
                        showScout
                    />
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                    <button
                        type="button"
                        disabled={selected.length === 0 || busy}
                        onClick={shortlist}
                        className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                    >
                        <ListPlus className="h-3 w-3" />
                        {busy
                            ? "Moving…"
                            : `Add ${selected.length || ""} to shortlist`}
                    </button>
                    <button
                        type="button"
                        disabled
                        title="Castings are not built yet"
                        className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground disabled:opacity-40"
                    >
                        <Send className="h-3 w-3" />
                        Invite to casting
                    </button>
                    {error ? (
                        <p className="text-xs text-red-400">{error}</p>
                    ) : moved > 0 ? (
                        <p className="text-xs text-foreground">
                            {moved} added · now in Pre-Select
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Pick the ones worth keeping.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
