"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Field, fieldClass } from "@/components/form-field"
import { authClient } from "@/lib/auth/client"
import { safeNext } from "@/lib/site"

/**
 * Email verification is a six-digit code, not a link — links would need a
 * custom SMTP provider, and the code arrives through Neon's shared sender.
 * Verifying signs the account in, so this ends at /auth/continue.
 */
export function VerifyForm() {
    const router = useRouter()
    const params = useSearchParams()
    const email = params.get("email") ?? ""
    // Verification signs you in, so it can hand straight back to whatever sent
    // you here — an invitation, usually.
    const next = safeNext(params.get("next"))

    const [otp, setOtp] = useState("")
    const [error, setError] = useState("")
    const [notice, setNotice] = useState("")
    const [busy, setBusy] = useState(false)

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setBusy(true)

        try {
            const { error } = await authClient.emailOtp.verifyEmail({ email, otp })

            if (error) {
                setError(error.message ?? "That code didn't match. Try again.")
                setBusy(false)
                return
            }

            router.push(next ?? "/auth/continue")
        } catch {
            setError("Couldn't reach the server. Check your connection.")
            setBusy(false)
        }
    }

    async function resend() {
        setError("")
        setNotice("")
        try {
            const { error } = await authClient.emailOtp.sendVerificationOtp({
                email,
                type: "email-verification",
            })
            if (error) {
                setError(error.message ?? "Couldn't send a new code.")
                return
            }
            setNotice("A new code is on its way.")
        } catch {
            setError("Couldn't reach the server. Check your connection.")
        }
    }

    return (
        <div className="mx-auto w-full max-w-sm px-6 py-14 sm:py-20">
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                Verify
            </p>
            <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                Check your email.
            </h1>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                We sent a six-digit code to{" "}
                <span className="text-foreground">{email || "your inbox"}</span>. It
                expires in fifteen minutes.
            </p>

            <form onSubmit={onSubmit} className="mt-10 space-y-4" noValidate>
                <Field label="Code">
                    <input
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className={`${fieldClass()} tracking-[0.4em]`}
                    />
                </Field>

                <button
                    type="submit"
                    disabled={busy || otp.length < 6}
                    className="w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                >
                    {busy ? "Verifying…" : "Verify"}
                </button>
            </form>

            {error && <p className="mt-4 text-xs text-red-400">{error}</p>}
            {notice && <p className="mt-4 text-xs text-muted-foreground">{notice}</p>}

            <button
                onClick={resend}
                className="mt-5 block text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
            >
                Send another code
            </button>

            {/*
              An address that already had an account gets a normal-looking
              registration and no new code, so this is the way out.
            */}
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Already confirmed this address?{" "}
                <Link
                    href="/agency/sign-in"
                    className="underline underline-offset-4 transition-colors hover:text-foreground"
                >
                    Sign in
                </Link>
                .
            </p>
        </div>
    )
}
