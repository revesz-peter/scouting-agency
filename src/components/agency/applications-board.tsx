"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ListPlus, Send } from "lucide-react"

import {
    ApplicationGrid,
    SORTS,
    sortRows,
    type SortKey,
} from "@/components/applications/application-card"
import {
    applyFilters,
    DEFAULTS,
    FilterColumn,
    type Filters,
} from "@/components/applications/filters"
import type { InboxApplication } from "@/lib/applications"

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
    slug,
}: {
    applications: InboxApplication[]
    organizationId: string
    slug: string
}) {
    const router = useRouter()

    const [filters, setFilters] = useState<Filters>(DEFAULTS)
    const [sort, setSort] = useState<SortKey>("applied")
    const [picked, setPicked] = useState<string[]>([])
    const [show, setShow] = useState<"all" | "yes" | "no">("all")
    const [moved, setMoved] = useState("")
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")

    const matches = useMemo(() => {
        const byShortlist = applications.filter((a) =>
            show === "all" ? true : show === "yes" ? a.shortlisted : !a.shortlisted,
        )
        return sortRows(
            applyFilters(byShortlist, filters),
            sort,
        ) as InboxApplication[]
    }, [applications, filters, sort, show])

    // Only ever act on people who still pass the filters.
    const selected = picked.filter((id) => matches.some((m) => m.id === id))
    const allSelected = selected.length === matches.length && matches.length > 0

    function toggle(id: string) {
        setMoved("")
        setPicked((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )
    }

    /**
     * Shortlisting moves between `applied` and `pre_select`, which is the same
     * working set either way — so it reads as marking someone, and unmarking is
     * the same button back.
     */
    async function setShortlist(on: boolean) {
        const ids = selected.filter((id) => {
            const row = applications.find((a) => a.id === id)
            return row && row.shortlisted !== on
        })
        if (ids.length === 0) return

        setError("")
        setBusy(true)

        try {
            const response = await fetch("/api/agency/stage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    organizationId,
                    ids,
                    stage: on ? "pre_select" : "applied",
                }),
            })

            if (!response.ok) {
                const body = await response.json().catch(() => ({}))
                setError(body.error ?? "Couldn't update those.")
                setBusy(false)
                return
            }

            setMoved(
                on
                    ? `${ids.length} shortlisted`
                    : `${ids.length} taken off the shortlist`,
            )
            setPicked([])
            setBusy(false)
            router.refresh()
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    const canAdd = selected.some(
        (id) => !applications.find((a) => a.id === id)?.shortlisted,
    )
    const canRemove = selected.some(
        (id) => applications.find((a) => a.id === id)?.shortlisted,
    )
    const shortlistedTotal = applications.filter((a) => a.shortlisted).length

    return (
        <div className="mt-8 grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
            <FilterColumn
                rows={applications}
                value={filters}
                onChange={(f) => {
                    setMoved("")
                    setFilters(f)
                }}
                matches={matches.length}
                allSelected={allSelected}
                onSelectAll={() => {
                    setMoved("")
                    setPicked(allSelected ? [] : matches.map((m) => m.id))
                }}
            />

            <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                    <div className="flex items-center gap-1.5">
                        {(
                            [
                                ["all", `All ${applications.length}`],
                                ["yes", `Shortlisted ${shortlistedTotal}`],
                                ["no", "Not yet"],
                            ] as const
                        ).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setShow(key)}
                                aria-pressed={show === key}
                                className={`border px-2 py-1 text-xs transition-colors ${
                                    show === key
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-border text-muted-foreground hover:border-foreground/30"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                        {selected.length > 0 && (
                            <span className="ml-2 text-xs text-muted-foreground">
                                {selected.length} selected
                            </span>
                        )}
                    </div>
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
                    <ApplicationGrid
                        rows={matches}
                        selected={selected}
                        onToggle={toggle}
                        showScout
                        hrefFor={(id) => `/agency/${slug}/applications/${id}`}
                        starredFor={(r) => (r as InboxApplication).shortlisted}
                    />
                )}

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                    <button
                        type="button"
                        disabled={!canAdd || busy}
                        onClick={() => setShortlist(true)}
                        className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                    >
                        <ListPlus className="h-3 w-3" />
                        {busy ? "Working…" : "Shortlist"}
                    </button>
                    {canRemove && (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => setShortlist(false)}
                            className="border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground/30 disabled:opacity-40"
                        >
                            Take off the shortlist
                        </button>
                    )}
                    <button
                        type="button"
                        disabled
                        title="Castings are not built yet — this is what the shortlist is for"
                        className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground disabled:opacity-40"
                    >
                        <Send className="h-3 w-3" />
                        Invite to casting
                    </button>
                    {error ? (
                        <p className="text-xs text-red-400">{error}</p>
                    ) : moved ? (
                        <p className="text-xs text-foreground">{moved}</p>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Shortlisting keeps them here, marked.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
