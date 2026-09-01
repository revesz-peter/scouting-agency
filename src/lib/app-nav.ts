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
export function agencySections(slug: string, admin = false): NavSection[] {
    const sections: NavSection[] = [
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
            ],
        },
    ]

    // Only the operator sees this, and only because the panel itself checks
    // again — hiding a link is not access control.
    if (admin) {
        sections.push({
            title: "Platform",
            items: [{ label: "Agencies", href: "/admin" }],
        })
    }

    // Untitled and last: settings is somewhere you go occasionally, not part of
    // the daily run through the pipeline.
    sections.push({
        title: "",
        items: [{ label: "Settings", href: `/agency/${slug}/settings` }],
    })

    return sections
}

export function scoutSections(admin = false): NavSection[] {
    const sections: NavSection[] = [
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

    if (admin) {
        sections.push({
            title: "Platform",
            items: [{ label: "Agencies", href: "/admin" }],
        })
    }

    return sections
}

/** Every agency this person belongs to, for the switcher. */
export function toWorkspaces(memberships: Membership[]): Workspace[] {
    return memberships.map((m) => ({
        slug: m.slug,
        name: m.name,
        staff: m.role === "owner" || m.role === "admin",
    }))
}
