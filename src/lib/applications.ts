import { sql } from "@/lib/db"

/**
 * A full application. The landing page shows a card with five fields because it
 * is an illustration; the people actually working through these need the whole
 * record — measurements to compare, contact details to act on, and the links
 * and notes the applicant took the trouble to write.
 */
export interface ApplicationRow {
    id: string
    firstName: string
    lastName: string
    name: string
    email: string
    phone: string
    age: number
    dob: string
    gender: string
    city: string
    country: string
    instagram: string | null
    height: number
    bust: number
    waist: number
    hips: number
    shoe: number
    hair: string
    eyes: string
    videoLink: string | null
    portfolioLink: string | null
    notes: string | null
    /** Days since it arrived; drives the recency filter. */
    applied: number
    scout: string | null
    scoutCode: string | null
}

const FIELDS = sql`
    a.id,
    a.first_name AS "firstName",
    a.last_name  AS "lastName",
    a.first_name || ' ' || a.last_name AS name,
    a.email,
    a.phone,
    date_part('year', age(a.dob))::int AS age,
    to_char(a.dob, 'YYYY-MM-DD') AS dob,
    a.gender,
    a.city,
    a.country,
    a.instagram,
    a.height_cm AS height,
    a.bust_cm   AS bust,
    a.waist_cm  AS waist,
    a.hips_cm   AS hips,
    a.shoe_eu   AS shoe,
    a.hair_color AS hair,
    a.eye_color  AS eyes,
    a.video_link     AS "videoLink",
    a.portfolio_link AS "portfolioLink",
    a.notes,
    date_part('day', now() - a.created_at)::int AS applied,
    s.display_name AS scout,
    s.code AS "scoutCode"
`

/**
 * The agency's Applied column: everything sent to them and not yet moved on.
 * An application a scout is still holding is deliberately absent — the agency
 * sees what the scout chose to pass on.
 */
export async function agencyInbox(
    organizationId: string,
): Promise<ApplicationRow[]> {
    const rows = await sql`
        SELECT ${FIELDS}
        FROM public.application a
        LEFT JOIN public.scout_profile s ON s.id = a.scout_id
        WHERE a.organization_id = ${organizationId}
          AND a.stage = 'applied'
          AND a.sent_at IS NOT NULL
        ORDER BY a.created_at DESC
    `
    return rows as ApplicationRow[]
}

/** What a scout is still holding, oldest first — these are waiting on them. */
export async function scoutQueue(scoutId: string): Promise<ApplicationRow[]> {
    const rows = await sql`
        SELECT ${FIELDS}
        FROM public.application a
        LEFT JOIN public.scout_profile s ON s.id = a.scout_id
        WHERE a.scout_id = ${scoutId} AND a.sent_at IS NULL
        ORDER BY a.created_at ASC
    `
    return rows as ApplicationRow[]
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
