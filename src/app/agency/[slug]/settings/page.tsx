import type { Metadata } from "next"

import { ChangeSlug } from "@/components/agency/change-slug"
import { requireAgency } from "@/lib/auth/membership"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Agency settings",
    robots: { index: false, follow: false },
}

export default async function AgencySettings({
    params,
}: PageProps<"/agency/[slug]/settings">) {
    const { slug } = await params
    const { membership } = await requireAgency(slug)

    const owner = membership.role === "owner"

    return (
        <div className="mx-auto w-full max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {membership.name}
            </p>
            <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                Settings.
            </h1>

            <section className="mt-10 border-t border-border pt-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    Your link
                </h2>
                <p className="mt-2 max-w-prose text-xs leading-relaxed text-muted-foreground">
                    One word decides both of your public links — where
                    applicants apply and where scouts ask to join.
                </p>

                {owner ? (
                    <ChangeSlug
                        organizationId={membership.organizationId}
                        slug={slug}
                    />
                ) : (
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                        Only the owner can change it — it breaks every link the
                        agency has handed out.
                    </p>
                )}
            </section>
        </div>
    )
}
