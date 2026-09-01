"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Field, fieldClass } from "@/components/form-field"
import { authClient } from "@/lib/auth/client"
import { safeNext } from "@/lib/site"

export function AgencySignInForm() {
    const router = useRouter()
    const params = useSearchParams()
    const justReset = params.get("reset") === "1"
    // Set when arriving from an invitation, so signing in returns to it.
    const next = safeNext(params.get("next"))

    const [email, setEmail] = useState(params.get("email") ?? "")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    // "sending" is the unverified path: still busy, but doing something else.
    const [busy, setBusy] = useState<false | "signing" | "sending">(false)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setBusy("signing")

        try {
            const { error } = await authClient.signIn.email({ email, password })

            if (!error) {
                // Stays busy on purpose: the navigation is the next thing that
                // happens, and re-enabling first invites a second submit.
                router.push(next ?? "/auth/continue")
                return
            }

            // Verification is required, so an unverified account lands here on
            // its first sign-in. Send a fresh code rather than making them ask.
            if (error.status === 403) {
                // Sending a code takes a moment; say so rather than leaving
                // "Signing in…" on screen looking stuck.
                setBusy("sending")
                await authClient.emailOtp.sendVerificationOtp({
                    email,
                    type: "email-verification",
                })
                router.push(
                    `/auth/verify?email=${encodeURIComponent(email)}${
                        next ? `&next=${encodeURIComponent(next)}` : ""
                    }`,
                )
                return
            }

            setError(error.message ?? "That didn't work. Check your details.")
            setBusy(false)
        } catch {
            // A thrown request — offline, DNS, a blocked origin — never reaches
            // the branches above, so the button would stay disabled for good.
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    return (
        <div className="order-1 flex items-center px-6 py-14 sm:px-10 sm:py-20 lg:order-2 lg:px-14">
            <div className="mx-auto w-full max-w-sm lg:ml-0 lg:mr-auto">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Agency
                </p>
                <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                    Sign in.
                </h1>

                <form onSubmit={onSubmit} className="mt-10 space-y-4" noValidate>
                    <Field label="Email">
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={fieldClass()}
                        />
                    </Field>
                    <Field label="Password">
                        <input
                            type="password"
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={fieldClass()}
                        />
                    </Field>

                    <p className="text-xs text-muted-foreground">
                        <Link
                            href={
                                email
                                    ? `/auth/forgot-password?email=${encodeURIComponent(email)}`
                                    : "/auth/forgot-password"
                            }
                            className="underline underline-offset-4 transition-colors hover:text-foreground"
                        >
                            Forgot your password?
                        </Link>
                    </p>

                    <button
                        type="submit"
                        disabled={busy !== false}
                        className="w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                    >
                        {busy === "sending"
                            ? "Sending a code…"
                            : busy
                              ? "Signing in…"
                              : "Sign in"}
                    </button>
                </form>

                {justReset && !error && (
                    <p role="status" className="mt-4 text-xs leading-relaxed text-muted-foreground">
                        Password updated. Sign in with the new one.
                    </p>
                )}

                {error && (
                    <p role="status" className="mt-4 text-xs leading-relaxed text-red-400">
                        {error}
                    </p>
                )}

                <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                    Not on the platform yet?{" "}
                    <Link
                        href="/agency/register"
                        className="underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                        Create your agency
                    </Link>
                    .
                </p>

                <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
                    Scouts sign in here too — your workspace and personal link
                    are behind the same door.
                </p>
            </div>
        </div>
    )
}
