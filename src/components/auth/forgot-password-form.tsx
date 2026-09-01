"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

import { Field, fieldClass } from "@/components/form-field"
import { authClient } from "@/lib/auth/client"
import { MIN_PASSWORD } from "@/lib/schemas/agency-signup"

/**
 * Resetting is a six-digit code, like verifying an address — the shared sender
 * cannot do reset links, and one kind of code is easier to explain than two.
 *
 * Both steps live on one screen: ask for the code, then set the new password
 * without navigating away, so the code stays on screen while it is typed.
 */
export function ForgotPasswordForm() {
    const router = useRouter()
    const prefilled = useSearchParams().get("email") ?? ""

    const [step, setStep] = useState<"request" | "reset">("request")
    const [email, setEmail] = useState(prefilled)
    const [otp, setOtp] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [notice, setNotice] = useState("")
    const [busy, setBusy] = useState(false)

    async function requestCode(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setNotice("")
        setBusy(true)

        let failed = false
        try {
            const { error } = await authClient.forgetPassword.emailOtp({ email })
            if (error) {
                setError(error.message ?? "Couldn't send a code. Try again.")
                failed = true
            }
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            failed = true
        }

        setBusy(false)
        if (failed) return

        // Deliberately says "if" — confirming whether an address has an account
        // would turn this form into a way of finding out.
        setNotice("If that address has an account, a code is on its way.")
        setStep("reset")
    }

    async function reset(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setBusy(true)

        try {
            const { error } = await authClient.emailOtp.resetPassword({
                email,
                otp,
                password,
            })

            if (error) {
                setError(error.message ?? "That code didn't match. Try again.")
                setBusy(false)
                return
            }

            // Resetting does not sign you in, so send them to do that.
            router.push(
                `/agency/sign-in?reset=1&email=${encodeURIComponent(email)}`,
            )
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    return (
        <div className="mx-auto w-full max-w-sm px-6 py-14 sm:py-20">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Password
            </p>
            <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                {step === "request" ? "Reset it." : "Pick a new one."}
            </h1>

            {step === "request" ? (
                <form onSubmit={requestCode} className="mt-10 space-y-4" noValidate>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        We email a six-digit code to the address on the account.
                    </p>
                    <Field label="Email">
                        <input
                            type="email"
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={fieldClass()}
                        />
                    </Field>
                    <button
                        type="submit"
                        disabled={busy || !email}
                        className="w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                    >
                        {busy ? "Sending…" : "Send the code"}
                    </button>
                </form>
            ) : (
                <form onSubmit={reset} className="mt-10 space-y-4" noValidate>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        Enter the code sent to{" "}
                        <span className="text-foreground">{email}</span> and choose
                        a new password.
                    </p>
                    <Field label="Code">
                        <input
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={otp}
                            onChange={(e) =>
                                setOtp(e.target.value.replace(/\D/g, ""))
                            }
                            className={`${fieldClass()} tracking-[0.4em]`}
                        />
                    </Field>
                    <Field label="New password">
                        <input
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={fieldClass()}
                        />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            At least {MIN_PASSWORD} characters.
                        </p>
                    </Field>
                    <button
                        type="submit"
                        disabled={
                            busy || otp.length < 6 || password.length < MIN_PASSWORD
                        }
                        className="w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                    >
                        {busy ? "Saving…" : "Set the password"}
                    </button>
                </form>
            )}

            {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
            {notice && (
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    {notice}
                </p>
            )}

            <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
                <Link
                    href="/agency/sign-in"
                    className="underline underline-offset-4 transition-colors hover:text-foreground"
                >
                    Back to sign in
                </Link>
            </p>
        </div>
    )
}
