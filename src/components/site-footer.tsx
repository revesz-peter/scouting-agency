import Link from "next/link"

export function SiteFooter() {
    return (
        <footer className="border-t border-border">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row sm:px-10">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-black/60">
                    scouting.
                </p>
                <div className="flex items-center gap-5 text-xs text-muted-foreground">
                    <Link
                        href="/privacy"
                        className="transition-colors hover:text-foreground"
                    >
                        Privacy
                    </Link>
                    <Link
                        href="/terms"
                        className="transition-colors hover:text-foreground"
                    >
                        Terms
                    </Link>
                    <span>&copy; {new Date().getFullYear()}</span>
                </div>
            </div>
        </footer>
    )
}
