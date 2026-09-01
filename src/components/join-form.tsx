"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Field, fieldClass } from "@/components/form-field"
import { COUNTRIES } from "@/lib/application-options"
import { joinSchema, type JoinData } from "@/lib/schemas/join"

/**
 * The agency's open scout link. No account needed to apply — accepting is what
 * sends an invitation, and the invitation is what creates the membership.
 */
export function JoinForm({ slug, agency }: { slug: string; agency: string }) {
    const [done, setDone] = useState(false)
    const [error, setError] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<JoinData>({
        resolver: zodResolver(joinSchema),
        mode: "onBlur",
    })

    async function onSubmit(values: JoinData) {
        setError("")
        const response = await fetch("/api/join", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...values, slug }),
        })

        if (!response.ok) {
            const body = await response.json().catch(() => ({}))
            setError(body.error ?? "Something went wrong. Try again.")
            return
        }

        setDone(true)
    }

    if (done) {
        return (
            <div className="mt-10">
                <h2 className="text-lg text-foreground font-[family-name:var(--font-libre)]">
                    That&rsquo;s in.
                </h2>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {agency} will review it. If they take you on, an invitation
                    lands in your inbox and your workspace opens from there.
                </p>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-4" noValidate>
            <Field label="Name" required error={errors.name?.message}>
                <input {...register("name")} className={fieldClass(errors.name)} />
            </Field>
            <Field label="Email" required error={errors.email?.message}>
                <input
                    type="email"
                    autoComplete="email"
                    {...register("email")}
                    className={fieldClass(errors.email)}
                />
            </Field>
            <Field label="City" error={errors.city?.message}>
                <input {...register("city")} className={fieldClass(errors.city)} />
            </Field>
            <Field label="Country" error={errors.country?.message}>
                <select {...register("country")} className={fieldClass(errors.country)}>
                    <option value="">Select</option>
                    {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </Field>
            <Field label="Instagram" error={errors.instagram?.message}>
                <input
                    {...register("instagram")}
                    placeholder="@handle"
                    className={fieldClass(errors.instagram)}
                />
            </Field>
            <Field label="Why you" error={errors.message?.message}>
                <textarea
                    rows={4}
                    {...register("message")}
                    placeholder="Where you find faces, and who you have placed before."
                    className={fieldClass(errors.message)}
                />
            </Field>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
            >
                {isSubmitting ? "Sending…" : "Apply to scout"}
            </button>

            {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
    )
}
