import type { Metadata } from "next"

import { ApplicationsBoard } from "@/components/agency/applications-board"
import { requireAgency } from "@/lib/auth/membership"
import { agencyInbox } from "@/lib/applications"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Applications",
    robots: { index: false, follow: false },
}

export default async function AgencyApplications({
    params,
}: PageProps<"/agency/[slug]/applications">) {
    const { slug } = await params
    const { membership } = await requireAgency(slug)

    const applications = await agencyInbox(membership.organizationId)

    return (
        <div className="mx-auto w-full max-w-6xl">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Stage 01
            </p>
            <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                Applications.
            </h1>
            <p className="mt-4 max-w-prose text-xs leading-relaxed text-muted-foreground">
                Set the bar and the board answers — height, age, measurements,
                city, across every application you have received. What is worth
                keeping goes to Pre-Select; the rest stays here.
            </p>

            <ApplicationsBoard
                applications={applications}
                organizationId={membership.organizationId}
            />
        </div>
    )
}
