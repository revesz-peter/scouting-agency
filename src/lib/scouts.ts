import { sql } from "@/lib/db"

export interface Scout {
    /** The code in a scout's personal link: /s/<code> */
    code: string
    name: string
    /**
     * Agencies this scout works with. A scout belongs to at least one, so an
     * application through their link goes to these and no further.
     */
    agencies: string[]
}

/**
 * A scout by their public code. The code is theirs to choose, so it stays short
 * enough for an Instagram or TikTok bio.
 */
export async function getScout(code: string): Promise<Scout | undefined> {
    const rows = await sql`
        SELECT
            s.code,
            s.display_name AS name,
            coalesce(
                array_agg(o.slug) FILTER (WHERE o.slug IS NOT NULL),
                '{}'
            ) AS agencies
        FROM public.scout_profile s
        LEFT JOIN neon_auth.member m ON m."userId" = s.user_id
        LEFT JOIN neon_auth.organization o ON o.id = m."organizationId"
        WHERE lower(s.code) = lower(${code})
        GROUP BY s.code, s.display_name
    `
    return rows[0] as Scout | undefined
}
