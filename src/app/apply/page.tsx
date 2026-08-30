import type { Metadata } from "next"
import { ApplyPage } from "@/components/apply-page"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AGENCIES } from "@/lib/agencies"

export const metadata: Metadata = {
    title: "Become a model",
    description:
        "One application, every agency on scouting. Natural, un-retouched digitals — no professional photos required. Applicants 14+.",
    alternates: { canonical: "/apply" },
    openGraph: {
        title: "Become a model | scouting",
        description:
            "One application, every agency on scouting. Natural, un-retouched digitals — no professional photos required.",
        type: "website",
        url: "https://scouting.agency/apply",
    },
}

export default function Apply() {
    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <ApplyPage agencies={AGENCIES} />
            <SiteFooter />
        </div>
    )
}
