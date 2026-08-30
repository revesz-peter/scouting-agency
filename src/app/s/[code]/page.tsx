import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { ApplyPage } from "@/components/apply-page"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AGENCIES, getAgency } from "@/lib/agencies"
import { SCOUTS, getScout } from "@/lib/scouts"

export function generateStaticParams() {
    return SCOUTS.map((scout) => ({ code: scout.code }))
}

export const metadata: Metadata = {
    title: "Become a model",
    description:
        "Apply through a scout's personal link. Natural, un-retouched digitals — no professional photos required.",
    robots: { index: false, follow: true },
}

export default async function ScoutApply(props: PageProps<"/s/[code]">) {
    const { code } = await props.params
    const scout = getScout(code)
    if (!scout) notFound()

    const agency = scout.agency ? getAgency(scout.agency) : undefined
    const agencies = agency ? [agency] : AGENCIES

    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <ApplyPage
                agencies={agencies}
                scoped={Boolean(agency)}
                referrer={scout}
            />
            <SiteFooter />
        </div>
    )
}
