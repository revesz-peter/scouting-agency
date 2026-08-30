export interface Agency {
    /** Slug used in the apply link an agency hands out: /apply/<slug> */
    slug: string
    name: string
    location: string
}

/**
 * Agencies live on the platform. Until there is a database, an agency is
 * added here and its apply link — /apply/<slug> — works immediately.
 */
export const AGENCIES: Agency[] = [
    {
        slug: "omg",
        name: "OMG Model Management",
        location: "Budapest",
    },
]

export function getAgency(slug: string): Agency | undefined {
    return AGENCIES.find((a) => a.slug === slug)
}
