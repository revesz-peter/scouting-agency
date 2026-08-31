"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Check, Send } from "lucide-react"
import { ScoutCardDesigner } from "@/components/scout-card-designer"

const TABS = [
    { key: "card", label: "Card & QR", blurb: "Your link, your QR, and a card that carries both. Anyone who applies through any of them is credited to you." },
    { key: "applicants", label: "Applicants", blurb: "Everyone who came through your link, and how far they got. Send the agency the ones worth their time — your kept rate is what they judge you on." },
    { key: "payouts", label: "My earnings", blurb: "What happened to the faces you sent on, and what you were paid for them — a fee when they sign, then a share for as long as they stay." },
] as const

type TabKey = (typeof TABS)[number]["key"]

export function ScoutShowcase() {
    const [tab, setTab] = useState<TabKey>("card")
    const active = TABS.find((t) => t.key === tab)!

    return (
        <div>
            <div
                role="tablist"
                aria-label="What scouts get"
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

            <div className="mt-6 border border-border p-5 sm:p-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={tab}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                    >
                        {tab === "card" && <ScoutCardDesigner />}
                        {tab === "applicants" && <ApplicantsPanel />}
                        {tab === "payouts" && <PayoutsPanel />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}

// ─── Shared ───────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="border-t border-border pt-3">
            <p className="text-lg leading-none text-foreground font-[family-name:var(--font-libre)]">
                {value}
            </p>
            <p className="mt-1.5 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </p>
        </div>
    )
}

// ─── Applicants ───────────────────────────────────────────

interface Lead {
    id: string
    name: string
    age: number
    height: number
    city: string
    /** Already passed on to the agency. */
    sent: boolean
}

const FUNNEL = [
    { label: "Opened", value: 1240 },
    { label: "Applied", value: 94 },
    { label: "Sent on", value: 61 },
]

const LEADS: Lead[] = [
    { id: "1", name: "Mira S.", age: 19, height: 181, city: "Prague", sent: true },
    { id: "2", name: "Tessa M.", age: 22, height: 183, city: "Berlin", sent: true },
    { id: "3", name: "Lena V.", age: 21, height: 174, city: "Warsaw", sent: false },
    { id: "4", name: "Nadia R.", age: 24, height: 169, city: "Vienna", sent: false },
    { id: "5", name: "Sofia B.", age: 18, height: 176, city: "Milan", sent: false },
]

