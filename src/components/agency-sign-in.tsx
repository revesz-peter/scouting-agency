"use client"

import { useState } from "react"
import Link from "next/link"
import { Field, fieldClass } from "@/components/form-field"

export function AgencySignInForm() {
    const [notice, setNotice] = useState(false)

    return (
        <div className="order-1 flex items-center px-6 py-14 sm:px-10 sm:py-20 lg:order-2 lg:px-14">
            <div className="mx-auto w-full max-w-sm lg:ml-0 lg:mr-auto">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Agency
                </p>
                <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                    Sign in.
                </h1>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        setNotice(true)
                    }}
                    className="mt-10 space-y-4"
                    noValidate
                >
                    <Field label="Email">
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            className={fieldClass()}
                        />
                    </Field>
                    <Field label="Password">
                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            className={fieldClass()}
                        />
                    </Field>

                    <button
                        type="submit"
                        className="w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90"
                    >
                        Sign in
                    </button>
                </form>

                {notice && (
                    <p
                        role="status"
                        className="mt-4 text-xs leading-relaxed text-muted-foreground"
                    >
                        Access is invite-only while we onboard partner agencies.
                    </p>
                )}

                <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                    Not on the platform yet?{" "}
                    <Link
                        href="/agency/register"
                        className="underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                        Request an account
                    </Link>
                    .
                </p>

                <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
                    Scouts sign in here too — your workspace and personal link
                    are behind the same door.
                </p>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    Looking to be scouted?{" "}
                    <Link
                        href="/apply"
                        className="underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                        Apply as a model
                    </Link>
                    .
                </p>
            </div>
        </div>
    )
}
