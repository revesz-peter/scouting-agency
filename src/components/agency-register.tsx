"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Loader2, Check } from "lucide-react"
import { Field, fieldClass } from "@/components/form-field"
import { COUNTRIES } from "@/lib/application-options"

/** Slugs the platform needs for its own routes. */
const RESERVED_SLUGS = [
    "admin",
    "agency",
    "api",
    "apply",
    "l",
    "privacy",
    "s",
    "scouting",
    "sign-in",
    "terms",
    "www",
]

const registrationSchema = z.object({
    agencyName: z.string().trim().min(1, "Required"),
    website: z
        .string()
        .trim()
        .optional()
        .refine(
            (v) => !v || /^https?:\/\/.+\..+/.test(v),
            "Enter a full link starting with http",
        ),
    slug: z
        .string()
        .trim()
        .toLowerCase()
        .min(2, "At least 2 characters")
        .max(32, "Keep it under 32 characters")
        .refine(
            (v) => /^[a-z0-9-]+$/.test(v),
            "Lowercase letters, numbers and dashes only",
        )
        .refine((v) => !v.startsWith("-") && !v.endsWith("-"), "No leading or trailing dash")
        .refine((v) => !RESERVED_SLUGS.includes(v), "That one is reserved"),
    contactName: z.string().trim().min(1, "Required"),
    role: z.string().trim().optional(),
    email: z.string().email("Enter a valid email"),
    phone: z.string().trim().optional(),
    city: z.string().trim().min(1, "Required"),
    country: z
        .string()
        .trim()
        .min(1, "Required")
        .refine((v) => COUNTRIES.includes(v), "Pick a country from the list"),
    boardSize: z
        .string()
        .trim()
        .optional()
        .refine((v) => !v || /^\d+$/.test(v), "Enter a number"),
    notes: z.string().trim().max(2000, "Keep it under 2000 characters").optional(),
    consent: z.literal(true, { error: "You must agree to continue" }),
})

type RegistrationData = z.infer<typeof registrationSchema>

