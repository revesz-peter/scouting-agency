"use client"

const ITEMS = [
    "Paris FW26",
    "Milan SS25",
    "New York Resort",
    "London AW25",
    "Tokyo Fashion Week",
    "Copenhagen CPHFW",
    "Budapest BCEFW",
    "Berlin FW",
]

export function RunwaySlideshow() {
    const strip = [...ITEMS, ...ITEMS]

    return (
        <div className="overflow-hidden">
            <div className="flex gap-2 animate-marquee hover:[animation-play-state:paused]">
                {strip.map((label, i) => (
                    <div
                        key={i}
                        className="relative flex h-44 w-28 flex-none items-end overflow-hidden bg-black/[0.03] p-2.5 lg:h-52 lg:w-32"
                    >
                        <span className="text-[10px] font-light tracking-wide text-black/30">
                            {label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}
