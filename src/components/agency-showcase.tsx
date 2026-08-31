"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Download, GripVertical, ListPlus, Send } from "lucide-react"

// ─── Mock talent used across the panels ───────────────────

interface Applicant {
    id: string
    name: string
    age: number
    height: number
    bust: number
    waist: number
    hips: number
    city: string
    hair: string
    /** How long ago they applied, in days — drives the recency filter. */
    applied: number
}

const APPLICANTS: Applicant[] = [
    { id: "a", name: "Anna K.", age: 17, height: 178, bust: 82, waist: 60, hips: 88, city: "Budapest", hair: "Dark", applied: 4 },
    { id: "b", name: "Lena V.", age: 21, height: 174, bust: 86, waist: 63, hips: 90, city: "Warsaw", hair: "Blonde", applied: 210 },
    { id: "c", name: "Mira S.", age: 19, height: 181, bust: 80, waist: 59, hips: 87, city: "Prague", hair: "Brown", applied: 11 },
    { id: "d", name: "Nadia R.", age: 24, height: 169, bust: 88, waist: 66, hips: 93, city: "Vienna", hair: "Dark", applied: 95 },
    { id: "e", name: "Sofia B.", age: 16, height: 176, bust: 81, waist: 61, hips: 89, city: "Milan", hair: "Red", applied: 22 },
    { id: "f", name: "Tessa M.", age: 22, height: 183, bust: 84, waist: 62, hips: 91, city: "Berlin", hair: "Blonde", applied: 340 },
]

const HAIR = ["Any", "Blonde", "Brown", "Dark", "Red"]

const TABS = [
    { key: "filter", label: "Filter", blurb: "Set the bar and the board answers. Height, age, measurements, city — across every application you have ever received, not just this month's." },
    { key: "stages", label: "Stages", blurb: "Drag a face from one stage to the next. The move is the record: who advanced them, when, and what happened after." },
    { key: "casting", label: "Castings", blurb: "Invite your shortlist to an online casting in one click. Everyone selected gets the time, the link, and a reminder — written once, sent automatically." },
    { key: "scouts", label: "Scouts", blurb: "Every application is credited to the scout whose link it came through. See who is actually producing, and what you owe them, in one place." },
    { key: "board", label: "Board", blurb: "Your roster, hosted here and embedded on your own site. Export a talent as a PDF or the whole board as a CSV whenever you want." },
    { key: "talent", label: "One talent", blurb: "Everything about one face on a single screen — digitals, measurements, how to reach them, who scouted them, and every step they have taken since." },
] as const

type TabKey = (typeof TABS)[number]["key"]