export function AgencyRegisterForm() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<RegistrationData>({
        resolver: zodResolver(registrationSchema),
        mode: "onBlur",
    })

    const [submitted, setSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const slug = watch("slug")

    async function onSubmit(data: RegistrationData) {
        setSubmitError("")
        const formData = new FormData()
        Object.entries(data).forEach(([key, val]) => {
            if (val !== undefined && val !== null && key !== "consent") {
                formData.append(key, String(val))
            }
        })

        try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 15000)
            const res = await fetch("/api/agency-register", {
                method: "POST",
                body: formData,
                signal: controller.signal,
            })
            clearTimeout(timeout)
            if (!res.ok) throw new Error()
            setSubmitted(true)
        } catch (err) {
            if (err instanceof DOMException && err.name === "AbortError") {
                setSubmitError(
                    "Request timed out. Please check your connection and try again.",
                )
            } else {
                setSubmitError(
                    "Something went wrong. Please try again in a moment.",
                )
            }
        }
    }

    if (submitted) {
        return (
            <div className="order-1 flex items-center px-6 py-14 sm:px-10 sm:py-20 lg:order-2 lg:px-14">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mx-auto w-full max-w-sm lg:ml-0 lg:mr-auto"
                >
                    <div className="mb-5 flex h-8 w-8 items-center justify-center border border-foreground">
                        <Check
                            className="h-3.5 w-3.5 text-foreground"
                            strokeWidth={2.5}
                        />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.15em]">
                        Request received
                    </p>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                        We onboard agencies one at a time, so someone reads this
                        properly. Expect a reply within a couple of days.
                    </p>
                    <Link
                        href="/"
                        className="mt-6 inline-block text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                        Back to the site
                    </Link>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="order-1 px-6 py-14 sm:px-10 sm:py-20 lg:order-2 lg:px-14">
            <div className="mx-auto w-full max-w-sm lg:ml-0 lg:mr-auto">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Agency
                </p>
                <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                    Request an account.
                </h1>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    Onboarding is invite-only for now. Tell us about the agency
                    and we&apos;ll set it up with you.
                </p>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-10 space-y-4"
                    noValidate
                >
                    <Field
                        label="Agency name"
                        required
                        error={errors.agencyName?.message}
                    >
                        <input
                            {...register("agencyName")}
                            className={fieldClass(errors.agencyName)}
                            autoComplete="organization"
                            aria-required="true"
                        />
                    </Field>

                    <Field label="Website" error={errors.website?.message}>
                        <input
                            {...register("website")}
                            type="url"
                            inputMode="url"
                            placeholder="https://…"
                            className={fieldClass(errors.website)}
                        />
                    </Field>

                    <Field
                        label="Board link"
                        required
                        error={errors.slug?.message}
                    >
                        <input
                            {...register("slug")}
                            placeholder="your-agency"
                            className={fieldClass(errors.slug)}
                            aria-required="true"
                        />
                        <p className="mt-1.5 break-all text-xs text-muted-foreground">
                            scouting.agency/board/
                            <span className="text-foreground">
                                {slug?.trim() || "your-agency"}
                            </span>
                        </p>
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            Where your board lives and what you embed on your
                            own site.
                        </p>
                    </Field>

                    <div className="grid grid-cols-2 gap-3">
                        <Field
                            label="Your name"
                            required
                            error={errors.contactName?.message}
                        >
                            <input
                                {...register("contactName")}
                                className={fieldClass(errors.contactName)}
                                autoComplete="name"
                                aria-required="true"
                            />
                        </Field>
                        <Field label="Role" error={errors.role?.message}>
                            <input
                                {...register("role")}
                                placeholder="Head of New Faces"
                                className={fieldClass(errors.role)}
                                autoComplete="organization-title"
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field
                            label="Email"
                            required
                            error={errors.email?.message}
                        >
                            <input
                                {...register("email")}
                                type="email"
                                className={fieldClass(errors.email)}
                                autoComplete="email"
                                aria-required="true"
                            />
                        </Field>
                        <Field label="Phone" error={errors.phone?.message}>
                            <input
                                {...register("phone")}
                                type="tel"
                                className={fieldClass(errors.phone)}
                                autoComplete="tel"
                            />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Field
                            label="City"
                            required
                            error={errors.city?.message}
                        >
                            <input
                                {...register("city")}
                                className={fieldClass(errors.city)}
                                autoComplete="address-level2"
                                aria-required="true"
                            />
                        </Field>
                        <Field
                            label="Country"
                            required
                            error={errors.country?.message}
                        >
                            <input
                                {...register("country")}
                                list="register-country-list"
                                placeholder="Start typing…"
                                className={fieldClass(errors.country)}
                                autoComplete="country-name"
                                aria-required="true"
                            />
                            <datalist id="register-country-list">
                                {COUNTRIES.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </Field>
                    </div>

                    <Field
                        label="Talent on your board"
                        error={errors.boardSize?.message}
                    >
                        <input
                            {...register("boardSize")}
                            type="number"
                            inputMode="numeric"
                            min={0}
                            className={fieldClass(errors.boardSize)}
                        />
                    </Field>

                    <Field
                        label="Anything else? (optional)"
                        error={errors.notes?.message}
                    >
                        <textarea
                            {...register("notes")}
                            rows={3}
                            className={`${fieldClass(errors.notes)} resize-y`}
                        />
                    </Field>

                    <label className="flex items-start gap-2.5 pt-1">
                        <input
                            type="checkbox"
                            {...register("consent")}
                            className="mt-0.5 h-3.5 w-3.5 accent-foreground"
                        />
                        <span className="text-xs leading-relaxed text-muted-foreground">
                            I agree to the{" "}
                            <Link
                                href="/terms"
                                className="underline transition-colors hover:text-foreground"
                            >
                                terms of service
                            </Link>{" "}
                            and{" "}
                            <Link
                                href="/privacy"
                                className="underline transition-colors hover:text-foreground"
                            >
                                privacy policy
                            </Link>
                            , and can act for this agency.
                        </span>
                    </label>
                    {errors.consent && (
                        <p className="text-xs text-red-400">
                            {errors.consent.message}
                        </p>
                    )}
                    {submitError && (
                        <p className="text-xs text-red-400">{submitError}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-foreground py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                        ) : (
                            "Request an account →"
                        )}
                    </button>
                </form>

                <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                        href="/agency/sign-in"
                        className="underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                        Sign in
                    </Link>
                    .
                </p>
            </div>
        </div>
    )
}
