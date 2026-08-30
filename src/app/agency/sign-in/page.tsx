import type { Metadata } from "next"
import { AgencySignInForm } from "@/components/agency-sign-in"
import { AgencyPanel } from "@/components/agency-panel"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
    title: "Agency sign in",
    description: "Sign in to your agency workspace.",
    robots: { index: false, follow: false },
}

export default function SignIn() {
    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="flex-1 lg:grid lg:grid-cols-2">
                <AgencyPanel
                    cta={{
                        text: "Not on the platform yet?",
                        linkText: "Request an account",
                        href: "/agency/register",
                    }}
                />
                <AgencySignInForm />
            </main>
            <SiteFooter />
        </div>
    )
}
