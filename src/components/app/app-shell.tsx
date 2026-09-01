import {
    AppNav,
    type NavSection,
    type ShareLink,
    type Workspace,
} from "@/components/app/app-nav"

/**
 * The frame every signed-in page sits in. Deliberately not the marketing
 * chrome: no site header, no footer, no pricing link — this is somewhere people
 * work, and the nav is the whole point of the left column.
 *
 * On narrow screens the sidebar becomes a scrolling strip along the top, so the
 * same structure holds without a drawer to open.
 */
export function AppShell({
    sections,
    workspaces,
    current,
    email,
    link,
    children,
}: {
    sections: NavSection[]
    workspaces: Workspace[]
    current: string | null
    email: string
    link?: ShareLink
    children: React.ReactNode
}) {
    return (
        <div className="min-h-svh lg:flex">
            <aside className="border-b border-border px-6 py-5 lg:sticky lg:top-0 lg:h-svh lg:w-60 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-7 lg:py-8">
                <AppNav
                    sections={sections}
                    workspaces={workspaces}
                    current={current}
                    email={email}
                    link={link}
                />
            </aside>

            <main className="min-w-0 flex-1 px-6 py-10 sm:px-10 lg:px-14 lg:py-14">
                <div className="mx-auto w-full max-w-3xl">{children}</div>
            </main>
        </div>
    )
}
