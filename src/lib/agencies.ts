import { sql } from "@/lib/db"

export interface Agency {
    /** Slug used in the apply link an agency hands out: /apply/<slug> */
    slug: string
    name: string
    location: string
}

/**
 * Agencies live on the platform. An agency is a `neon_auth.organization`, so it
 * exists from the moment its founder creates it and its apply link works
 * immediately — there is no list to add it to.
 *
 * Location comes from the agency's own profile, which is filled in at
 * registration, so it is only missing for an organization created some other
 * way.
 */
export async function listAgencies(): Promise<Agency[]> {
    const rows = await sql`
        SELECT
            o.slug,
            o.name,
            coalesce(
                nullif(concat_ws(', ', p.city, p.country), ''),
                ''
            ) AS location
        FROM neon_auth.organization o
        LEFT JOIN public.agency_profile p ON p.organization_id = o.id
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
            ) AS location
        FROM neon_auth.organization o
        LEFT JOIN public.agency_profile p ON p.organization_id = o.id
        WHERE o.slug = ${slug}
    `
    return rows[0] as Agency | undefined
}
