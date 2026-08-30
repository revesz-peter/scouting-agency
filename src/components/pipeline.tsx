import { STAGES } from "@/lib/pipeline"

export function Pipeline() {
    return (
        <section
            id="pipeline"
            className="border-y border-border bg-black/[0.015] py-20 sm:py-28"
        >
            <div className="mx-auto max-w-6xl px-6 sm:px-10">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    The pipeline
                </p>
                <h2 className="mt-4 max-w-xl text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                    Every face moves through six stages.
                </h2>

                {/* Desktop: six columns on a hairline */}
                <ol className="mt-14 hidden border-t border-border lg:grid lg:grid-cols-6">
                    {STAGES.map((stage) => (
                        <li
                            key={stage.number}
                            className="relative border-l border-border px-4 pt-6 first:border-l-0 first:pl-0"
                        >
                            <span
                                aria-hidden
                                className="absolute -top-[3px] left-0 h-[5px] w-[5px] bg-foreground"
                            />
                            <p className="text-2xl leading-none text-foreground font-[family-name:var(--font-libre)]">
                                {stage.number}
                            </p>
                            <p className="mt-3 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                                {stage.name}
                            </p>
                            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                {stage.description}
                            </p>
                        </li>
                    ))}
                </ol>

                {/* Mobile: stacked on a left rule */}
                <ol className="mt-10 space-y-8 border-l border-border pl-6 lg:hidden">
                    {STAGES.map((stage) => (
                        <li key={stage.number} className="relative">
                            <span
                                aria-hidden
                                className="absolute -left-[27px] top-[7px] h-[5px] w-[5px] bg-foreground"
                            />
                            <div className="flex items-baseline gap-3">
                                <p className="text-xl leading-none text-foreground font-[family-name:var(--font-libre)]">
                                    {stage.number}
                                </p>
                                <p className="text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                                    {stage.name}
                                </p>
                            </div>
                            <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                                {stage.description}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    )
}
