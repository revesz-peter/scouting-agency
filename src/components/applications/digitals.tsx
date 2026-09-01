"use client"

import { useState } from "react"

const SHOTS = ["Headshot", "Profile left", "Profile right", "Full body"]

/**
 * The four digitals, one large with thumbnails beneath.
 *
 * The frames are empty because photo storage is not built: the files arrive
 * attached to the notification email and are never kept. The panel is here
 * because this is where they belong, and an empty frame says that more clearly
 * than leaving the column out.
 */
export function Digitals({ name }: { name: string }) {
    const [shot, setShot] = useState(0)

    return (
        <div>
            <div className="flex aspect-4/5 items-end bg-black/[0.04] p-3">
                <span className="text-xs uppercase tracking-[0.1em] text-foreground/30">
                    {SHOTS[shot]}
                </span>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-2">
                {SHOTS.map((label, i) => (
                    <button
                        key={label}
                        type="button"
                        onClick={() => setShot(i)}
                        aria-label={label}
                        aria-pressed={shot === i}
                        className={`aspect-4/5 border transition-colors ${
                            shot === i
                                ? "border-foreground bg-black/[0.06]"
                                : "border-border bg-black/[0.03] hover:border-foreground/30"
                        }`}
                    />
                ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground/70">
                {name.split(" ")[0]}&apos;s digitals arrived attached to the
                application email. Photo storage is not built yet, so they are
                not kept here.
            </p>
        </div>
    )
}
