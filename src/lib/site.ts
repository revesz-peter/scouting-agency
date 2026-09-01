/**
 * Where this instance actually lives.
 *
 * Only for links people act on — apply links, join links, a scout's own link,
 * the URL in an invitation email. Those have to point at the environment they
 * were made in, or every link you copy while developing sends you to
 * production.
 *
 * Canonical SEO URLs deliberately do NOT use this: `metadataBase`, the sitemap,
 * robots.txt, and the JSON-LD graph name the production domain wherever they
 * are built, because that is what they mean.
 */
export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://scouting.agency")

/** The origin without its scheme — how a link is written in the UI. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "")

/** A full link, for hrefs, QR codes, and emails: siteUrl("/join/omg") */
export function siteUrl(path: string): string {
    return `${SITE_URL}${path}`
}

/** A link as a person should read it: siteLink("/join/omg") → scouting.agency/join/omg */
export function siteLink(path: string): string {
    return `${SITE_HOST}${path}`
}

/**
 * A `?next=` destination, or null if it is not one we will send anyone to.
 *
 * Only same-site paths: anything absolute, protocol-relative (`//evil.com`), or
 * backslash-prefixed is refused, so a link mailed to someone cannot bounce them
 * off the site after they sign in.
 */
export function safeNext(next: string | null | undefined): string | null {
    if (!next) return null
    if (!next.startsWith("/")) return null
    if (next.startsWith("//") || next.startsWith("/\\")) return null
    return next
}
