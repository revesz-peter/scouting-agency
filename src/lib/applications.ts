import { sql } from "@/lib/db"

/**
 * One application as the cards show it — the same fields the landing page demo
 * puts on a card, plus who is credited for it.
 */
export interface ApplicationCard {
    id: string
    name: string
    age: number
    height: number
    bust: number
    waist: number
    hips: number
    city: string
    hair: string
    /** Days since it arrived; drives the recency filter. */
    applied: number
    scout: string | null
}

const CARD_FIELDS = sql`
    a.id,
    a.first_name || ' ' || left(a.last_name, 1) || '.' AS name,
    date_part('year', age(a.dob))::int AS age,
    a.height_cm AS height,
    a.bust_cm   AS bust,
    a.waist_cm  AS waist,
    a.hips_cm   AS hips,
    a.city,
    a.hair_color AS hair,
    date_part('day', now() - a.created_at)::int AS applied,
    s.display_name AS scout
`

/**
 * The agency's Applied column: everything sent to them and not yet moved on.
 * An application a scout is still holding is deliberately absent — the agency
 * sees what the scout chose to pass on.
 */
export async function agencyInbox(
    organizationId: string,
): Promise<ApplicationCard[]> {
    const rows = await sql`
        SELECT ${CARD_FIELDS}
        FROM public.application a
        LEFT JOIN public.scout_profile s ON s.id = a.scout_id
        WHERE a.organization_id = ${organizationId}
          AND a.stage = 'applied'
          AND a.sent_at IS NOT NULL
        ORDER BY a.created_at DESC
    `
    return rows as ApplicationCard[]
}

/** What a scout is still holding, oldest first — these are waiting on them. */
export async function scoutQueue(scoutId: string): Promise<ApplicationCard[]> {
    const rows = await sql`
        SELECT ${CARD_FIELDS}
        FROM public.application a
        LEFT JOIN public.scout_profile s ON s.id = a.scout_id
        WHERE a.scout_id = ${scoutId} AND a.sent_at IS NULL
        ORDER BY a.created_at ASC
    `
    return rows as ApplicationCard[]
}

/** Applied and sent on, for the scout's funnel. */
export async function scoutFunnel(scoutId: string) {
    const rows = await sql`
        SELECT
            count(*)::int AS applied,
            count(*) FILTER (WHERE sent_at IS NOT NULL)::int AS sent
        FROM public.application
        WHERE scout_id = ${scoutId}
    `
    return rows[0] as { applied: number; sent: number }
}
