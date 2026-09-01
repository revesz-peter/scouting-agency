import { AppShell } from "@/components/app/app-shell"
import {
    agencySections,
    agencySettingsHref,
    toWorkspaces,
} from "@/lib/app-nav"
import { getAdmin } from "@/lib/auth/admin"
import { requireAgency } from "@/lib/auth/membership"

export const dynamic = "force-dynamic"

/**
 * The agency side of the app. `requireAgency` runs here as well as in each
 * page: a layout is not a security boundary on its own, but doing it here means
 * the shell is never drawn for someone who cannot see it.
 */
export default async function AgencyLayout({
    params,
    children,
}: LayoutProps<"/agency/[slug]">) {
    const { slug } = await params
    const { user, memberships } = await requireAgency(slug)

    const admin = await getAdmin()

    return (
        <AppShell
            sections={agencySections(slug, Boolean(admin))}
            workspaces={toWorkspaces(memberships)}
            current={slug}
            email={user.email}
            homeHref={`/agency/${slug}`}
            settingsHref={agencySettingsHref(slug)}
        >
            {children}
        </AppShell>
    )
}
