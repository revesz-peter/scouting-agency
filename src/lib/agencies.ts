import { sql } from "@/lib/db"

export interface Agency {
    /** Slug used in the apply link an agency hands out: /apply/<slug> */
    slug: string
    name: string
    location: string
    /** Public links only work once an operator has confirmed the agency. */
    live: boolean
}

/**
 * Agencies whose public links are live. An unconfirmed agency exists and can be
 * set up by its owner, but does not appear here and cannot take applications:
 * verifying an email proves someone owns an inbox, not that they are the agency
 * an applicant thinks they are writing to.
 *
 * `getAgency` returns unconfirmed agencies too, with `live: false`, so callers
 * can tell "not yet" apart from "no such agency".
 */
export async function listAgencies(): Promise<Agency[]> {
    const rows = await sql`
        SELECT
            o.slug,
            o.name,
            coalesce(
                nullif(concat_ws(', ', p.city, p.country), ''),
                ''
            ) AS location,
            p.status = 'active' AS live
        FROM neon_auth.organization o
        LEFT JOIN public.agency_profile p ON p.organization_id = o.id
        WHERE p.status = 'active'
        ORDER BY o.name
    `
    return rows as Agency[]
}

export async function getAgency(slug: string): Promise<Agency | undefined> {
    const rows = await sql`
        SELECT
            o.slug,
            o.name,
            coalesce(
                nullif(concat_ws(', ', p.city, p.country), ''),
                ''
            ) AS location,
            p.status = 'active' AS live
        FROM neon_auth.organization o
        LEFT JOIN public.agency_profile p ON p.organization_id = o.id
        WHERE o.slug = ${slug}
    `
    return rows[0] as Agency | undefined
}
