import { redirect } from "next/navigation"

import { auth } from "@/lib/auth/server"
import { sql } from "@/lib/db"

/**
 * Roles come from Better Auth's organization plugin and are fixed to these
 * three. A scout is a `member`; promoting one to `admin` is what unlocks the
 * agency dashboard and the board vote.
 */
export type AgencyRole = "owner" | "admin" | "member"

/** Roles that may see an agency's dashboard and vote. */
const STAFF: AgencyRole[] = ["owner", "admin"]

export interface Membership {
  organizationId: string
  slug: string
  name: string
  role: AgencyRole
}

export interface ScoutProfile {
  id: string
  code: string
  displayName: string
}

/** The signed-in user, or null. Never throws — callers decide what to do. */
export async function getUser() {
  const { data } = await auth.getSession()
  return data?.user ?? null
}

/**
 * Every agency this user belongs to. A scout must belong to at least one, so an
 * empty result means they have accepted no invitation yet.
 *
 * Read straight from neon_auth rather than through the auth service: it is one
 * SQL round trip instead of an HTTP hop, and layouts run this on every request.
 */
export async function getMemberships(userId: string): Promise<Membership[]> {
  const rows = await sql`
    SELECT o.id AS "organizationId", o.slug, o.name, m.role
    FROM neon_auth.member m
    JOIN neon_auth.organization o ON o.id = m."organizationId"
    WHERE m."userId" = ${userId}
    ORDER BY o.name
  `
  return rows as Membership[]
}

export async function getScoutProfile(userId: string): Promise<ScoutProfile | null> {
  const rows = await sql`
    SELECT id, code, display_name AS "displayName"
    FROM public.scout_profile
    WHERE user_id = ${userId}
  `
  return (rows[0] as ScoutProfile | undefined) ?? null
}

/**
 * Guard for any signed-in page. Redirects to sign-in when there is no session,
 * and to /onboarding/scout until the member has chosen their public code.
 */
export async function requireProfile() {
  const user = await getUser()
  if (!user) redirect("/agency/sign-in")

  const [memberships, scout] = await Promise.all([
    getMemberships(user.id),
    getScoutProfile(user.id),
  ])

  if (!scout) redirect("/onboarding/scout")

  return { user, memberships, scout }
}

/**
 * Guard for an agency's own pages. Membership alone is not enough — a scout is
 * a `member` of the agency and must not see its dashboard.
 */
export async function requireAgency(slug: string, roles: AgencyRole[] = STAFF) {
  const user = await getUser()
  if (!user) redirect("/agency/sign-in")

  const memberships = await getMemberships(user.id)
  const membership = memberships.find((m) => m.slug === slug)

  if (!membership || !roles.includes(membership.role)) redirect("/scout")

  return { user, membership, memberships }
}
