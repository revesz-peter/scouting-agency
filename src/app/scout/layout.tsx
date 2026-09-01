import { redirect } from "next/navigation"

import { AppShell } from "@/components/app/app-shell"
import { scoutSections, toWorkspaces } from "@/lib/app-nav"
import {
    getMemberships,
    getScoutProfile,
    getUser,
} from "@/lib/auth/membership"

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

    const [memberships, scout] = await Promise.all([
        getMemberships(user.id),
        getScoutProfile(user.id),
    ])

    if (memberships.length === 0) {
        return <>{children}</>
    }

    return (
        <AppShell
            sections={scoutSections()}
            workspaces={toWorkspaces(memberships)}
            current={memberships[0].slug}
            email={user.email}
            link={
                scout ? { label: "Your link", path: `/s/${scout.code}` } : undefined
            }
        >
            {children}
        </AppShell>
    )
}
