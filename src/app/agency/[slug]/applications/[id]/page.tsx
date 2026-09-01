import { notFound } from "next/navigation"
import type { Metadata } from "next"

import { AdvanceStage } from "@/components/agency/advance-stage"
import {
    BackLink,
    STAGE_IDS,
    TalentProfile,
    stageName,
} from "@/components/applications/talent-profile"
import { requireAgency } from "@/lib/auth/membership"
import { getApplication } from "@/lib/applications"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Applicant",
    robots: { index: false, follow: false },
}

export default async function AgencyApplicant({
    params,
}: PageProps<"/agency/[slug]/applications/[id]">) {
    const { slug, id } = await params
    const { membership } = await requireAgency(slug)

    const application = await getApplication(id)

    // Another agency's applicant, or one a scout has not sent yet, is not this
    // agency's to read.
    if (
        !application ||
        application.organizationId !== membership.organizationId ||
        !application.sent
    ) {
        notFound()
    }

    const at = STAGE_IDS.indexOf(
        application.stage as (typeof STAGE_IDS)[number],
    )
    const next = at >= 0 && at < STAGE_IDS.length - 1 ? STAGE_IDS[at + 1] : null

    return (
        <>
            <BackLink
                href={`/agency/${slug}/applications`}
                label="Applications"
            />
            <div className="mt-6">
                <TalentProfile
                    application={application}
                    actions={
                        <AdvanceStage
                            id={application.id}
                            organizationId={membership.organizationId}
                            next={next}
                            nextLabel={next ? stageName(next) : null}
                        />
                    }
                />
            </div>
        </>
    )
}
