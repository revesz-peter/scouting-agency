import type { NavSection, Workspace } from "@/components/app/app-nav"
import type { Membership } from "@/lib/auth/membership"

/**
 * What the app is made of, in the vocabulary the product already uses: the six
 * stages, the board, castings, credit and payouts.
 *
 * Items without an href are planned. Naming them is worth it — the sidebar is
 * where someone learns the shape of the thing — but they stay unlinked until
 * they exist.
 */
export function agencySections(slug: string): NavSection[] {
    return [
        {
            title: "Pipeline",
            items: [
                { label: "Overview", href: `/agency/${slug}` },
                { label: "Applications" },
                { label: "Castings" },
                { label: "Final voting" },
            ],
        },
        {
            title: "Agency",
            items: [
                { label: "The board" },
                { label: "Scouts", href: `/agency/${slug}/scouts` },
                { label: "Settings", href: `/agency/${slug}/settings` },
            ],
        },
    ]
}

export function scoutSections(): NavSection[] {
    return [
        {
            title: "Scouting",
            items: [
                { label: "Workspace", href: "/scout" },
                { label: "Applications" },
                { label: "Card & QR" },
            ],
        },
        {
            title: "Credit",
            items: [{ label: "Payouts" }],
        },
    ]
}

/** Every agency this person belongs to, for the switcher. */
export function toWorkspaces(memberships: Membership[]): Workspace[] {
    return memberships.map((m) => ({
        slug: m.slug,
        name: m.name,
        staff: m.role === "owner" || m.role === "admin",
    }))
}
