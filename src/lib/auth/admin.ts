import { notFound } from "next/navigation"

import { getUser } from "@/lib/auth/membership"

/**
 * Whether a new agency waits for an operator before its public links work.
 *
 * Off for now: the emailed code already proves someone controls the address
 * they registered with, and holding every agency in a queue costs more than it
 * currently buys. The machinery stays — the panel, the statuses, the gate on
 * every public surface — so turning this on is one variable, not a rebuild, and
 * an agency can still be suspended by hand today.
 *
 * Set REQUIRE_AGENCY_CONFIRMATION=true to make new agencies start pending.
 */
export function requiresConfirmation(): boolean {
    return process.env.REQUIRE_AGENCY_CONFIRMATION?.trim() === "true"
}

/** The status a newly created agency starts in. */
export function initialAgencyStatus(): "pending" | "active" {
    return requiresConfirmation() ? "pending" : "active"
}

/**
 * Who operates the platform. A single address from the environment rather than
 * a role in the database: there is one operator, and a value nobody can write
 * to at runtime cannot be escalated into.
 *
 * The address must also be verified. Otherwise anyone who signed up as the
 * admin address before the real operator did would hold the panel — and on a
 * fresh database, nothing stops them trying.
 */
export function isAdminEmail(email: string): boolean {
    const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase()
    return Boolean(admin) && email.trim().toLowerCase() === admin
}

export async function getAdmin() {
    const user = await getUser()
    if (!user) return null
    if (!user.emailVerified) return null
    if (!isAdminEmail(user.email)) return null
    return user
}

/**
 * Guard for the admin surface. Answers 404 rather than redirecting: whether an
 * admin panel exists here is not information a signed-in stranger needs.
 */
export async function requireAdmin() {
    const admin = await getAdmin()
    if (!admin) notFound()
    return admin
}
