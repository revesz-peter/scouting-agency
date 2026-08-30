import type { Metadata } from "next"
import { AgencyRegisterForm } from "@/components/agency-register"
import { AgencyPanel } from "@/components/agency-panel"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
    title: "Request an agency account",
    description:
        "Put your agency's new-faces pipeline on scouting. €199 a month, everything included.",
    robots: { index: false, follow: false },
}

export default function Register() {
    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="grid flex-1 lg:grid-cols-2">
                <AgencyPanel />
                <AgencyRegisterForm />
            </main>
            <SiteFooter />
        </div>
    )
}
