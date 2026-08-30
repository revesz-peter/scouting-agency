export interface Scout {
    /** The code in a scout's personal link: /s/<code> */
    code: string
    name: string
    /**
     * Agency this scout works with. When set, applications through their link
     * go to that agency alone; otherwise they reach the whole network.
     */
    agency?: string
}

/**
 * Scouts on the platform. Until there is a database, a scout is added here and
 * their personal link — /s/<code> — works immediately. The code is theirs to
 * choose, so it stays short enough for an Instagram or TikTok bio.
 */
export const SCOUTS: Scout[] = []

export function getScout(code: string): Scout | undefined {
    return SCOUTS.find((s) => s.code.toLowerCase() === code.toLowerCase())
}
