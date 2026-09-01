import { Suspense } from "react"
import type { Metadata } from "next"

import { VerifyForm } from "@/components/auth/verify-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
    title: "Verify your email",
    robots: { index: false, follow: false },
}

export default function Verify() {
    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="flex-1">
                <Suspense>
                    <VerifyForm />
                </Suspense>
            </main>
            <SiteFooter />
        </div>
    )
}
