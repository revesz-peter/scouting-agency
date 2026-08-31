"use client"

import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Download, GripVertical, ListPlus, Send } from "lucide-react"
import { AGENCIES } from "@/lib/agencies"

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
    { key: "links", label: "Links & QR", blurb: "Every scout gets a link, a QR code, and a business card that carries it. Print it, hand it out on the street, and the applications arrive credited." },
    { key: "board", label: "Board", blurb: "Your roster, hosted here and embedded on your own site. Export a talent as a PDF or the whole board as a CSV whenever you want." },
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
                        {tab === "links" && <LinksPanel />}
                        {tab === "board" && <BoardPanel />}
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

function StagesPanel() {
    const [placement, setPlacement] = useState<Record<string, number>>({
        a: 0, b: 0, c: 1, d: 1, e: 2, f: 0,
    })
    const [dragging, setDragging] = useState<string | null>(null)

    function move(id: string, column: number) {
        setPlacement((prev) => ({ ...prev, [id]: column }))
    }

    return (
        <div>
            <div className="grid grid-cols-3 gap-3">
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
                            {APPLICANTS.filter((a) => placement[a.id] === column).map((a) => (
                                <div
                                    key={a.id}
                                    draggable
                                    onDragStart={() => setDragging(a.id)}
                                    onDragEnd={() => setDragging(null)}
                                    onClick={() =>
                                        move(a.id, (placement[a.id] + 1) % STAGE_COLUMNS.length)
                                    }
                                    className="flex cursor-grab items-center gap-1.5 border border-border bg-background p-2 active:cursor-grabbing"
                                >
                                    <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground" />
                                    <span className="text-xs text-foreground">{a.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
                Drag a card between columns — or tap one to advance it.
            </p>
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

// ─── 4. Links & QR ────────────────────────────────────────

/** Deterministic QR-style block. Illustrative, not a scannable code. */
function QrBlock({ seed, className = "" }: { seed: string; className?: string }) {
    const cells = 21
    const filled = useMemo(() => {
        let h = 0
        for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
        const out: boolean[] = []
        for (let i = 0; i < cells * cells; i++) {
            h = (h * 1103515245 + 12345) | 0
            out.push(((h >> 16) & 1) === 1)
        }
        return out
    }, [seed])

    const isFinder = (x: number, y: number) =>
        (x < 7 && y < 7) || (x > cells - 8 && y < 7) || (x < 7 && y > cells - 8)

    return (
        <svg viewBox={`0 0 ${cells} ${cells}`} className={className} aria-hidden>
            <rect width={cells} height={cells} fill="#fff" />
            {Array.from({ length: cells * cells }).map((_, i) => {
                const x = i % cells
                const y = Math.floor(i / cells)
                if (isFinder(x, y)) return null
                return filled[i] ? (
                    <rect key={i} x={x} y={y} width={1} height={1} fill="#000" />
                ) : null
            })}
            {[[0, 0], [cells - 7, 0], [0, cells - 7]].map(([fx, fy]) => (
                <g key={`${fx}-${fy}`}>
                    <rect x={fx} y={fy} width={7} height={7} fill="#000" />
                    <rect x={fx + 1} y={fy + 1} width={5} height={5} fill="#fff" />
                    <rect x={fx + 2} y={fy + 2} width={3} height={3} fill="#000" />
                </g>
            ))}
        </svg>
    )
}

const CARD_DESIGNS = [
    { key: "plain", label: "Plain" },
    { key: "inverted", label: "Inverted" },
    { key: "rule", label: "Rule" },
    { key: "editorial", label: "Editorial" },
] as const

type CardDesign = (typeof CARD_DESIGNS)[number]["key"]

function slugify(value: string) {
    return (
        value
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "") || "your-name"
    )
}

interface CardProps {
    design: CardDesign
    name: string
    title: string
    agency: string
    city: string
    code: string
}

/** Oversized initial bleeding off the card — the editorial design's anchor. */
function Watermark({ letter, dark }: { letter: string; dark: boolean }) {
    return (
        <span
            aria-hidden
            className={`pointer-events-none absolute -bottom-8 -right-2 select-none text-[8rem] leading-none font-[family-name:var(--font-libre)] ${
                dark ? "text-background/10" : "text-foreground/[0.07]"
            }`}
        >
            {letter}
        </span>
    )
}

function CardFront({ design, name, title, agency, city }: CardProps) {
    const dark = design === "inverted"
    const editorial = design === "editorial"
    const displayName = name.trim() || "Your name"
    const sub = [title.trim() || "Scout", agency, city.trim()]
        .filter(Boolean)
        .join(" · ")

    return (
        <div
            className={`relative flex aspect-[85/55] w-full max-w-[280px] flex-col justify-between overflow-hidden p-4 ${
                dark
                    ? "bg-foreground text-background"
                    : "border border-border bg-background"
            }`}
        >
            {design === "rule" && (
                <div className="-mx-4 -mt-4 mb-3 h-1.5 bg-foreground" />
            )}
            {editorial && (
                <Watermark letter={displayName.charAt(0).toUpperCase()} dark={false} />
            )}

            <p
                className={`relative text-xs font-bold uppercase tracking-[0.25em] ${
                    dark ? "text-background/70" : "text-black/60"
                }`}
            >
                scouting.
            </p>

            <div className="relative">
                <p
                    className={`text-base leading-tight font-[family-name:var(--font-libre)] ${
                        dark ? "text-background" : "text-foreground"
                    }`}
                >
                    {displayName}
                </p>
                <p
                    className={`mt-1 text-xs leading-relaxed ${
                        dark ? "text-background/60" : "text-muted-foreground"
                    }`}
                >
                    {sub}
                </p>
            </div>
        </div>
    )
}

function CardBack({ design, name, code }: CardProps) {
    const dark = design === "inverted" || design === "editorial"
    const url = `scouting.agency/s/${code}`

    return (
        <div
            className={`relative flex aspect-[85/55] w-full max-w-[280px] flex-col items-center justify-center gap-2.5 overflow-hidden p-4 ${
                dark
                    ? "bg-foreground text-background"
                    : "border border-border bg-background"
            }`}
        >
            {design === "rule" && (
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-foreground" />
            )}
            {design === "editorial" && (
                <Watermark
                    letter={(name.trim() || "Y").charAt(0).toUpperCase()}
                    dark
                />
            )}

            <div className={`relative ${dark ? "bg-background p-1.5" : ""}`}>
                <QrBlock seed={code} className="h-16 w-16" />
            </div>
            <p
                className={`relative break-all text-center text-xs leading-relaxed ${
                    dark ? "text-background/70" : "text-muted-foreground"
                }`}
            >
                {url}
            </p>
        </div>
    )
}

function LinksPanel() {
    const [name, setName] = useState("Peter")
    const [title, setTitle] = useState("Scout")
    const [agency, setAgency] = useState("")
    const [city, setCity] = useState("Budapest")
    const [design, setDesign] = useState<CardDesign>("plain")
    const code = slugify(name)

    return (
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
            <div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <CardField label="Name" value={name} onChange={setName} />
                    <CardField
                        label="Title"
                        value={title}
                        onChange={setTitle}
                        placeholder="Scout"
                    />
                    <CardField label="City" value={city} onChange={setCity} />
                    <label className="block sm:col-span-2">
                        <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                            Agency
                        </span>
                        <select
                            value={agency}
                            onChange={(e) => setAgency(e.target.value)}
                            className="mt-1.5 w-full appearance-none rounded-none border-b border-border bg-transparent py-1.5 text-xs outline-none transition-colors focus:border-foreground/30"
                        >
                            <option value="">No agency</option>
                            {AGENCIES.map((a) => (
                                <option key={a.slug} value={a.name}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                        <span className="mt-1.5 block text-xs text-muted-foreground">
                            The agencies that invited you — or none, and the
                            card is just yours.
                        </span>
                    </label>
                </div>

                <div className="mt-6">
                    <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                        Design
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                        {CARD_DESIGNS.map((d) => (
                            <button
                                key={d.key}
                                type="button"
                                onClick={() => setDesign(d.key)}
                                aria-pressed={design === d.key}
                                className={`border px-3 py-1.5 text-xs transition-colors ${
                                    design === d.key
                                        ? "border-foreground bg-foreground text-background"
                                        : "border-border text-muted-foreground hover:border-foreground/30"
                                }`}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="mt-6 break-all border-t border-border pt-5 text-sm text-foreground font-[family-name:var(--font-libre)]">
                    scouting.agency/s/<span className="text-foreground/40">{code}</span>
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    The link, the QR, and the card are one thing. Print the card,
                    hand it to someone on the street, and their application
                    arrives credited to you — at the agency you picked, or
                    across the whole network if you pick none.
                </p>
            </div>

            <div className="flex flex-col items-center gap-5 bg-black/[0.03] p-6">
                {(
                    [
                        ["Front", CardFront],
                        ["Back", CardBack],
                    ] as const
                ).map(([label, Face]) => (
                    <div key={label} className="w-full max-w-[280px]">
                        <p className="mb-1.5 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                            {label}
                        </p>
                        <Face
                            design={design}
                            name={name}
                            title={title}
                            agency={agency}
                            city={city}
                            code={code}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

function CardField({
    label,
    value,
    onChange,
    placeholder,
}: {
    label: string
    value: string
    onChange: (v: string) => void
    placeholder?: string
}) {
    return (
        <label className="block">
            <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </span>
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="mt-1.5 w-full border-b border-border bg-transparent py-1.5 text-xs outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-foreground/30"
            />
        </label>
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
                    board in your own website. Sign a face on Monday and every
                    one of those is current on Monday.
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
