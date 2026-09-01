"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Field, fieldClass } from "@/components/form-field"
import { COUNTRIES } from "@/lib/application-options"
import {
    agencySignupSchema,
    MIN_PASSWORD,
    type AgencySignupData,
} from "@/lib/schemas/agency-signup"

export function AgencyRegisterForm() {
    const router = useRouter()
    const {
        register,
        handleSubmit,
        control,
        setError,
        formState: { errors, isSubmitting },
    } = useForm<AgencySignupData>({
        resolver: zodResolver(agencySignupSchema),
        mode: "onBlur",
    })

    const [submitError, setSubmitError] = useState("")
    const slug = useWatch({ control, name: "slug" })

    async function onSubmit(data: AgencySignupData) {
        setSubmitError("")

        try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 15000)
            const res = await fetch("/api/agency-register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                signal: controller.signal,
            })
            clearTimeout(timeout)

            const body = await res.json().catch(() => ({}))

            if (!res.ok) {
                // Put the message on the field it belongs to when the server
                // says which one — the slug and email are the ones that clash.
                if (body.field === "slug" || body.field === "email") {
                    setError(body.field, { message: body.error })
                } else {
                    setSubmitError(body.error ?? "Something went wrong.")
                }
                return
            }

            // The code is already on its way; verifying signs them in.
            router.push(`/auth/verify?email=${encodeURIComponent(data.email)}`)
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

    return (
        <div className="order-1 px-6 py-14 sm:px-10 sm:py-20 lg:order-2 lg:px-14">
            <div className="mx-auto w-full max-w-sm lg:ml-0 lg:mr-auto">
                <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                    Agency
                </p>
                <h1 className="mt-4 text-2xl leading-[1.15] text-foreground sm:text-3xl font-[family-name:var(--font-libre)]">
                    Create your agency.
                </h1>
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    Tell us about the agency and pick a password. We email a
                    six-digit code to confirm the address, and your apply link
                    works the moment you&apos;re in.
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

                    <Field
                        label="Password"
                        required
                        error={errors.password?.message}
                    >
                        <input
                            {...register("password")}
                            type="password"
                            className={fieldClass(errors.password)}
                            autoComplete="new-password"
                            aria-required="true"
                        />
                        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            At least {MIN_PASSWORD} characters. We email a
                            six-digit code to the address above and you cannot
                            get in without it — that check is how an agency
                            proves the address is really theirs, so applicants
                            and scouts know who they are sending to.
                        </p>
                    </Field>

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
                            "Create the agency →"
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
