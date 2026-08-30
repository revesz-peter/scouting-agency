import Link from "next/link"
import { Pipeline } from "@/components/pipeline"
import { RunwaySlideshow } from "@/components/runway-slideshow"

const CAPABILITIES = [
    {
        label: "Your board, exportable",
        body: "The signed roster in one place — and it leaves when you want it to. A talent's package as a PDF, the whole board as a CSV.",
    },
    {
        label: "Every application, searchable",
        body: "Filter years of applications by height, measurements, hair, eyes, or city. A client brief becomes a shortlist from faces you already have.",
    },
    {
        label: "Scouts and payouts",
        body: "Every applicant is credited to the scout who brought them. See who scouted whom on the board, and settle what you owe from the same place.",
    },
    {
        label: "Client submissions",
        body: "Send a client a link instead of a folder of attachments, and see what they opened and who they picked.",
    },
]

const INCLUDED = [
    "All six pipeline stages, from Applied to On the Board",
    "Your board hosted, and embeddable on your own site",
    "Campaign links with source tracking on every applicant",
    "Every application submitted to the network",
    "Scout credit and payouts on the same board",
    "Unlimited applications, talent, and people on your team",
    "Export any time — a talent as a PDF, the roster as a CSV",
]

const CAMPAIGN_LINKS = [
    "milan-open-call",
    "tiktok-march",
    "budapest-street-cast",
]

export function LandingPage() {
    return (
        <main>
            {/* ── Hero ── */}
            <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 sm:px-10 sm:pt-28 sm:pb-20">
                <h1 className="max-w-3xl text-4xl leading-[1.08] text-foreground sm:text-5xl lg:text-6xl font-[family-name:var(--font-libre)]">
                    The progressive infrastructure behind model agencies.
                </h1>
                <p className="mt-7 max-w-lg text-xs leading-relaxed text-muted-foreground">
                    One system for the whole new-faces pipeline — from the first
                    application to a signed face on the board. Built for the
                    people who run the agency, not around them.
                </p>

                <div className="mt-9 flex flex-wrap items-center gap-6">
                    <Link
                        href="/agency/sign-in"
                        className="bg-foreground px-7 py-3 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90"
                    >
                        Agency sign in
                    </Link>
                    <Link
                        href="/apply"
                        className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                        Apply as a model
                    </Link>
                </div>

                <div className="mt-16">
                    <RunwaySlideshow />
                </div>
            </section>

            {/* ── Pipeline ── */}
            <Pipeline />

            {/* ── For agencies ── */}
            <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    For agencies
                </p>
                <h2 className="mt-4 max-w-xl text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                    Scouting is a process. Run it like one.
                </h2>
                <div className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4">
                    {CAPABILITIES.map((item) => (
                        <div key={item.label} className="border-t border-border pt-5">
                            <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                                {item.label}
                            </p>
                            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                                {item.body}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-14 grid gap-12 border-t border-border pt-12 lg:grid-cols-2 lg:gap-16">
                    {/* Links */}
                    <div className="border border-border p-6 sm:p-8">
                        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                            Your board, hosted
                        </p>
                        <p className="mt-4 break-all border-b border-border pb-3 text-sm text-foreground font-[family-name:var(--font-libre)]">
                            scouting.agency/board/<span className="text-foreground/40">your-agency</span>
                        </p>
                        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                            Your roster lives here and you manage it here — then
                            drop it into your own website in an iframe. Sign a
                            face on Monday and your site is current on Monday,
                            with no developer in the loop.
                        </p>
                    </div>

                    {/* Campaign links */}
                    <div className="border border-border p-6 sm:p-8">
                        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                            Campaign links
                        </p>
                        <ul className="mt-4 space-y-1.5 border-b border-border pb-3">
                            {CAMPAIGN_LINKS.map((slug) => (
                                <li
                                    key={slug}
                                    className="break-all text-sm text-muted-foreground font-[family-name:var(--font-libre)]"
                                >
                                    scouting.agency/l/
                                    <span className="text-foreground">
                                        {slug}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                            One per casting call, city, channel, or scout. Every
                            applicant arrives tagged, so you can see which link
                            produces faces worth meeting — not just clicks.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── For scouts ── */}
            <section className="border-t border-border">
                <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-2 lg:items-center lg:gap-20">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                            For scouts
                        </p>
                        <h2 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                            Your link. Your credit.
                        </h2>
                        <p className="mt-5 max-w-md text-xs leading-relaxed text-muted-foreground">
                            Scouts get a workspace of their own. Everyone who
                            applies through your personal link is credited to
                            you automatically — through pre-select, the board
                            vote, and whatever you earn when they sign.
                        </p>
                    </div>

                    {/* Personal link */}
                    <div className="border border-border p-8 sm:p-10 lg:justify-self-end lg:w-full lg:max-w-md">
                        <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                            Your personal scouting link
                        </p>
                        <p className="mt-4 break-all border-b border-border pb-3 text-sm text-foreground font-[family-name:var(--font-libre)]">
                            scouting.agency/s/<span className="text-foreground/40">your-name</span>
                        </p>
                        <p className="mt-6 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                            Share this link
                        </p>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                            Put it in your Instagram or TikTok bio and in your
                            posts. Anyone who applies through it is credited to
                            you automatically.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section
                id="pricing"
                className="border-y border-border bg-black/[0.015] py-20 sm:py-28"
            >
                <div className="mx-auto max-w-6xl px-6 sm:px-10">
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                        Pricing
                    </p>

                    <div className="mt-10 grid gap-12 border-t border-border pt-10 lg:grid-cols-2 lg:gap-20">
                        {/* Price */}
                        <div>
                            <p className="text-4xl leading-none text-foreground sm:text-5xl font-[family-name:var(--font-libre)]">
                                €50
                                <span className="ml-2 text-2xl text-muted-foreground sm:text-3xl">
                                    / month
                                </span>
                            </p>
                            <p className="mt-4 text-lg text-foreground font-[family-name:var(--font-libre)]">
                                First month free.
                            </p>
                            <p className="mt-6 max-w-sm text-xs leading-relaxed text-muted-foreground">
                                One price for the agency — not per seat, not per
                                application, not a cut of what you sign. No
                                setup fee, no card to start, and you can leave
                                whenever, taking your board with you.
                            </p>

                            <Link
                                href="/agency/register"
                                className="mt-8 inline-block bg-foreground px-7 py-3 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90"
                            >
                                Request an account
                            </Link>

                            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                                Free, always, for models and scouts — nobody
                                pays to be seen.
                            </p>
                        </div>

                        {/* What is included */}
                        <div>
                            <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                Everything included
                            </p>
                            <ul className="mt-5 border-t border-border">
                                {INCLUDED.map((item) => (
                                    <li
                                        key={item}
                                        className="border-b border-border py-3 text-xs leading-relaxed text-muted-foreground"
                                    >
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── For models ── */}
            <section className="border-t border-border">
                <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-20 sm:flex-row sm:items-end sm:justify-between sm:px-10 sm:py-24">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                            For models
                        </p>
                        <h2 className="mt-4 max-w-md text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                            One application, every agency.
                        </h2>
                        <p className="mt-5 max-w-md text-xs leading-relaxed text-muted-foreground">
                            Your details and digitals go to every agency on the
                            platform at once. Each reviews independently, and
                            any of them may contact you. No experience needed,
                            no fee, ever.
                        </p>
                    </div>
                    <Link
                        href="/apply"
                        className="shrink-0 bg-foreground px-7 py-3 text-center text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90"
                    >
                        Apply as a model
                    </Link>
                </div>
            </section>
        </main>
    )
}
