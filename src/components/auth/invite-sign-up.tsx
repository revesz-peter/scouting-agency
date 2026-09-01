"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Field, fieldClass } from "@/components/form-field"
import { authClient } from "@/lib/auth/client"
import { MIN_PASSWORD } from "@/lib/schemas/agency-signup"

/**
 * Creating an account from an invitation.
 *
 * The email is fixed to the one invited and cannot be edited — that is what
 * makes accepting possible, and it stops anyone reaching the mismatch state by
 * signing up with a different address.
 */
export function InviteSignUp({
    invitationId,
    email,
}: {
    invitationId: string
    email: string
}) {
    const router = useRouter()
    const [name, setName] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [busy, setBusy] = useState(false)

    const next = `/invite/${invitationId}`

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError("")
        setBusy(true)

        let ok = false
        try {
            const { error } = await authClient.signUp.email({
                name,
                email,
                password,
            })
            if (error) {
                setError(error.message ?? "Couldn't create your account.")
            } else {
                ok = true
            }
        } catch {
            setError("Couldn't reach the server. Check your connection.")
        }

        if (!ok) {
            setBusy(false)
            return
        }

        // Verification is required before the invitation can be accepted, and
        // verifying comes back here to accept it.
        router.push(
            `/auth/verify?email=${encodeURIComponent(email)}&next=${encodeURIComponent(next)}`,
        )
    }

    return (
        <>
            <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
                <Field label="Email">
                    <input readOnly value={email} className={fieldClass()} />
                </Field>
                <Field label="Your name" required>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        className={fieldClass()}
                    />
                </Field>
                <Field label="Password" required>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        className={fieldClass()}
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                        At least {MIN_PASSWORD} characters. We email a code to
                        confirm the address.
                    </p>
                </Field>

                <button
                    type="submit"
                    disabled={busy || !name || password.length < MIN_PASSWORD}
                    className="w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
                >
                    {busy ? "Creating…" : "Create account & accept"}
                </button>

                {error && <p className="text-xs text-red-400">{error}</p>}
            </form>

            <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                Already have an account?{" "}
                <Link
                    href={`/agency/sign-in?next=${encodeURIComponent(next)}&email=${encodeURIComponent(email)}`}
                    className="underline underline-offset-4 transition-colors hover:text-foreground"
                >
                    Sign in
                </Link>{" "}
                to accept it.
            </p>
        </>
    )
}
