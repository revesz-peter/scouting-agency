import Link from "next/link"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getMemberships, getUser } from "@/lib/auth/membership"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Waiting on an agency",
    robots: { index: false, follow: false },
}

/**
 * Signed in, verified, but not yet part of any agency. A scout belongs to at
 * least one, so there is nothing to open until an invitation is accepted.
 */
export default async function Pending() {
    const user = await getUser()
    if (!user) redirect("/agency/sign-in")

    const memberships = await getMemberships(user.id)
    if (memberships.length > 0) redirect("/auth/continue")

    // Expired invitations are shown too — knowing one arrived and lapsed beats
    // being told nothing is waiting when the agency believes it invited you.
    const invitations = (await sql`
        SELECT i.id, o.name AS agency, i."expiresAt" > now() AS live
        FROM neon_auth.invitation i
        JOIN neon_auth.organization o ON o.id = i."organizationId"
        WHERE lower(i.email) = lower(${user.email}) AND i.status = 'pending'
        ORDER BY i."createdAt" DESC
    `) as { id: string; agency: string; live: boolean }[]

    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="mx-auto w-full max-w-sm flex-1 px-6 py-14 sm:py-20">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Scout
                </p>
                <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                    Nearly there.
                </h1>
                {invitations.length > 0 ? (
                    <>
                        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                            You have an invitation waiting. Accepting it opens
                            your workspace.
                        </p>
                        <ul className="mt-6 space-y-3">
                            {invitations.map((i) => (
                                <li key={i.id}>
                                    {i.live ? (
                                        <Link
                                            href={`/invite/${i.id}`}
                                            className="text-sm text-foreground underline underline-offset-4"
                                        >
                                            {i.agency}
                                        </Link>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            {i.agency} — expired, ask them to
                                            send a new one
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                        Your account is ready, but you are not scouting for an
                        agency yet. When one takes you on, the invitation arrives
                        at <span className="text-foreground">{user.email}</span>{" "}
                        and your workspace opens from there.
                    </p>
                )}
            </main>
            <SiteFooter />
        </div>
    )
}
