import { redirect } from "next/navigation"

import { AppShell } from "@/components/app/app-shell"
import { scoutSections, toWorkspaces } from "@/lib/app-nav"
import { getAdmin } from "@/lib/auth/admin"
import { getMemberships, getUser } from "@/lib/auth/membership"

export const dynamic = "force-dynamic"

/**
 * The scout side of the app.
 *
 * Someone with no agency yet — waiting on an invitation — gets the bare page
 * instead: a sidebar of sections they cannot reach would be a worse answer than
 * the one /scout/pending already gives them.
 */
export default async function ScoutLayout({
    children,
}: LayoutProps<"/scout">) {
    const user = await getUser()
    if (!user) redirect("/agency/sign-in")

    const [memberships, admin] = await Promise.all([
        getMemberships(user.id),
        getAdmin(),
    ])

    if (memberships.length === 0) {
        return <>{children}</>
    }

    return (
        <AppShell
            sections={scoutSections(Boolean(admin))}
            workspaces={toWorkspaces(memberships)}
            current={memberships[0].slug}
            email={user.email}
            homeHref="/scout"
        >
            {children}
        </AppShell>
    )
}
