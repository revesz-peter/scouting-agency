import type { Metadata } from "next"

import { ScoutFunnel, ScoutQueue } from "@/components/scout/scout-queue"
import { requireMember } from "@/lib/auth/membership"
import { scoutFunnel, scoutQueue } from "@/lib/applications"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Applications",
    robots: { index: false, follow: false },
}

export default async function ScoutApplications() {
    const { scout } = await requireMember()

    // No link means nothing can have come through it yet.
    if (!scout) redirect("/scout")

    const [waiting, funnel] = await Promise.all([
        scoutQueue(scout.id),
        scoutFunnel(scout.id),
    ])

    return (
        <>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Scout
            </p>
            <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                Applications.
            </h1>
            <p className="mt-4 max-w-prose text-xs leading-relaxed text-muted-foreground">
                Everyone who applied through your link, and how many you passed
                on. What you send lands in the agency&apos;s first column with
                your name on it.
            </p>

            <ScoutFunnel applied={funnel.applied} sent={funnel.sent} />
            <ScoutQueue waiting={waiting} />
        </>
    )
}