function ApplicantsPanel() {
    const [picked, setPicked] = useState<string[]>([])
    const [submitted, setSubmitted] = useState(0)

    const waiting = LEADS.filter((l) => !l.sent)

    function toggle(id: string) {
        setSubmitted(0)
        setPicked((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        )
    }

    return (
        <div>
            <div className="space-y-4">
                {FUNNEL.map((step, i) => {
                    const previous = FUNNEL[i - 1]
                    return (
                        <div key={step.label}>
                            <div className="flex items-baseline justify-between gap-4">
                                <span className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                    {step.label}
                                </span>
                                <span className="text-xs text-foreground">
                                    {step.value.toLocaleString("en-GB")}
                                    {previous && (
                                        <span className="ml-2 text-muted-foreground">
                                            {Math.round(
                                                (step.value / previous.value) * 100,
                                            )}
                                            % of {previous.label.toLowerCase()}
                                        </span>
                                    )}
                                </span>
                            </div>
                            <span className="mt-1.5 block h-1.5 w-full bg-black/[0.06]">
                                <span
                                    className="block h-full bg-foreground"
                                    style={{
                                        width: `${(step.value / FUNNEL[0].value) * 100}%`,
                                    }}
                                />
                            </span>
                        </div>
                    )
                })}
            </div>
            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                Most people who open a link never finish an application. Watching
                where the drop happens tells you which post, and which pitch,
                actually worked.
            </p>

            <div className="mt-8 border-t border-border pt-6">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Waiting on you
                </p>
                <p className="mt-2 max-w-lg text-xs leading-relaxed text-muted-foreground">
                    Nothing goes to the agency until you send it. Look first —
                    everything you pass on counts towards your kept rate.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {waiting.map((lead) => {
                        const on = picked.includes(lead.id)
                        return (
                            <button
                                key={lead.id}
                                type="button"
                                onClick={() => toggle(lead.id)}
                                aria-pressed={on}
                                className={`relative border bg-background p-3 text-left transition-colors ${
                                    on
                                        ? "border-foreground"
                                        : "border-border hover:border-foreground/30"
                                }`}
                            >
                                <span
                                    className={`absolute right-4 top-4 flex h-4 w-4 items-center justify-center border ${
                                        on
                                            ? "border-foreground bg-foreground"
                                            : "border-border bg-background/80"
                                    }`}
                                >
                                    {on && (
                                        <Check
                                            className="h-2.5 w-2.5 text-background"
                                            strokeWidth={3}
                                        />
                                    )}
                                </span>
                                <span className="mb-2 flex aspect-4/5 items-end bg-black/[0.04] p-2">
                                    <span className="text-xs text-foreground/25 font-[family-name:var(--font-libre)]">
                                        {lead.name.charAt(0)}
                                    </span>
                                </span>
                                <span className="block text-xs font-medium text-foreground">
                                    {lead.name}
                                </span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                    {lead.age} · {lead.height} cm
                                </span>
                                <span className="block text-xs text-muted-foreground">
                                    {lead.city}
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                    <button
                        type="button"
                        disabled={picked.length === 0}
                        onClick={() => {
                            setSubmitted(picked.length)
                            setPicked([])
                        }}
                        className="flex items-center gap-2 bg-foreground px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                    >
                        <Send className="h-3 w-3" />
                        Send {picked.length || ""} to the agency
                    </button>
                    {submitted > 0 && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-foreground"
                        >
                            {submitted} sent · now in their Applied column
                        </motion.p>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Earnings data ────────────────────────────────────────

interface Scouted {
    name: string
    when: string
    status: string
    /** Still generating an ongoing share. */
    earning: boolean
}

const SCOUTED: Scouted[] = [
    { name: "Mira S.", when: "Signed Mar 2026", status: "On the board", earning: true },
    { name: "Tessa M.", when: "Signed May 2026", status: "On the board", earning: true },
    { name: "Anna K.", when: "Signed Jan 2026", status: "Left the board", earning: false },
    { name: "Sofia B.", when: "Sent Aug 2026", status: "Final Voting", earning: false },
    { name: "Lena V.", when: "Sent Jul 2026", status: "Pre-Select", earning: false },
    { name: "Nadia R.", when: "Sent Jun 2026", status: "Not taken", earning: false },
]

// ─── My earnings ──────────────────────────────────────────

const SIGNING_BONUS = 100
const FIRST_JOB_BONUS = 100
const ONGOING_SHARE = 20

const ARRANGEMENT = [
    {
        label: "Signing bonus",
        value: `${SIGNING_BONUS} USD`,
        note: "When a model joins the board",
    },
    {
        label: "First job bonus",
        value: `${FIRST_JOB_BONUS} USD`,
        note: "On the model's first job",
    },
    {
        label: "Total fixed",
        value: `${SIGNING_BONUS + FIRST_JOB_BONUS} USD`,
        note: "Signing + first job",
    },
    {
        label: "Ongoing share",
        value: `${ONGOING_SHARE}%`,
        note: "Of the agency's commission, for as long as they work",
    },
]

interface Entry {
    kind: string
    talent: string
    when: string
    amount: number
    paid: boolean
}

const ENTRIES: Entry[] = [
    { kind: "Signing bonus", talent: "Mira S.", when: "12 Mar 2026", amount: 100, paid: true },
    { kind: "First job bonus", talent: "Mira S.", when: "4 Apr 2026", amount: 100, paid: true },
    { kind: "Ongoing share", talent: "Mira S.", when: "Aug 2026", amount: 84, paid: false },
]

function PayoutsPanel() {
    const total = (paid: boolean) =>
        ENTRIES.filter((e) => e.paid === paid).reduce((sum, e) => sum + e.amount, 0)

    const sentOn = 61
    const signed = SCOUTED.filter((x) => x.when.startsWith("Signed")).length
    const onBoard = SCOUTED.filter((x) => x.earning).length

    return (
        <div>
        {/* What happened to them */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            <Stat label="Sent on" value={String(sentOn)} />
            <Stat label="Signed" value={String(signed)} />
            <Stat label="On the board" value={String(onBoard)} />
            <Stat
                label="Still there"
                value={`${Math.round((onBoard / signed) * 100)}%`}
            />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {SCOUTED.map((x) => (
                <div
                    key={x.name}
                    className={`border p-3 ${
                        x.earning ? "border-foreground" : "border-border"
                    }`}
                >
                    <div className="mb-2 flex aspect-4/5 items-end bg-black/[0.04] p-2">
                        <span className="text-xs text-foreground/25 font-[family-name:var(--font-libre)]">
                            {x.name.charAt(0)}
                        </span>
                    </div>
                    <p className="text-xs font-medium text-foreground">{x.name}</p>
                    <p
                        className={`mt-0.5 text-xs ${
                            x.earning ? "text-foreground" : "text-muted-foreground"
                        }`}
                    >
                        {x.status}
                    </p>
                </div>
            ))}
        </div>

        <div className="mt-10 grid gap-8 border-t border-border pt-8 lg:grid-cols-[1fr_240px] lg:gap-12">
            <div>
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    My bonus arrangement
                </p>
                <dl className="mt-4 border-t border-border">
                    {ARRANGEMENT.map((row) => (
                        <div
                            key={row.label}
                            className="flex items-baseline justify-between gap-6 border-b border-border py-3"
                        >
                            <div className="min-w-0">
                                <dt className="text-xs text-foreground">
                                    {row.label}
                                </dt>
                                <dd className="mt-0.5 text-xs text-muted-foreground">
                                    {row.note}
                                </dd>
                            </div>
                            <span className="shrink-0 text-sm text-foreground font-[family-name:var(--font-libre)]">
                                {row.value}
                            </span>
                        </div>
                    ))}
                </dl>
                <p className="mt-4 max-w-lg text-xs leading-relaxed text-muted-foreground">
                    Set by the agency when they invite you, and visible here
                    from the day you start.
                </p>
            </div>

            <div className="space-y-5">
                <Stat label="Pending" value={`${total(false)} USD`} />
                <Stat label="Paid" value={`${total(true)} USD`} />
                <p className="text-xs leading-relaxed text-muted-foreground">
                    Pending is earned but not yet released. Paid is what has
                    reached you.
                </p>
            </div>
        </div>

        {/* Every line that made up those two numbers */}
        <div className="mt-8 border-t border-border pt-5">
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Every line
            </p>
            <ul className="mt-3 border-t border-border">
                {ENTRIES.map((e, i) => (
                    <li
                        key={`${e.kind}-${e.talent}-${i}`}
                        className="flex items-baseline justify-between gap-4 border-b border-border py-2 text-xs"
                    >
                        <span className="min-w-0 truncate text-foreground">
                            {e.kind} · {e.talent}
                        </span>
                        <span className="flex shrink-0 items-baseline gap-4 text-muted-foreground">
                            <span>{e.when}</span>
                            <span>{e.paid ? "Paid" : "Pending"}</span>
                            <span className="w-16 text-right text-foreground">
                                {e.amount} USD
                            </span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
        </div>
    )
}
