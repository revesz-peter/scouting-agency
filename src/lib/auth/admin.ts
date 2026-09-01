import { notFound } from "next/navigation"

import { getUser } from "@/lib/auth/membership"

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
