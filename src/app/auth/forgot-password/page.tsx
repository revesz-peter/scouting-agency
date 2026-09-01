import { Suspense } from "react"
import type { Metadata } from "next"

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata: Metadata = {
    title: "Reset your password",
    robots: { index: false, follow: false },
}

export default function ForgotPassword() {
    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="flex-1">
                <Suspense>
                    <ForgotPasswordForm />
                </Suspense>
            </main>
            <SiteFooter />
        </div>
    )
}
