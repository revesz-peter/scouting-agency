"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

import { authClient } from "@/lib/auth/client"

export interface NavItem {
    label: string
    /** Absent when the section is planned but not built — shown, not linked. */
    href?: string
}

export interface NavSection {
    title: string
    items: NavItem[]
}

export interface Workspace {
    slug: string
    name: string
    /** Whether this membership can reach the agency side. */
    staff: boolean
}

/**
 * The in-app navigation. Sections with no `href` are planned and render as
 * muted text rather than dead links — the shape of the product is useful to
 * see, but a link that goes nowhere is not.
 */
export function AppNav({
    sections,
    workspaces,
    current,
    email,
    homeHref,
    settingsHref,
}: {
    sections: NavSection[]
    workspaces: Workspace[]
    current: string | null
    email: string
    /** Where the wordmark goes: this workspace, not the marketing site. */
    homeHref: string
    /** Rendered below the nav rather than in it. */
    settingsHref?: string
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [busy, setBusy] = useState(false)

    // The longest matching href wins, so /agency/x/scouts does not also light
    // up /agency/x. A prefix match alone would mark both.
    //
    // Settings is outside the nav but still competes here: leaving it out would
    // hand /agency/x/settings back to Overview and light two rows at once.
    const activeHref = [
        ...sections.flatMap((s) => s.items.map((i) => i.href)),
        settingsHref,
    ]
        .filter((href): href is string => Boolean(href))
        .filter((href) => pathname === href || pathname.startsWith(`${href}/`))
        .sort((a, b) => b.length - a.length)[0]

    async function signOut() {
        setBusy(true)
        try {
            await authClient.signOut()
            router.push("/agency/sign-in")
        } catch {
            // Nothing useful to say here, but the button must come back.
            setBusy(false)
        }
    }

    return (
        <div className="flex h-full flex-col gap-8 lg:justify-between">
            <div className="space-y-8">
                {/* Home means the workspace, not the marketing site: someone
                    signed in who clicks the wordmark wants the app, not the
                    page that sells it to them. */}
                <Link
                    href={homeHref}
                    className="hidden text-xs font-bold uppercase tracking-[0.25em] text-foreground lg:block"
                >
                    scouting.
                </Link>

                {workspaces.length > 0 && (
                    <WorkspaceSwitcher workspaces={workspaces} current={current} />
                )}

                <nav className="space-y-7">
                    {sections.map((section) => (
                        <div
                            key={section.title || "unlabelled"}
                            // The untitled block is home, set off from the
                            // titled groups of work below it by a rule.
                            className={
                                section.title ? "" : "border-t border-border pt-5"
                            }
                        >
                            {section.title && (
                                <p className="mb-2.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
                                    {section.title}
                                </p>
                            )}
                            <ul className="space-y-1.5">
                                {section.items.map((item) => {
                                    if (!item.href) {
                                        return (
                                            <li
                                                key={item.label}
                                                className="flex items-baseline gap-2 text-sm text-muted-foreground/40"
                                            >
                                                {item.label}
                                                <span className="text-[10px] uppercase tracking-[0.1em]">
                                                    soon
                                                </span>
                                            </li>
                                        )
                                    }

                                    const active = item.href === activeHref

                                    return (
                                        <li key={item.label}>
                                            <Link
                                                href={item.href}
                                                aria-current={active ? "page" : undefined}
                                                className={`block text-sm transition-colors ${
                                                    active
                                                        ? "text-foreground"
                                                        : "text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                {active && (
                                                    <span
                                                        aria-hidden
                                                        className="mr-2 inline-block h-px w-3 -translate-y-[3px] bg-foreground"
                                                    />
                                                )}
                                                {item.label}
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </div>

            {/* Settings and the account: the things that are not the work
                itself. The links an agency or scout hands out live on their own
                pages, where there is room to explain them. */}
            <div className="space-y-5">
                {settingsHref && (
                    <div className="border-t border-border pt-5">
                        <Link
                            href={settingsHref}
                            aria-current={
                                activeHref === settingsHref ? "page" : undefined
                            }
                            className={`block text-sm transition-colors ${
                                activeHref === settingsHref
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {activeHref === settingsHref && (
                                <span
                                    aria-hidden
                                    className="mr-2 inline-block h-px w-3 -translate-y-[3px] bg-foreground"
                                />
                            )}
                            Settings
                        </Link>
                    </div>
                )}

                <div className="hidden border-t border-border pt-5 lg:block">
                    <p className="truncate text-xs text-muted-foreground" title={email}>
                        {email}
                    </p>
                    <button
                        onClick={signOut}
                        disabled={busy}
                        className="mt-2 text-xs uppercase tracking-[0.1em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-40"
                    >
                        {busy ? "Signing out…" : "Sign out"}
                    </button>
                </div>
            </div>
        </div>
    )
}

/** Only shown to someone in more than one agency — otherwise it is noise. */
function WorkspaceSwitcher({
    workspaces,
    current,
}: {
    workspaces: Workspace[]
    current: string | null
}) {
    const router = useRouter()
    const active = workspaces.find((w) => w.slug === current) ?? workspaces[0]

    // No "Agency" label on either: the name is self-evident, and a section
    // called Agency used to sit right beneath this one saying something else.
    if (workspaces.length === 1) {
        return <p className="text-sm text-foreground">{active.name}</p>
    }

    return (
        <div>
            <select
                aria-label="Agency"
                value={active.slug}
                onChange={(e) => {
                    const next = workspaces.find((w) => w.slug === e.target.value)
                    router.push(next?.staff ? `/agency/${next.slug}` : "/scout")
                }}
                className="mt-1 w-full appearance-none border-b border-border bg-transparent py-1.5 text-sm outline-none transition-colors focus:border-foreground/30"
            >
                {workspaces.map((w) => (
                    <option key={w.slug} value={w.slug}>
                        {w.name}
                    </option>
                ))}
            </select>
        </div>
    )
}
