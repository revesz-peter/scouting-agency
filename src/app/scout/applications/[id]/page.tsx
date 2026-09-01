import { notFound } from "next/navigation"
import type { Metadata } from "next"

import {
    BackLink,
    TalentProfile,
} from "@/components/applications/talent-profile"
import { SendOne } from "@/components/scout/send-one"
import { requireMember } from "@/lib/auth/membership"
import { getApplication } from "@/lib/applications"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Applicant",
    robots: { index: false, follow: false },
}

export default async function ScoutApplicant({
    params,
}: PageProps<"/scout/applications/[id]">) {
    const { id } = await params
    const { scout } = await requireMember()
    if (!scout) notFound()

    const application = await getApplication(id)

    // A scout reads what came through their own link, and nothing else.
    if (!application || application.scoutCode !== scout.code) notFound()

    return (
        <>
            <BackLink href="/scout/applications" label="Applications" />
            <div className="mt-6">
                <TalentProfile
                    application={application}
                    actions={
                        application.sent ? (
                            <p className="text-xs text-muted-foreground">
                                Sent on. It is the agency&apos;s from here.
                            </p>
                        ) : (
                            <SendOne id={application.id} />
                        )
                    }
                />
            </div>
        </>
    )
}
