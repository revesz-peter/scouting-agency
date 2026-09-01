"use client"

import { useMemo, useState } from "react"
import qrcode from "qrcode-generator"

/**
 * Sample names for the card preview on the marketing page. This is a designer
 * demo, not a directory — a client component cannot read the real agencies, and
 * showing them here would be beside the point.
 */
const SAMPLE_AGENCIES = [
    "OMG Model Management",
    "Visage Models",
    "Attitude Management",
]

/** A real, scannable QR code rendered as SVG rectangles. */
function QrBlock({ value, className = "" }: { value: string; className?: string }) {
    const { cells, dark } = useMemo(() => {
        // Type 0 picks the smallest version that fits; M survives a reprint.
        const qr = qrcode(0, "M")
        qr.addData(value)
        qr.make()
        const count = qr.getModuleCount()
        const on: [number, number][] = []
        for (let row = 0; row < count; row++) {
            for (let col = 0; col < count; col++) {
                if (qr.isDark(row, col)) on.push([col, row])
            }
        }
        return { cells: count, dark: on }
    }, [value])

    // A quiet zone is part of the spec — without it scanners struggle.
    const quiet = 2
    const size = cells + quiet * 2

    return (
        <svg
            viewBox={`0 0 ${size} ${size}`}
            className={className}
            role="img"
            aria-label={`QR code for ${value}`}
        >
            <rect width={size} height={size} fill="#fff" />
            {dark.map(([x, y]) => (
                <rect
                    key={`${x}-${y}`}
                    x={x + quiet}
                    y={y + quiet}
                    width={1}
                    height={1}
                    fill="#000"
                />
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

/** Where the demo card's QR actually goes — a live page, so it scans. */
const QR_TARGET = "https://scouting.agency/apply"

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
                <QrBlock value={QR_TARGET} className="h-16 w-16" />
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

export function ScoutCardDesigner() {
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
                            {SAMPLE_AGENCIES.map((a) => (
                                <option key={a} value={a}>
                                    {a}
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
                <p className="w-full max-w-[280px] text-xs leading-relaxed text-muted-foreground">
                    The code is live — scan it with your phone.
                </p>
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
