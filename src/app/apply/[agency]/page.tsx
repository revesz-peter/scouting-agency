import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ApplyPage } from "@/components/apply-page"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getAgency } from "@/lib/agencies"

// Agencies are created at runtime, so there is no fixed set to pre-render.
export const dynamic = "force-dynamic"

export async function generateMetadata(
    props: PageProps<"/apply/[agency]">,
): Promise<Metadata> {
    const { agency: slug } = await props.params
    const agency = await getAgency(slug)
    if (!agency) return {}

    const title = `Apply to ${agency.name}`
    const description = `Submit your application directly to ${agency.name}. Natural, un-retouched digitals — no professional photos required.`

    return {
        title,
        description,
        alternates: { canonical: `/apply/${agency.slug}` },
        openGraph: {
            title: `${title} | scouting`,
            description,
            type: "website",
            url: `https://scouting.agency/apply/${agency.slug}`,
        },
    }
}

export default async function AgencyApply(props: PageProps<"/apply/[agency]">) {
    const { agency: slug } = await props.params
    const agency = await getAgency(slug)
    if (!agency) notFound()

    // The agency exists but is not confirmed. Say so rather than 404: the link
    // is real, its owner is handing it out, and it will start working.
    if (!agency.live) {
        return (
            <div className="flex min-h-svh flex-col">
                <SiteHeader />
                <main className="mx-auto w-full max-w-sm flex-1 px-6 py-14 sm:py-20">
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                        {agency.name}
                    </p>
                    <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                        Not open yet.
                    </h1>
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                        This agency is still being set up, so it is not taking
                        applications through this link yet. It is worth trying
                        again shortly.
                    </p>
                </main>
                <SiteFooter />
            </div>
        )
    }

    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <ApplyPage agencies={[agency]} scoped />
            <SiteFooter />
        </div>
    )
}
