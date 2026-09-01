import { redirect } from "next/navigation"

import { getMemberships, getScoutProfile, getUser } from "@/lib/auth/membership"
import { sql } from "@/lib/db"

export const dynamic = "force-dynamic"

/**
 * Where a session lands after signing in or verifying. Everyone comes through
 * the same door, so this is the one place that decides which room they get.
 */
export default async function Continue() {
    const user = await getUser()
    if (!user) redirect("/agency/sign-in")

    const [memberships, scout] = await Promise.all([
        getMemberships(user.id),
        getScoutProfile(user.id),
    ])

    if (memberships.length === 0) {
        // A founder who registered an agency but has not created it yet: let
        // them, which makes them its owner.
        const signup = await sql`
            SELECT 1 FROM public.agency_signup
            WHERE lower(email) = lower(${user.email})
            LIMIT 1
        `
        if (signup.length > 0) redirect("/onboarding/agency")

        // An invitation they have not accepted yet. Signing in is the moment to
        // find it: someone who opened the link before having an account, or who
        // signed in from anywhere else, would otherwise never come back to it.
        const invitation = await sql`
            SELECT id FROM neon_auth.invitation
            WHERE lower(email) = lower(${user.email})
              AND status = 'pending'
              AND "expiresAt" > now()
            ORDER BY "createdAt" DESC
            LIMIT 1
        `
        if (invitation.length > 0) {
            redirect(`/invite/${(invitation[0] as { id: string }).id}`)
        }

        redirect("/scout/pending")
    }

    // Staff go to the dashboard whether or not they also scout; only someone
    // who is purely a scout needs a public code before they can do anything.
    const staff = memberships.find(
        (m) => m.role === "owner" || m.role === "admin",
    )
    if (staff) redirect(`/agency/${staff.slug}`)

    redirect(scout ? "/scout" : "/onboarding/scout")
}
