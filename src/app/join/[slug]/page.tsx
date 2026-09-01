import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { JoinForm } from "@/components/join-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

async function getAgencyBySlug(slug: string) {
    const rows = await sql`
        SELECT o.name, o.slug, p.city, p.country, p.status = 'active' AS live
        FROM neon_auth.organization o
        LEFT JOIN public.agency_profile p ON p.organization_id = o.id
        WHERE o.slug = ${slug}
    `
    return rows[0] as
        | {
              name: string
              slug: string
              city: string | null
              country: string | null
              live: boolean
          }
        | undefined
}

export async function generateMetadata({
    params,
}: PageProps<"/join/[slug]">): Promise<Metadata> {
    const { slug } = await params
    const agency = await getAgencyBySlug(slug)

    return {
        title: agency ? `Scout for ${agency.name}` : "Scout",
        description: agency
            ? `Apply to scout for ${agency.name}.`
            : undefined,
        robots: { index: false, follow: true },
    }
}

export default async function Join({ params }: PageProps<"/join/[slug]">) {
    const { slug } = await params
    const agency = await getAgencyBySlug(slug)
    if (!agency) notFound()

    const where = [agency.city, agency.country].filter(Boolean).join(", ")

    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="mx-auto w-full max-w-sm flex-1 px-6 py-14 sm:py-20">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Scout
                </p>
                <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                    {agency.name}
                </h1>
                {where && (
                    <p className="mt-2 text-xs text-muted-foreground">{where}</p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    Scouts find faces and send them in. Every application you
                    send stays credited to you — through pre-select, the board
                    vote, and signing.
                </p>

                {agency.live ? (
                    <JoinForm slug={agency.slug} agency={agency.name} />
                ) : (
                    <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
                        This agency is still being set up and is not taking scouts
                        through this link yet. Worth trying again shortly.
                    </p>
                )}
            </main>
            <SiteFooter />
        </div>
    )
}
