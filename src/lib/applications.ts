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

export interface InboxApplication extends ApplicationRow {
    stage: string
    /** Shortlisted: kept, but still one of the people you are working through. */
    shortlisted: boolean
}

/**
 * The agency's working set: everything sent to them that has not gone past
 * pre-select yet.
 *
 * Shortlisting keeps someone here rather than moving them out of sight. It is a
 * mark on the pile you are already looking at — the pile is what you compare
 * against, and a shortlist you cannot see beside the rest is not much of one.
 * Scheduling a casting is the step that actually moves people on.
 *
 * An application a scout is still holding is deliberately absent: the agency
 * sees what the scout chose to pass on.
 */
export async function agencyInbox(
    organizationId: string,
): Promise<InboxApplication[]> {
    const rows = await sql`
        SELECT ${FIELDS},
            a.stage,
            a.stage = 'pre_select' AS shortlisted
        FROM public.application a
        LEFT JOIN public.scout_profile s ON s.id = a.scout_id
        WHERE a.organization_id = ${organizationId}
          AND a.stage IN ('applied', 'pre_select')
          AND a.sent_at IS NOT NULL
        ORDER BY a.created_at DESC
    `
    return rows as InboxApplication[]
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

/**
 * Everything a scout has sent on, with where it got to.
 *
 * A scout's funnel says how many they passed on; without this they could not
 * see who those people were or what happened next — and what happened next is
 * exactly what their kept rate is made of.
 */
export async function scoutSent(scoutId: string): Promise<SentApplication[]> {
    const rows = await sql`
        SELECT ${FIELDS}, a.stage, o.name AS agency
        FROM public.application a
        LEFT JOIN public.scout_profile s ON s.id = a.scout_id
        JOIN neon_auth.organization o ON o.id = a.organization_id
        WHERE a.scout_id = ${scoutId} AND a.sent_at IS NOT NULL
        ORDER BY a.sent_at DESC
    `
    return rows as SentApplication[]
}

export interface SentApplication extends ApplicationRow {
    stage: string
    agency: string
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

export interface ApplicationEvent {
    kind: "applied" | "sent_on" | "stage"
    stage: string | null
    at: string
    actor: string | null
}

export interface ApplicationProfile extends ApplicationRow {
    organizationId: string
    agency: string
    agencySlug: string
    stage: string
    sent: boolean
    events: ApplicationEvent[]
}

/**
 * One applicant in full, with the record of how they got here.
 *
 * Not scoped to a viewer: callers check who is allowed to see it, because an
 * agency and the scout who sent them reach the same person by different routes.
 */
export async function getApplication(
    id: string,
): Promise<ApplicationProfile | null> {
    const rows = await sql`
        SELECT ${FIELDS},
            a.organization_id AS "organizationId",
            a.stage,
            a.sent_at IS NOT NULL AS sent,
            o.name AS agency,
            o.slug AS "agencySlug"
        FROM public.application a
        LEFT JOIN public.scout_profile s ON s.id = a.scout_id
        JOIN neon_auth.organization o ON o.id = a.organization_id
        WHERE a.id = ${id}
    `
    const application = rows[0] as ApplicationProfile | undefined
    if (!application) return null

    const events = await sql`
        SELECT e.kind, e.stage, e.at, u.name AS actor
        FROM public.application_event e
        LEFT JOIN neon_auth."user" u ON u.id = e.actor_id
        WHERE e.application_id = ${id}
        ORDER BY e.at
    `

    return { ...application, events: events as ApplicationEvent[] }
}
