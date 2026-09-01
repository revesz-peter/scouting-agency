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

    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <ApplyPage agencies={[agency]} scoped />
            <SiteFooter />
        </div>
    )
}
