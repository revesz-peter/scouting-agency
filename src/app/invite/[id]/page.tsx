import type { Metadata } from "next"

import { AcceptInvitation } from "@/components/auth/accept-invitation"
import { InviteSignUp } from "@/components/auth/invite-sign-up"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getUser } from "@/lib/auth/membership"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
    title: "Your invitation",
    robots: { index: false, follow: false },
}

interface InvitationRow {
    email: string
    role: string
    status: string
    expiresAt: string
    agency: string
}

export default async function Invite({
    params,
}: PageProps<"/invite/[id]">) {
    const { id } = await params

    const rows = (await sql`
        SELECT i.email, i.role, i.status, i."expiresAt", o.name AS agency
        FROM neon_auth.invitation i
        JOIN neon_auth.organization o ON o.id = i."organizationId"
        WHERE i.id = ${id}
    `) as InvitationRow[]

    const invitation = rows[0]
    const user = await getUser()

    return (
        <div className="flex min-h-svh flex-col">
            <SiteHeader />
            <main className="mx-auto w-full max-w-sm flex-1 px-6 py-14 sm:py-20">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Invitation
                </p>

                {!invitation ? (
                    <Message
                        title="This link has expired."
                        body="Ask the agency to send you a new invitation."
                    />
                ) : invitation.status !== "pending" ? (
                    <Message
                        title="Already used."
                        body={`This invitation was ${invitation.status}. Sign in if the account is already yours.`}
                    />
                ) : new Date(invitation.expiresAt) < new Date() ? (
                    <Message
                        title="This invitation expired."
                        body="Ask the agency to send you a new one."
                    />
                ) : (
                    <>
                        <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                            {invitation.agency}
                        </h1>
                        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                            You have been invited to scout for{" "}
                            <span className="text-foreground">{invitation.agency}</span>{" "}
                            as {invitation.email}.
                        </p>

                        {user ? (
                            <AcceptInvitation
                                id={id}
                                mismatch={
                                    user.email.toLowerCase() !==
                                    invitation.email.toLowerCase()
                                        ? user.email
                                        : null
                                }
                            />
                        ) : (
                            // No account yet is the common case for an invited
                            // scout, so make one here rather than sending them
                            // to agency registration, which is not for them.
                            <InviteSignUp
                                invitationId={id}
                                email={invitation.email}
                            />
                        )}
                    </>
                )}
            </main>
            <SiteFooter />
        </div>
    )
}

function Message({ title, body }: { title: string; body: string }) {
    return (
        <>
            <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                {title}
            </h1>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{body}</p>
        </>
    )
}