export function AgencyShowcase() {
    const [tab, setTab] = useState<TabKey>("filter")
    const active = TABS.find((t) => t.key === tab)!

    return (
        <div className="mt-12">
            {/* Tabs */}
            <div
                role="tablist"
                aria-label="What agencies can do"
                className="flex flex-wrap gap-x-6 gap-y-2 border-b border-border pb-3"
            >
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        role="tab"
                        aria-selected={tab === t.key}
                        onClick={() => setTab(t.key)}
                        className={`text-xs font-medium uppercase tracking-[0.1em] transition-colors ${
                            tab === t.key
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <p className="mt-5 max-w-lg text-xs leading-relaxed text-muted-foreground">
                {active.blurb}
            </p>

            {/* Panel */}
            <div className="mt-6 border border-border p-5 sm:p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        {tab === "filter" && <FilterPanel />}
                        {tab === "stages" && <StagesPanel />}
                        {tab === "casting" && <CastingPanel />}
                        {tab === "scouts" && <ScoutsPanel />}
                        {tab === "board" && <BoardPanel />}
                        {tab === "talent" && <TalentPanel />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

// ─── Shared card ──────────────────────────────────────────

function Card({
    applicant,
    selected,
    onSelect,
}: {
    applicant: Applicant
    selected?: boolean
    onSelect?: () => void
}) {
    const body = (
        <>
            <div className="mb-2 flex aspect-4/5 items-end bg-black/[0.04] p-2">
                <span className="text-xs text-foreground/25 font-[family-name:var(--font-libre)]">
                    {applicant.name.charAt(0)}
                </span>
            </div>
            <p className="text-xs font-medium text-foreground">{applicant.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
                {applicant.age} · {applicant.height} cm
            </p>
            <p className="text-xs text-muted-foreground">
                {applicant.city} · {applicant.hair.toLowerCase()}
            </p>
        </>
    )

    if (!onSelect) {
        return <div className="border border-border bg-background p-3">{body}</div>
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

function Control({
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

// ─── 1. Filter ────────────────────────────────────────────

function FilterPanel() {
    const [minHeight, setMinHeight] = useState(170)
    const [maxAge, setMaxAge] = useState(24)
    const [maxWaist, setMaxWaist] = useState(70)
    const [hair, setHair] = useState("Any")
    const [recent, setRecent] = useState(false)
    const [picked, setPicked] = useState<string[]>([])
    const [shortlisted, setShortlisted] = useState(0)

    const matches = useMemo(
        () =>
            APPLICANTS.filter(
                (a) =>
                    a.height >= minHeight &&
                    a.age <= maxAge &&
                    a.waist <= maxWaist &&
                    (hair === "Any" || a.hair === hair) &&
                    (!recent || a.applied <= 30),
            ),
        [minHeight, maxAge, maxWaist, hair, recent],
    )

    // Only ever act on people who still pass the filters
    const selected = picked.filter((id) => matches.some((m) => m.id === id))

    function toggle(id: string) {
        setShortlisted(0)
        setPicked((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
            <div className="space-y-5">
                <Control label="Height from" value={minHeight} min={160} max={190} onChange={setMinHeight} />
                <Control label="Age up to" value={maxAge} min={15} max={30} onChange={setMaxAge} />
                <Control label="Waist up to" value={maxWaist} min={55} max={75} onChange={setMaxWaist} />

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
                        of {APPLICANTS.length} match
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setShortlisted(0)
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
                        <Card
                            key={a.id}
                            applicant={a}
                            selected={selected.includes(a.id)}
                            onSelect={() => toggle(a.id)}
                        />
                    ))}
                    {matches.length === 0 && (
                        <p className="col-span-full py-8 text-center text-xs text-muted-foreground">
                            Nobody matches. Loosen the bar.
                        </p>
                    )}
                </div>

                {/* Filtering has to end in something you can do */}
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                    <button
                        type="button"
                        disabled={selected.length === 0}
                        onClick={() => {
                            setShortlisted(selected.length)
                            setPicked([])
                        }}
                        className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                    >
                        <ListPlus className="h-3 w-3" />
                        Add {selected.length || ""} to shortlist
                    </button>
                    <button
                        type="button"
                        disabled={selected.length === 0}
                        className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground/30 disabled:opacity-40"
                    >
                        <Send className="h-3 w-3" />
                        Invite to casting
                    </button>
                    {shortlisted > 0 ? (
                        <p className="text-xs text-foreground">
                            {shortlisted} added · now in Pre-Select
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

// ─── 2. Stages ────────────────────────────────────────────

const STAGE_COLUMNS = ["Pre-Select", "Scheduled", "Final Voting"] as const

interface Move {
    id: number
    who: string
    to: string
}

function StagesPanel() {
    const [placement, setPlacement] = useState<Record<string, number>>({
        a: 0, b: 0, c: 1, d: 1, e: 2, f: 0,
    })
    const [dragging, setDragging] = useState<string | null>(null)
    const [log, setLog] = useState<Move[]>([])

    function move(id: string, column: number) {
        if (placement[id] === column) return
        const who = APPLICANTS.find((a) => a.id === id)?.name ?? ""
        setPlacement((prev) => ({ ...prev, [id]: column }))
        setLog((prev) =>
            [{ id: Date.now(), who, to: STAGE_COLUMNS[column] }, ...prev].slice(0, 4),
        )
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_240px] lg:gap-10">
            <div>
                {/* Columns scroll rather than crush on a narrow screen */}
                <div className="-mx-1 overflow-x-auto px-1 pb-1">
                    <div className="grid min-w-[420px] grid-cols-3 gap-3">
                        {STAGE_COLUMNS.map((name, column) => (
                            <div
                                key={name}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                    if (dragging) move(dragging, column)
                                    setDragging(null)
                                }}
                                className="min-h-[220px] border border-dashed border-border p-2"
                            >
                                <p className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                    {name}
                                </p>
                                <div className="space-y-2">
                                    {APPLICANTS.filter(
                                        (a) => placement[a.id] === column,
                                    ).map((a) => (
                                        <button
                                            key={a.id}
                                            type="button"
                                            draggable
                                            onDragStart={() => setDragging(a.id)}
                                            onDragEnd={() => setDragging(null)}
                                            onClick={() =>
                                                move(
                                                    a.id,
                                                    (placement[a.id] + 1) %
                                                        STAGE_COLUMNS.length,
                                                )
                                            }
                                            className="flex w-full cursor-pointer items-center gap-1.5 border border-border bg-background p-2 text-left transition-colors hover:border-foreground/30"
                                        >
                                            <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground" />
                                            <span className="text-xs text-foreground">
                                                {a.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="mt-4 text-xs text-muted-foreground">
                    Tap a face to advance it, or drag it anywhere you like.
                </p>
            </div>

            {/* The move is the record */}
            <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    History
                </p>
                {log.length === 0 ? (
                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                        Move someone and it is written down here — every stage a
                        face passes through, who moved them, and when.
                    </p>
                ) : (
                    <ul className="mt-3 border-t border-border">
                        {log.map((m) => (
                            <li
                                key={m.id}
                                className="border-b border-border py-2 text-xs"
                            >
                                <span className="text-foreground">{m.who}</span>
                                <span className="text-muted-foreground">
                                    {" "}
                                    &rarr; {m.to}
                                </span>
                                <span className="mt-0.5 block text-muted-foreground">
                                    by you · just now
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

// ─── 3. Castings ──────────────────────────────────────────

function CastingPanel() {
    const shortlist = APPLICANTS.slice(0, 4)
    const [selected, setSelected] = useState<string[]>([shortlist[0].id, shortlist[2].id])
    const [invited, setInvited] = useState(false)

    function toggle(id: string) {
        setInvited(false)
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )
    }

    return (
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div>
                <p className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Shortlist
                </p>
                <div className="space-y-2">
                    {shortlist.map((a) => {
                        const on = selected.includes(a.id)
                        return (
                            <button
                                key={a.id}
                                type="button"
                                onClick={() => toggle(a.id)}
                                aria-pressed={on}
                                className={`flex w-full items-center gap-2.5 border p-2.5 text-left transition-colors ${
                                    on ? "border-foreground" : "border-border hover:border-foreground/30"
                                }`}
                            >
                                <span
                                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center border ${
                                        on ? "border-foreground bg-foreground" : "border-border"
                                    }`}
                                >
                                    {on && <Check className="h-2.5 w-2.5 text-background" strokeWidth={3} />}
                                </span>
                                <span className="text-xs text-foreground">{a.name}</span>
                                <span className="ml-auto text-xs text-muted-foreground">
                                    {a.height} cm
                                </span>
                            </button>
                        )
                    })}
                </div>
                <button
                    type="button"
                    onClick={() => setInvited(true)}
                    disabled={selected.length === 0}
                    className="mt-4 flex w-full items-center justify-center gap-2 bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                >
                    <Send className="h-3 w-3" />
                    Invite {selected.length || "no one"} to casting
                </button>
            </div>

            <div className="border border-border p-4">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Sent automatically
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Hi <span className="text-foreground">[first name]</span> — we would
                    like to see you at an online casting on{" "}
                    <span className="text-foreground">Thursday 14:00 CET</span>. Join
                    here: <span className="text-foreground">scouting.agency/c/…</span>
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Write it once. Everyone selected gets it, with a reminder the
                    morning of.
                </p>
                {invited && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 border-t border-border pt-3 text-xs text-foreground"
                    >
                        Invited {selected.length}
                        {selected.length === 1 ? " face" : " faces"} · reminders
                        scheduled
                    </motion.p>
                )}
            </div>
        </div>
    )
}

