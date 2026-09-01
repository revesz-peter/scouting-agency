import type { Metadata } from "next"

import { InviteScout } from "@/components/agency/invite-scout"
import { ScoutApplications } from "@/components/agency/scout-applications"
import { CopyButton } from "@/components/copy-button"
import { requireAgency } from "@/lib/auth/membership"
import { sql } from "@/lib/db"
import { siteLink, siteUrl } from "@/lib/site"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Scouts",
    robots: { index: false, follow: false },
}

interface RosterRow {
    memberId: string
    name: string
    email: string
    role: string
    code: string | null
    applied: number
    kept: number
}

interface PendingRow {
    id: string
    name: string
    email: string
    city: string | null
    country: string | null
    message: string | null
}

export default async function AgencyScouts({
    params,
}: PageProps<"/agency/[slug]/scouts">) {
    const { slug } = await params
    const { membership } = await requireAgency(slug)

    const [roster, pending] = await Promise.all([
        sql`
            SELECT
                m.id AS "memberId",
                u.name,
                u.email,
                m.role,
                s.code,
                count(a.id)::int AS applied,
                count(a.id) FILTER (WHERE a.stage <> 'applied')::int AS kept
            FROM neon_auth.member m
            JOIN neon_auth."user" u ON u.id = m."userId"
            LEFT JOIN public.scout_profile s ON s.user_id = m."userId"
            LEFT JOIN public.application a
                   ON a.scout_id = s.id
                  AND a.organization_id = ${membership.organizationId}
            WHERE m."organizationId" = ${membership.organizationId}
            GROUP BY m.id, u.name, u.email, m.role, s.code, m."createdAt"
            ORDER BY m."createdAt"
        `,
        sql`
            SELECT id, name, email, city, country, message
            FROM public.scout_application
            WHERE organization_id = ${membership.organizationId}
              AND status = 'pending'
            ORDER BY created_at DESC
        `,
    ])

    return (
        <div className="mx-auto w-full max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {membership.name}
            </p>
            <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                Scouts.
            </h1>

            <section className="mt-10 border-t border-border pt-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Invite a scout
                </h2>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-xs leading-relaxed text-muted-foreground">
                    Or share your open link —
                    <span className="text-foreground">
                        {siteLink(`/join/${slug}`)}
                    </span>
                    <CopyButton
                        value={siteUrl(`/join/${slug}`)}
                        label="Copy the scout join link"
                    />
                </p>
                <InviteScout organizationId={membership.organizationId} />
            </section>

            <section className="mt-10 border-t border-border pt-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Wants to scout for you
                </h2>
                <ScoutApplications
                    applications={pending as unknown as PendingRow[]}
                    organizationId={membership.organizationId}
                />
            </section>

            <section className="mt-10 border-t border-border pt-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Roster
                </h2>
                <ul className="mt-4 space-y-3">
                    {(roster as unknown as RosterRow[]).map((m) => (
                        <li
                            key={m.memberId}
                            className="flex items-baseline justify-between gap-4"
                        >
                            <span className="min-w-0 text-sm text-foreground">
                                {m.name}
                                {m.code && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        /s/{m.code}
                                    </span>
                                )}
                            </span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                                {m.applied > 0 && (
                                    <span className="mr-3">
                                        {m.kept}/{m.applied} kept
                                    </span>
                                )}
                                <span className="uppercase tracking-[0.1em]">
                                    {m.role === "member" ? "Scout" : m.role}
                                </span>
                            </span>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    )
}
