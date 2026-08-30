import { STAGES } from "@/lib/pipeline"

const HIGHLIGHTS = [
    "Every application submitted to the network, reviewed in your own pipeline",
    "Your board hosted here and embeddable on your own site in an iframe — update it once, it updates everywhere",
    "Campaign links per casting call, city, or channel — each applicant arrives tagged",
    "Scouts credited automatically, with payouts settled from the same board",
    "Export whenever you want: a talent as a PDF, the whole roster as a CSV",
]

/** Shared information column beside the agency sign-in and registration forms. */
export function AgencyPanel() {
    return (
        <div className="order-2 border-t border-border bg-black/[0.015] px-6 py-16 sm:px-10 sm:py-20 lg:order-1 lg:border-t-0 lg:border-r lg:px-14">
            <div className="lg:ml-auto lg:w-full lg:max-w-md">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    For agencies
                </p>
                <h2 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                    Your whole pipeline, in one place.
                </h2>
                <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                    Applications arrive structured rather than as inbox
                    attachments. Your scouts shortlist and schedule, the board
                    votes on record, and signed talent lands on your board —
                    without leaving the system.
                </p>

                {/* The pipeline, compact */}
                <div className="mt-8 border-t border-border pt-6">
                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                        The pipeline
                    </p>
                    <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
                        {STAGES.map((stage) => (
                            <li
                                key={stage.number}
                                className="flex items-baseline gap-1.5"
                            >
                                <span className="text-xs text-foreground/30 font-[family-name:var(--font-libre)]">
                                    {stage.number}
                                </span>
                                <span className="text-xs text-foreground">
                                    {stage.name}
                                </span>
                            </li>
                        ))}
                    </ol>
                </div>

                {/* What comes with it */}
                <ul className="mt-8 space-y-2.5 border-t border-border pt-6">
                    {HIGHLIGHTS.map((item) => (
                        <li
                            key={item}
                            className="flex gap-3 text-xs leading-relaxed text-muted-foreground"
                        >
                            <span
                                aria-hidden
                                className="mt-[6px] h-[3px] w-[3px] shrink-0 bg-foreground/40"
                            />
                            {item}
                        </li>
                    ))}
                </ul>

                {/* Price */}
                <div className="mt-8 border-t border-border pt-6">
                    <p className="text-sm text-foreground font-[family-name:var(--font-libre)]">
                        €50 / month
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        Per agency, everything included. No setup fee. The first
                        five agencies keep this price for good.
                    </p>
                </div>
            </div>
        </div>
    )
}
