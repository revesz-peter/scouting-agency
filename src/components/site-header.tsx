import Link from "next/link"

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
                <Link
                    href="/"
                    className="text-xs font-bold uppercase tracking-[0.25em] text-foreground"
                >
                    scouting.
                </Link>
                <nav className="flex items-center gap-5 sm:gap-7">
                    <Link
                        href="/#pricing"
                        className="hidden text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground sm:inline"
                    >
                        Pricing
                    </Link>
                    <Link
                        href="/agency/sign-in"
                        className="bg-foreground px-4 py-2 text-xs font-medium uppercase tracking-[0.1em] text-background transition-colors hover:bg-foreground/90"
                    >
                        Agency sign in
                    </Link>
                </nav>
            </div>
        </header>
    )
}
