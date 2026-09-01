import Link from "next/link"
import type { Metadata } from "next"

import { CopyButton } from "@/components/copy-button"
import { requireAgency } from "@/lib/auth/membership"
import { sql } from "@/lib/db"
import { siteLink, siteUrl } from "@/lib/site"
import { STAGES } from "@/lib/pipeline"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Agency overview",
    robots: { index: false, follow: false },
}

/** Stage ids in the database, in the order STAGES declares them. */
const STAGE_IDS = [
    "applied",
    "pre_select",
    "scheduled",
    "final_voting",
    "onboarding",
    "on_board",
]

export default async function AgencyOverview({
    params,
}: PageProps<"/agency/[slug]">) {
    const { slug } = await params
    const { membership } = await requireAgency(slug)

    const [profile, counts, waiting] = await Promise.all([
        sql`
            SELECT status
            FROM public.agency_profile
            WHERE organization_id = ${membership.organizationId}
        `,
        sql`
            SELECT stage, count(*)::int AS n
            FROM public.application
            WHERE organization_id = ${membership.organizationId}
            GROUP BY stage
        `,
        sql`
            SELECT count(*)::int AS n
            FROM public.scout_application
            WHERE organization_id = ${membership.organizationId}
              AND status = 'pending'
        `,
    ])

    const byStage = new Map(
        (counts as { stage: string; n: number }[]).map((r) => [r.stage, r.n]),
    )
    const total = [...byStage.values()].reduce((sum, n) => sum + n, 0)
    const pendingScouts = (waiting[0] as { n: number }).n
    const status = (profile[0] as { status: string } | undefined)?.status
    const live = status === "active"

    return (
        <div className="mx-auto w-full max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Agency
            </p>
            <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                {membership.name}
            </h1>
            <p className="mt-2 text-xs text-muted-foreground">
                {total} application{total === 1 ? "" : "s"}
            </p>

            <section className="mt-10 border-t border-border pt-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Your links
                </h2>

                {!live && (
                    <div className="mt-4 border-l-2 border-foreground pl-4">
                        <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                            {status === "suspended"
                                ? "Your links are down"
                                : "Not live yet"}
                        </p>
                        <p className="mt-2 max-w-prose text-xs leading-relaxed text-muted-foreground">
                            {status === "suspended"
                                ? "These links are switched off. Everything you have collected is untouched."
                                : "We check every agency by hand before its links go live, so applicants know who they are writing to. Yours are below and will start working once that is done — usually within a couple of days. Nothing else here is waiting on it."}
                        </p>
                    </div>
                )}

                <dl className="mt-4 space-y-4">
                    <LinkRow
                        label="Applicants apply here"
                        path={`/apply/${slug}`}
                        live={live}
                    />
                    <LinkRow
                        label="Scouts join here"
                        path={`/join/${slug}`}
                        live={live}
                    />
                </dl>
            </section>

            <section className="mt-10 border-t border-border pt-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Stages
                </h2>
                <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                    {STAGES.map((stage, i) => (
                        <div key={stage.number}>
                            <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                {stage.name}
                            </dt>
                            <dd className="mt-0.5 text-xl text-foreground font-[family-name:var(--font-libre)]">
                                {byStage.get(STAGE_IDS[i]) ?? 0}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            {pendingScouts > 0 && (
                <section className="mt-10 border-t border-border pt-6">
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        {pendingScouts} scout
                        {pendingScouts === 1 ? "" : "s"} waiting on you.{" "}
                        <Link
                            href={`/agency/${slug}/scouts`}
                            className="text-foreground underline underline-offset-4"
                        >
                            Review them
                        </Link>
                        .
                    </p>
                </section>
            )}
        </div>
    )
}

function LinkRow({
    label,
    path,
    live,
}: {
    label: string
    path: string
    live: boolean
}) {
    return (
        <div>
            <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 flex items-center gap-2">
                {/* Shown either way — knowing the link is worth something before
                    it works — but muted and uncopyable until it does, so it is
                    not handed out while it would only disappoint. */}
                <span
                    className={`min-w-0 truncate text-sm ${
                        live
                            ? "text-foreground"
                            : "text-muted-foreground/50 line-through"
                    }`}
                >
                    {siteLink(path)}
                </span>
                {live && (
                    <CopyButton value={siteUrl(path)} label={`Copy ${label}`} />
                )}
            </dd>
        </div>
    )
}
