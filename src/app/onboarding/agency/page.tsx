import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { CreateAgencyForm } from "@/components/auth/create-agency-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getMemberships, getUser } from "@/lib/auth/membership"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Create your agency",
    robots: { index: false, follow: false },
}

export default async function OnboardAgency() {
    const user = await getUser()
    if (!user) redirect("/agency/sign-in")

    const memberships = await getMemberships(user.id)
    if (memberships.length > 0) redirect("/auth/continue")

    const rows = await sql`
        SELECT agency_name AS name, slug
        FROM public.agency_signup
        WHERE lower(email) = lower(${user.email})
        ORDER BY created_at DESC
        LIMIT 1
    `
    const request = rows[0] as { name: string; slug: string } | undefined
    if (!request) redirect("/auth/continue")

    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="mx-auto w-full max-w-sm flex-1 px-6 py-14 sm:py-20">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Onboarding
                </p>
                <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                    Open the doors.
                </h1>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    Your email is confirmed. Creating the agency makes you its
                    owner, and its apply link starts working immediately.
                </p>

                <CreateAgencyForm name={request.name} slug={request.slug} />
            </main>
            <SiteFooter />
        </div>
    )
}
