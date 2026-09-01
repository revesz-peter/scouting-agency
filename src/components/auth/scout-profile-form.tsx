"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Field, fieldClass } from "@/components/form-field"
import { COUNTRIES } from "@/lib/application-options"
import { scoutProfileSchema, type ScoutProfileData } from "@/lib/schemas/scout"
import { siteLink } from "@/lib/site"

/**
 * The code is theirs to choose, so it stays short enough for an Instagram or
 * TikTok bio — it becomes /s/<code>, the link they hand out.
 */
export function ScoutProfileForm({ defaultName }: { defaultName: string }) {
    const router = useRouter()
    const [error, setError] = useState("")

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
    } = useForm<ScoutProfileData>({
        resolver: zodResolver(scoutProfileSchema),
        mode: "onBlur",
        defaultValues: { displayName: defaultName },
    })

    const code = useWatch({ control, name: "code" })

    async function onSubmit(values: ScoutProfileData) {
        setError("")
        const response = await fetch("/api/scout/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
        })

        if (!response.ok) {
            const body = await response.json().catch(() => ({}))
            setError(body.error ?? "Something went wrong. Try again.")
            return
        }

        router.push("/scout")
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-4" noValidate>
            <Field label="Name" required error={errors.displayName?.message}>
                <input
                    {...register("displayName")}
                    className={fieldClass(errors.displayName)}
                />
            </Field>

            <Field label="Your code" required error={errors.code?.message}>
                <input
                    {...register("code")}
                    placeholder="ana"
                    autoCapitalize="none"
                    className={fieldClass(errors.code)}
                />
            </Field>
            <p className="text-xs text-muted-foreground">
                Your link:{" "}
                <span className="text-foreground">
                    {siteLink(`/s/${code || "…"}`)}
                </span>
            </p>

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

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-40"
            >
                {isSubmitting ? "Saving…" : "Open my workspace"}
            </button>

            {error && <p className="text-xs text-red-400">{error}</p>}
        </form>
    )
}
