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

    const [counts, waiting] = await Promise.all([
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

    return (
        <>
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
                <dl className="mt-4 space-y-4">
                    <LinkRow
                        label="Applicants apply here"
                        path={`/apply/${slug}`}
                    />
                    <LinkRow label="Scouts join here" path={`/join/${slug}`} />
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
        </>
    )
}

function LinkRow({ label, path }: { label: string; path: string }) {
    return (
        <div>
            <dt className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                {label}
            </dt>
            <dd className="mt-1 flex items-center gap-2">
                <span className="min-w-0 truncate text-sm text-foreground">
                    {siteLink(path)}
                </span>
                <CopyButton value={siteUrl(path)} label={`Copy ${label}`} />
            </dd>
        </div>
    )
}
