import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ApplyPage } from "@/components/apply-page"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { listAgencies } from "@/lib/agencies"
import { getScout } from "@/lib/scouts"

// Scouts pick their code at onboarding, so there is no fixed set.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Become a model",
    description:
        "Apply through a scout's personal link. Natural, un-retouched digitals — no professional photos required.",
    robots: { index: false, follow: true },
}

export default async function ScoutApply(props: PageProps<"/s/[code]">) {
    const { code } = await props.params
    const scout = await getScout(code)
    if (!scout) notFound()

    // A scout belongs to at least one agency, so their link reaches those and
    // no further. With several, the applicant picks from them.
    const all = await listAgencies()
    const agencies = all.filter((a) => scout.agencies.includes(a.slug))

    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <ApplyPage
                agencies={agencies}
                scoped={agencies.length === 1}
                referrer={scout}
            />
            <SiteFooter />
        </div>
    )
}