// ─── 4. Scouts ────────────────────────────────────────────

interface ScoutRow {
    name: string
    city: string
    applied: number
    kept: number
    signed: number
    owed: number
}

const SCOUT_ROWS: ScoutRow[] = [
    { name: "Emma", city: "Copenhagen", applied: 58, kept: 22, signed: 3, owed: 600 },
    { name: "Alice", city: "Milan", applied: 34, kept: 9, signed: 1, owed: 200 },
    { name: "Clara", city: "Berlin", applied: 145, kept: 19, signed: 1, owed: 0 },
    { name: "Nora", city: "Budapest", applied: 312, kept: 21, signed: 0, owed: 0 },
]

type SortKey = "applied" | "rate"

function rateOf(s: ScoutRow) {
    return s.kept / s.applied
}

function ScoutsPanel() {
    const [sort, setSort] = useState<SortKey>("rate")

    const rows = useMemo(
        () =>
            [...SCOUT_ROWS].sort((a, b) =>
                sort === "applied" ? b.applied - a.applied : rateOf(b) - rateOf(a),
            ),
        [sort],
    )

    const best = Math.max(...SCOUT_ROWS.map(rateOf))
    const owed = SCOUT_ROWS.reduce((sum, r) => sum + r.owed, 0)

    return (
        <div>
            <p className="mb-5 max-w-lg text-xs leading-relaxed text-muted-foreground">
                Every application remembers the scout whose link it came
                through. So each scout becomes two numbers: how many people
                applied, and how many of those your bookers kept at Pre-Select.
            </p>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-xs">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="py-2 text-left font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                Scout
                            </th>
                            <th className="py-2 text-right">
                                <button
                                    type="button"
                                    onClick={() => setSort("applied")}
                                    aria-pressed={sort === "applied"}
                                    className={`font-medium uppercase tracking-[0.1em] transition-colors ${
                                        sort === "applied"
                                            ? "text-foreground underline underline-offset-4"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Applied
                                </button>
                            </th>
                            <th className="py-2 text-right font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                Kept
                            </th>
                            <th className="py-2 pl-4 text-right">
                                <button
                                    type="button"
                                    onClick={() => setSort("rate")}
                                    aria-pressed={sort === "rate"}
                                    className={`font-medium uppercase tracking-[0.1em] transition-colors ${
                                        sort === "rate"
                                            ? "text-foreground underline underline-offset-4"
                                            : "text-muted-foreground hover:text-foreground"
                                    }`}
                                >
                                    Kept rate
                                </button>
                            </th>
                            <th className="py-2 pl-4 text-right font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                Signed
                            </th>
                            <th className="py-2 pl-4 text-right font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                Owed
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r) => {
                            const rate = rateOf(r)
                            return (
                                <tr key={r.name} className="border-b border-border">
                                    <td className="py-3">
                                        <span className="text-foreground">{r.name}</span>
                                        <span className="mt-0.5 block text-muted-foreground">
                                            {r.city}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right text-foreground">
                                        {r.applied}
                                    </td>
                                    <td className="py-3 text-right text-foreground">
                                        {r.kept}
                                    </td>
                                    <td className="py-3 pl-4 text-right">
                                        <span className="text-foreground">
                                            {Math.round(rate * 100)}%
                                        </span>
                                        <span className="mt-1 block h-[3px] w-full bg-black/[0.06]">
                                            <span
                                                className="block h-full bg-foreground"
                                                style={{ width: `${(rate / best) * 100}%` }}
                                            />
                                        </span>
                                    </td>
                                    <td className="py-3 pl-4 text-right text-foreground">
                                        {r.signed || "—"}
                                    </td>
                                    <td className="py-3 pl-4 text-right text-foreground">
                                        {r.owed ? `€${r.owed}` : "—"}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 border-t border-border pt-5">
                <p className="text-xs text-muted-foreground">
                    Outstanding{" "}
                    <span className="text-foreground">€{owed}</span>
                </p>
                <button
                    type="button"
                    className="border border-border px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground/30"
                >
                    Settle payouts
                </button>
            </div>

            <p className="mt-5 max-w-lg text-xs leading-relaxed text-muted-foreground">
                Nora sent five times what Emma did — 312 applications against
                58 — and your bookers kept one fewer of them. Emma has signed
                three faces this year; Nora none. Anyone can post a link and
                collect volume. The kept rate is what tells you who to pay more,
                and who to coach.
            </p>

            {/* Recruiting the scouts in the first place */}
            <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Hiring scouts
                </p>
                <p className="mt-3 break-all text-sm text-foreground font-[family-name:var(--font-libre)]">
                    scouting.agency/scout/
                    <span className="text-foreground/40">your-agency</span>
                </p>
                <p className="mt-3 max-w-lg text-xs leading-relaxed text-muted-foreground">
                    Share it and anyone can apply to scout for you. Approve them
                    and they get their own link, QR and card the same day — on
                    the bonus arrangement you set.
                </p>
            </div>
        </div>
    )
}

// ─── 5. Board ─────────────────────────────────────────────

function BoardPanel() {
    return (
        <div>
            {/* The board's own address, the way the scout card shows its link */}
            <div className="border-b border-border pb-6">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Your board link
                </p>
                <p className="mt-3 break-all text-sm text-foreground font-[family-name:var(--font-libre)]">
                    scouting.agency/board/
                    <span className="text-foreground/40">your-agency</span>
                </p>
                <p className="mt-3 max-w-lg text-xs leading-relaxed text-muted-foreground">
                    Send it to a client, put it in your bio, or embed the same
                    board in your own website.
                </p>
            </div>

            <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_260px] lg:gap-10">
                <div>
                    <p className="mb-3 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                        On the board
                    </p>
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {APPLICANTS.slice(0, 4).map((a) => (
                            <Card key={a.id} applicant={a} />
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 border border-border px-3 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground/30"
                    >
                        <Download className="h-3 w-3" />
                        Talent as PDF
                    </button>
                    <button
                        type="button"
                        className="flex w-full items-center gap-2 border border-border px-3 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground/30"
                    >
                        <Download className="h-3 w-3" />
                        Roster as CSV
                    </button>
                    <div className="border-t border-border pt-4">
                        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                            Embed on your site
                        </p>
                        <pre className="mt-2 overflow-x-auto border border-border bg-black/[0.03] p-2.5 text-[10px] leading-relaxed text-muted-foreground">
{`<iframe src="scouting
  .agency/board/your-agency" />`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── 6. One talent ────────────────────────────────────────

const DIGITALS = ["Headshot", "Profile left", "Profile right", "Full body"]

const TALENT = {
    name: "Mira S.",
    age: 19,
    height: 181,
    bust: 80,
    waist: 59,
    hips: 87,
    shoe: 40,
    hair: "Brown",
    eyes: "Green",
    city: "Prague",
    country: "Czechia",
    email: "mira.s@example.com",
    phone: "+420 601 234 567",
    instagram: "@mira.s",
    portfolio: "drive.google.com/…",
    scout: "Peter",
    scoutLink: "scouting.agency/s/peter",
    stage: "Final Voting",
    votesYes: 4,
    votesOf: 5,
    history: [
        { label: "Applied", when: "4 Mar" },
        { label: "Pre-Select", when: "6 Mar" },
        { label: "Casting attended", when: "12 Mar" },
        { label: "Final Voting", when: "14 Mar" },
    ],
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-4 py-1.5">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="break-all text-right text-xs text-foreground">
                {value}
            </span>
        </div>
    )
}

function InfoGroup({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="border-t border-border pt-4">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {title}
            </p>
            {children}
        </div>
    )
}

function TalentPanel() {
    const [shot, setShot] = useState(0)

    return (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-10">
            {/* Digitals */}
            <div>
                <div className="flex aspect-4/5 items-end bg-black/[0.04] p-3">
                    <span className="text-xs uppercase tracking-[0.1em] text-foreground/30">
                        {DIGITALS[shot]}
                    </span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-2">
                    {DIGITALS.map((label, i) => (
                        <button
                            key={label}
                            type="button"
                            onClick={() => setShot(i)}
                            aria-label={label}
                            aria-pressed={shot === i}
                            className={`aspect-4/5 border transition-colors ${
                                shot === i
                                    ? "border-foreground bg-black/[0.06]"
                                    : "border-border bg-black/[0.03] hover:border-foreground/30"
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Everything else */}
            <div>
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3 className="text-2xl leading-none text-foreground font-[family-name:var(--font-libre)]">
                        {TALENT.name}
                    </h3>
                    <span className="border border-foreground px-2 py-1 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        {TALENT.stage}
                    </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    {TALENT.age} · {TALENT.city}, {TALENT.country}
                </p>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-x-10">
                    <InfoGroup title="Measurements">
                        <InfoRow label="Height" value={`${TALENT.height} cm`} />
                        <InfoRow
                            label="Bust · Waist · Hips"
                            value={`${TALENT.bust} · ${TALENT.waist} · ${TALENT.hips}`}
                        />
                        <InfoRow label="Shoe" value={`${TALENT.shoe} EU`} />
                        <InfoRow label="Hair · Eyes" value={`${TALENT.hair} · ${TALENT.eyes}`} />
                    </InfoGroup>

                    <InfoGroup title="Contact">
                        <InfoRow label="Email" value={TALENT.email} />
                        <InfoRow label="Phone" value={TALENT.phone} />
                        <InfoRow label="Instagram" value={TALENT.instagram} />
                        <InfoRow label="Book" value={TALENT.portfolio} />
                    </InfoGroup>

                    <InfoGroup title="Where she came from">
                        <InfoRow label="Scouted by" value={TALENT.scout} />
                        <InfoRow label="Through" value={TALENT.scoutLink} />
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            Credited automatically. If she signs, the payout
                            follows this line.
                        </p>
                    </InfoGroup>

                    <InfoGroup title="History">
                        {TALENT.history.map((step) => (
                            <InfoRow
                                key={step.label}
                                label={step.label}
                                value={step.when}
                            />
                        ))}
                        <p className="mt-2 text-xs text-foreground">
                            Board vote: {TALENT.votesYes} of {TALENT.votesOf} yes
                        </p>
                    </InfoGroup>
                </div>

                <div className="mt-7 flex flex-wrap gap-3 border-t border-border pt-5">
                    <button
                        type="button"
                        className="bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90"
                    >
                        Move to Onboarding
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground/30"
                    >
                        <Download className="h-3 w-3" />
                        Export as PDF
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-2 border border-border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.1em] text-foreground transition-colors hover:border-foreground/30"
                    >
                        <Send className="h-3 w-3" />
                        Submit to client
                    </button>
                </div>
            </div>
        </div>
    )
}
