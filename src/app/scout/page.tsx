import Link from "next/link"
import type { Metadata } from "next"

import { CopyButton } from "@/components/copy-button"
import { requireMember } from "@/lib/auth/membership"
import { sql } from "@/lib/db"
import { siteLink, siteUrl } from "@/lib/site"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Scout workspace",
    robots: { index: false, follow: false },
}

export default async function ScoutWorkspace() {
    const { scout, memberships } = await requireMember()

    // Staff are members too. Someone who runs an agency is not automatically a
    // scout, so offer the link rather than marching them through onboarding.
    if (!scout) return <NoScoutProfile agencies={memberships.length} />

    const rows = (await sql`
        SELECT
            count(*)::int AS applied,
            count(*) FILTER (WHERE stage <> 'applied')::int AS kept,
            count(*) FILTER (WHERE stage = 'on_board')::int AS signed
        FROM public.application
        WHERE scout_id = ${scout.id}
    `) as { applied: number; kept: number; signed: number }[]

    const stats = rows[0]

    return (
        <div className="mx-auto w-full max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Scout
            </p>
            <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                {scout.displayName}
            </h1>

            <section className="mt-10 border-t border-border pt-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Your link
                </h2>
                <p className="mt-2 flex items-center gap-2">
                    <span className="min-w-0 truncate text-sm text-foreground">
                        {siteLink(`/s/${scout.code}`)}
                    </span>
                    <CopyButton
                        value={siteUrl(`/s/${scout.code}`)}
                        label="Copy your scout link"
                    />
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    Everyone who applies through it is credited to you — through
                    pre-select, the board vote, and signing.
                </p>
            </section>

            <dl className="mt-10 grid grid-cols-3 border-t border-border pt-6">
                <Stat label="Applied" value={stats.applied} />
                <Stat label="Kept" value={stats.kept} />
                <Stat label="Signed" value={stats.signed} />
            </dl>

            <section className="mt-10 border-t border-border pt-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Scouting for
                </h2>
                <ul className="mt-3 space-y-2">
                    {memberships.map((m) => (
                        <li key={m.organizationId} className="text-sm text-foreground">
                            {m.name}
                            {(m.role === "owner" || m.role === "admin") && (
                                <Link
                                    href={`/agency/${m.slug}`}
                                    className="ml-3 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                                >
                                    Dashboard
                                </Link>
                            )}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}

function NoScoutProfile({ agencies }: { agencies: number }) {
    return (
        <div className="mx-auto w-full max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Scout
            </p>
            <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                Scout as well?
            </h1>
            <p className="mt-4 max-w-prose text-xs leading-relaxed text-muted-foreground">
                Running an agency does not make you a scout. Take a scout link
                and applications through it are credited to you at{" "}
                {agencies === 1 ? "your agency" : "the agencies you belong to"} —
                the same as anyone else on the roster. Leave it and nothing
                changes.
            </p>
            <Link
                href="/onboarding/scout"
                className="mt-8 inline-block bg-foreground px-6 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90"
            >
                Get a scout link
            </Link>
        </div>
    )
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 text-2xl text-foreground font-[family-name:var(--font-libre)]">
                {value}
            </dd>
        </div>
    )
}
