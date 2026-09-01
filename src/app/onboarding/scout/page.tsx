import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { ScoutProfileForm } from "@/components/auth/scout-profile-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getMemberships, getScoutProfile, getUser } from "@/lib/auth/membership"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Set up your workspace",
    robots: { index: false, follow: false },
}

export default async function OnboardScout() {
    const user = await getUser()
    if (!user) redirect("/agency/sign-in")

    const [memberships, existing] = await Promise.all([
        getMemberships(user.id),
        getScoutProfile(user.id),
    ])

    // A scout belongs to at least one agency; without that there is nothing to
    // scout for yet.
    if (memberships.length === 0) redirect("/scout/pending")
    if (existing) redirect("/scout")

    const agencies = memberships.map((m) => m.name).join(", ")

    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="mx-auto w-full max-w-sm flex-1 px-6 py-14 sm:py-20">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Onboarding
                </p>
                <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                    Pick your link.
                </h1>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    You scout for{" "}
                    <span className="text-foreground">{agencies}</span>. Choose the
                    code that goes in your bio — everyone who applies through it
                    stays credited to you.
                </p>

                <ScoutProfileForm defaultName={user.name} />
            </main>
            <SiteFooter />
        </div>
    )
}
