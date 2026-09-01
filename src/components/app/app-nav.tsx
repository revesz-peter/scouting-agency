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
}: {
    sections: NavSection[]
    workspaces: Workspace[]
    current: string | null
    email: string
}) {
    const pathname = usePathname()
    const router = useRouter()
    const [busy, setBusy] = useState(false)

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
                <Link
                    href="/"
                    className="hidden text-xs font-bold uppercase tracking-[0.25em] text-foreground lg:block"
                >
                    scouting.
                </Link>

                {workspaces.length > 0 && (
                    <WorkspaceSwitcher
                        workspaces={workspaces}
                        current={current}
                    />
                )}

                <nav className="space-y-7">
                    {sections.map((section) => (
                        <div key={section.title}>
                            <p className="mb-2.5 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
                                {section.title}
                            </p>
                            <ul className="space-y-1.5">
                                {section.items.map((item) => {
                                    const active =
                                        item.href &&
                                        (pathname === item.href ||
                                            pathname.startsWith(`${item.href}/`))

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

    if (workspaces.length === 1) {
        return (
            <div>
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
                    Agency
                </p>
                <p className="mt-1 text-sm text-foreground">{active.name}</p>
            </div>
        )
    }

    return (
        <div>
            <label className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground/70">
                Agency
            </label>
            <select
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
