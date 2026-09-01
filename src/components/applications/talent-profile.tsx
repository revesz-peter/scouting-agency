import Link from "next/link"

import { Digitals } from "@/components/applications/digitals"
import { STAGES } from "@/lib/pipeline"
import type { ApplicationProfile } from "@/lib/applications"
import { siteLink } from "@/lib/site"

/** Stage ids in the order STAGES declares them. */
export const STAGE_IDS = [
    "applied",
    "pre_select",
    "scheduled",
    "final_voting",
    "onboarding",
    "on_board",
] as const

export function stageName(id: string | null): string {
    const i = STAGE_IDS.indexOf(id as (typeof STAGE_IDS)[number])
    return i === -1 ? (id ?? "—") : STAGES[i].name
}

/**
 * One person on a single screen — digitals, measurements, how to reach them,
 * who scouted them, and every step they have taken since.
 *
 * The same structure serves an applicant sitting in the first column and a
 * talent on the board: it is one record either way, and the only thing that
 * changes is what you can do to it from here.
 */
export function TalentProfile({
    application,
    actions,
}: {
    application: ApplicationProfile
    /** What this viewer can do — an agency moves stages, a scout sends. */
    actions?: React.ReactNode
}) {
    const a = application
    const handle = a.instagram?.replace(/^@/, "")

    return (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-10">
            <Digitals name={a.name} />

            <div className="min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h1 className="text-2xl leading-none text-foreground font-[family-name:var(--font-libre)]">
                        {a.name}
                    </h1>
                    <span className="border border-foreground px-2 py-1 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        {a.sent ? stageName(a.stage) : "With the scout"}
                    </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                    {a.age} · {a.city}, {a.country}
                </p>

                <div className="mt-6 grid gap-6 sm:grid-cols-2 sm:gap-x-10">
                    <Group title="Measurements">
                        <Row label="Height" value={`${a.height} cm`} />
                        <Row
                            label="Bust · Waist · Hips"
                            value={`${a.bust} · ${a.waist} · ${a.hips}`}
                        />
                        <Row label="Shoe" value={`${a.shoe} EU`} />
                        <Row label="Hair · Eyes" value={`${a.hair} · ${a.eyes}`} />
                        <Row label="Born" value={a.dob} />
                        <Row label="Gender" value={a.gender} />
                    </Group>

                    <Group title="Contact">
                        <Row
                            label="Email"
                            value={
                                <a
                                    href={`mailto:${a.email}`}
                                    className="break-all underline underline-offset-4"
                                >
                                    {a.email}
                                </a>
                            }
                        />
                        <Row
                            label="Phone"
                            value={
                                <a
                                    href={`tel:${a.phone}`}
                                    className="underline underline-offset-4"
                                >
                                    {a.phone}
                                </a>
                            }
                        />
                        {handle && (
                            <Row
                                label="Instagram"
                                value={
                                    <a
                                        href={`https://instagram.com/${handle}`}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="underline underline-offset-4"
                                    >
                                        @{handle}
                                    </a>
                                }
                            />
                        )}
                        {a.videoLink && (
                            <Row
                                label="Video"
                                value={
                                    <a
                                        href={a.videoLink}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="break-all underline underline-offset-4"
                                    >
                                        {a.videoLink}
                                    </a>
                                }
                            />
                        )}
                        {a.portfolioLink && (
                            <Row
                                label="Book"
                                value={
                                    <a
                                        href={a.portfolioLink}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        className="break-all underline underline-offset-4"
                                    >
                                        {a.portfolioLink}
                                    </a>
                                }
                            />
                        )}
                    </Group>

                    <Group title="Where they came from">
                        {a.scout ? (
                            <>
                                <Row label="Scouted by" value={a.scout} />
                                {a.scoutCode && (
                                    <Row
                                        label="Through"
                                        value={siteLink(`/s/${a.scoutCode}`)}
                                    />
                                )}
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                    Credited automatically. If they sign, the
                                    payout follows this line.
                                </p>
                            </>
                        ) : (
                            <>
                                <Row
                                    label="Through"
                                    value={siteLink(`/apply/${a.agencySlug}`)}
                                />
                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                    Applied directly, so nobody is credited.
                                </p>
                            </>
                        )}
                    </Group>

                    <Group title="History">
                        {a.events.map((e, i) => (
                            <Row
                                key={`${e.at}-${i}`}
                                label={
                                    e.kind === "applied"
                                        ? "Applied"
                                        : e.kind === "sent_on"
                                          ? "Sent on"
                                          : stageName(e.stage)
                                }
                                value={
                                    <>
                                        {new Date(e.at).toLocaleDateString(
                                            "en-GB",
                                            { day: "numeric", month: "short" },
                                        )}
                                        {e.actor && (
                                            <span className="ml-2 text-muted-foreground">
                                                {e.actor}
                                            </span>
                                        )}
                                    </>
                                }
                            />
                        ))}
                        {/* Voting is not built, so there is no vote to show —
                            better an absent panel than an invented tally. */}
                    </Group>
                </div>

                {a.notes && (
                    <div className="mt-6">
                        <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                            What they wrote
                        </p>
                        <p className="mt-2 max-w-prose text-xs leading-relaxed text-foreground">
                            {a.notes}
                        </p>
                    </div>
                )}

                {actions && (
                    <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-border pt-5">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}

function Group({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div>
            <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {title}
            </p>
            <dl className="mt-2 space-y-1">{children}</dl>
        </div>
    )
}

function Row({
    label,
    value,
}: {
    label: string
    value: React.ReactNode
}) {
    return (
        <div className="flex gap-3 text-xs">
            <dt className="w-32 shrink-0 text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-foreground">{value}</dd>
        </div>
    )
}

/** A link back to wherever this was opened from. */
export function BackLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            className="text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
        >
            ← {label}
        </Link>
    )
}
