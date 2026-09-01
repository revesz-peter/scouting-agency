import type { NavSection, Workspace } from "@/components/app/app-nav"
import type { Membership } from "@/lib/auth/membership"

/**
 * What the app is made of, in the vocabulary the product already uses: the six
 * stages, the board, castings, credit and payouts.
 *
 * The column reads home, then work, then settings — the two untitled blocks
 * bookending the titled ones.
 *
 * Items without an href are planned. Naming them is worth it — the sidebar is
 * where someone learns the shape of the thing — but they stay unlinked until
 * they exist.
 */
export function agencySections(slug: string, admin = false): NavSection[] {
    const sections: NavSection[] = [
        // Home stands on its own: it summarises the pipeline rather than being
        // a step in it.
        {
            title: "",
            items: [{ label: "Overview", href: `/agency/${slug}` }],
        },
        // All six stages, in the order STAGES declares them. The board is where
        // the pipeline ends, so it belongs here and not in a group of its own.
        {
            title: "Pipeline",
            items: [
                { label: "Applications", href: `/agency/${slug}/applications` },
                { label: "Castings" },
                { label: "Final voting" },
                { label: "Onboarding" },
                { label: "The board" },
            ],
        },
        // Not "Agency": the switcher above already says which agency this is.
        {
            title: "People",
            items: [{ label: "Scouts", href: `/agency/${slug}/scouts` }],
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

    return sections
}

/**
 * Settings sits below the link an agency hands out, not in the nav: both belong
 * to the bottom of the column, and the link is the thing you come looking for.
 */
export function agencySettingsHref(slug: string): string {
    return `/agency/${slug}/settings`
}

export function scoutSections(admin = false): NavSection[] {
    const sections: NavSection[] = [
        {
            title: "",
            items: [{ label: "Workspace", href: "/scout" }],
        },
        {
            title: "Scouting",
            items: [
                { label: "Applications", href: "/scout/applications" },
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
