import type { Metadata } from "next"

import { ConfirmAgency } from "@/components/admin/confirm-agency"
import { requireAdmin } from "@/lib/auth/admin"
import { sql } from "@/lib/db"
import { siteLink } from "@/lib/site"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Admin",
    robots: { index: false, follow: false },
}

interface Row {
    signupId: string
    agencyName: string
    slug: string
    website: string | null
    contactName: string
    role: string | null
    email: string
    phone: string | null
    city: string
    country: string
    registeredAt: string
    /** Null until they verify their email and create the agency. */
    organizationId: string | null
    status: string | null
    confirmedAt: string | null
    emailVerified: boolean | null
    applications: number
}

/**
 * Everyone who has registered, in whatever state they got to: signed up but
 * never verified, verified but never created the agency, created and waiting,
 * or live.
 */
async function listRegistrations(): Promise<Row[]> {
    const rows = await sql`
        SELECT
            s.id            AS "signupId",
            s.agency_name   AS "agencyName",
            s.slug,
            s.website,
            s.contact_name  AS "contactName",
            s.role,
            s.email,
            s.phone,
            s.city,
            s.country,
            s.created_at    AS "registeredAt",
            o.id            AS "organizationId",
            p.status,
            p.confirmed_at  AS "confirmedAt",
            u."emailVerified",
            coalesce(a.n, 0)::int AS applications
        FROM public.agency_signup s
        LEFT JOIN neon_auth."user" u
               ON lower(u.email) = lower(s.email)
        LEFT JOIN neon_auth.organization o
               ON o.slug = s.slug
        LEFT JOIN public.agency_profile p
               ON p.organization_id = o.id
        LEFT JOIN LATERAL (
            SELECT count(*) AS n
            FROM public.application
            WHERE organization_id = o.id
        ) a ON true
        ORDER BY s.created_at DESC
    `
    return rows as Row[]
}

export default async function Admin() {
    await requireAdmin()
    const rows = await listRegistrations()

    const waiting = rows.filter(
        (r) => r.organizationId && r.status !== "active",
    )
    const live = rows.filter((r) => r.status === "active")
    const unfinished = rows.filter((r) => !r.organizationId)

    return (
        <div className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Admin
            </p>
            <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                Agencies.
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
                {waiting.length} waiting · {live.length} live ·{" "}
                {unfinished.length} not finished
            </p>

            <Group
                title="Waiting on you"
                empty="Nothing to confirm."
                rows={waiting}
            />
            <Group
                title="Not finished signing up"
                empty="Everyone who registered has created their agency."
                rows={unfinished}
            />
            <Group title="Live" empty="No agencies are live yet." rows={live} />
        </div>
    )
}

function Group({
    title,
    empty,
    rows,
}: {
    title: string
    empty: string
    rows: Row[]
}) {
    return (
        <section className="mt-10 border-t border-border pt-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                {title}
            </h2>
            {rows.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">{empty}</p>
            ) : (
                <ul className="mt-4 space-y-6">
                    {rows.map((r) => (
                        <li
                            key={r.signupId}
                            className="border-b border-border pb-6 last:border-0"
                        >
                            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                                <span className="text-sm text-foreground">
                                    {r.agencyName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {r.city}, {r.country}
                                </span>
                            </div>

                            <dl className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                                <Row label="Registered email">
                                    <span className="text-foreground">{r.email}</span>
                                    {r.emailVerified === true && " · verified"}
                                    {r.emailVerified === false && " · NOT verified"}
                                    {r.emailVerified === null && " · no account"}
                                </Row>
                                <Row label="Contact">
                                    {[r.contactName, r.role]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    {r.phone && ` · ${r.phone}`}
                                </Row>
                                {r.website && (
                                    <Row label="Website">
                                        <a
                                            href={r.website}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            className="underline underline-offset-4"
                                        >
                                            {r.website}
                                        </a>
                                    </Row>
                                )}
                                <Row label="Links">
                                    {siteLink(`/apply/${r.slug}`)}
                                </Row>
                                {r.organizationId && (
                                    <Row label="Applications">{r.applications}</Row>
                                )}
                            </dl>

                            {r.organizationId ? (
                                <ConfirmAgency
                                    organizationId={r.organizationId}
                                    agency={r.agencyName}
                                    status={r.status ?? "pending"}
                                />
                            ) : (
                                <p className="mt-3 text-xs text-muted-foreground">
                                    {r.emailVerified
                                        ? "Verified, but has not created the agency yet."
                                        : "Has not confirmed their email address yet."}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    )
}

function Row({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <div className="flex gap-2">
            <dt className="w-32 shrink-0">{label}</dt>
            <dd className="min-w-0 break-words">{children}</dd>
        </div>
    )
}
