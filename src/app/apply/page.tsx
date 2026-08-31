import type { Metadata } from "next"
import Link from "next/link"
import { ApplyPage } from "@/components/apply-page"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { AGENCIES } from "@/lib/agencies"

export const metadata: Metadata = {
    title: "Become a model",
    description:
        "The application an agency's applicants fill in — digitals, measurements and contact details, on a phone, in a few minutes.",
    alternates: { canonical: "/apply" },
    robots: { index: false, follow: true },
    openGraph: {
        title: "Become a model | scouting",
        description:
            "The application an agency's applicants fill in — digitals, measurements and contact details, on a phone, in a few minutes.",
        type: "website",
        url: "https://scouting.agency/apply",
    },
}

export default function Apply() {
    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            {/* /apply is a preview — real applicants arrive on an agency or
                scout link, where this bar does not appear. */}
            <div className="border-b border-border bg-black/[0.015]">
                <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 px-6 py-3 sm:px-10">
                    <p className="text-xs text-muted-foreground">
                        A preview of the form your applicants fill in.
                    </p>
                    <Link
                        href="/"
                        className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                        &larr; Back
                    </Link>
                </div>
            </div>
            <ApplyPage agencies={AGENCIES} />
            <SiteFooter />
        </div>
    )
}
