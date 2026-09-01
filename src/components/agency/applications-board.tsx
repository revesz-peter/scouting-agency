"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ListPlus, Send } from "lucide-react"

import {
    ApplicationCard,
    Control,
} from "@/components/applications/application-card"
import type { ApplicationCard as Card } from "@/lib/applications"

const HAIR = ["Any", "Blonde", "Brown", "Dark", "Red"]

/**
 * The agency's Applied column: set the bar, and the board answers.
 *
 * Filtering has to end in something you can do, so the bar at the foot moves
 * the ones worth keeping into Pre-Select. Everything else stays where it is —
 * nothing is discarded by filtering it out of view.
 */
export function ApplicationsBoard({
    applications,
    organizationId,
}: {
    applications: Card[]
    organizationId: string
}) {
    const router = useRouter()

    const [minHeight, setMinHeight] = useState(160)
    const [maxAge, setMaxAge] = useState(40)
    const [maxWaist, setMaxWaist] = useState(110)
    const [hair, setHair] = useState("Any")
    const [recent, setRecent] = useState(false)
    const [picked, setPicked] = useState<string[]>([])
    const [moved, setMoved] = useState(0)
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState("")

    const matches = useMemo(
        () =>
            applications.filter(
                (a) =>
                    a.height >= minHeight &&
                    a.age <= maxAge &&
                    a.waist <= maxWaist &&
                    (hair === "Any" ||
                        a.hair.toLowerCase().includes(hair.toLowerCase())) &&
                    (!recent || a.applied <= 30),
            ),
        [applications, minHeight, maxAge, maxWaist, hair, recent],
    )

    // Only ever act on people who still pass the filters.
    const selected = picked.filter((id) => matches.some((m) => m.id === id))

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
            <div className="space-y-5">
                <Control
                    label="Height from"
                    value={minHeight}
                    min={150}
                    max={200}
                    onChange={setMinHeight}
                />
                <Control
                    label="Age up to"
                    value={maxAge}
                    min={14}
                    max={40}
                    onChange={setMaxAge}
                />
                <Control
                    label="Waist up to"
                    value={maxWaist}
                    min={45}
                    max={110}
                    onChange={setMaxWaist}
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
                                onClick={() => setHair(option)}
                                aria-pressed={hair === option}
                                className={`border px-2 py-1 text-xs transition-colors ${
                                    hair === option
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-border text-muted-foreground hover:border-foreground/30"
                                }`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                <label className="flex items-center gap-2.5">
                    <input
                        type="checkbox"
                        checked={recent}
                        onChange={(e) => setRecent(e.target.checked)}
                        className="h-3.5 w-3.5 accent-foreground"
                    />
                    <span className="text-xs text-muted-foreground">
                        Applied in the last 30 days
                    </span>
                </label>

                <div className="border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground">
                        <span className="text-foreground">{matches.length}</span>{" "}
                        of {applications.length} match
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setMoved(0)
                            setPicked(
                                selected.length === matches.length
                                    ? []
                                    : matches.map((m) => m.id),
                            )
                        }}
                        disabled={matches.length === 0}
                        className="mt-2 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-40"
                    >
                        {selected.length === matches.length && matches.length > 0
                            ? "Clear selection"
                            : "Select all matching"}
                    </button>
                </div>
            </div>

            <div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {matches.map((a) => (
                        <ApplicationCard
                            key={a.id}
                            application={a}
                            selected={selected.includes(a.id)}
                            onSelect={() => toggle(a.id)}
                            showScout
                        />
                    ))}
                    {matches.length === 0 && (
                        <p className="col-span-full py-8 text-center text-xs text-muted-foreground">
                            {applications.length === 0
                                ? "Nothing here yet. Applications through your link land in this column."
                                : "Nobody matches. Loosen the bar."}
                        </p>
                    )}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                    <button
                        type="button"
                        disabled={selected.length === 0 || busy}
                        onClick={shortlist}
                        className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                    >
                        <ListPlus className="h-3 w-3" />
                        {busy ? "Moving…" : `Add ${selected.length || ""} to shortlist`}
                    </button>
                    <button
                        type="button"
                        disabled
                        title="Castings are not built yet"
                        className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground transition-colors disabled:opacity-40"
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
