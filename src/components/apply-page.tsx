"use client"

import { useState, useRef, useCallback } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AnimatePresence, motion } from "framer-motion"
import { Upload, X, Loader2, Check } from "lucide-react"
import Link from "next/link"
import { Field, fieldClass } from "@/components/form-field"
import type { Agency } from "@/lib/agencies"
import type { Scout } from "@/lib/scouts"
import {
    COUNTRIES,
    EYE_COLORS,
    GENDERS,
    HAIR_COLORS,
} from "@/lib/application-options"

// ─── Schema ───────────────────────────────────────────────

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"]
const MIN_AGE = 14

const photoSchema = z
    .custom<File>()
    .refine((f) => f instanceof File, "Please upload a file")
    .refine((f) => f.size <= MAX_FILE_SIZE, "Max 10 MB per photo")
    .refine(
        (f) => ACCEPTED_TYPES.includes(f.type),
        "JPG, PNG, WebP, or HEIC only",
    )

function ageFrom(dob: string): number {
    const birth = new Date(dob)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const monthDiff = now.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        age--
    }
    return age
}

/** A measurement typed in as a plain number, in cm (or EU for shoes). */
function measurement(min: number, max: number) {
    return z
        .string()
        .trim()
        .min(1, "Required")
        .refine((v) => /^\d+$/.test(v), "Enter a number")
        .refine(
            (v) => Number(v) >= min && Number(v) <= max,
            `Between ${min} and ${max}`,
        )
}


const optionalUrl = z
    .string()
    .trim()
    .optional()
    .refine(
        (v) => !v || /^https?:\/\/.+\..+/.test(v),
        "Enter a full link starting with http",
    )

const applicationSchema = z.object({
    // 01 Personal
    firstName: z.string().trim().min(1, "Required"),
    lastName: z.string().trim().min(1, "Required"),
    email: z.string().email("Enter a valid email"),
    phone: z.string().trim().min(6, "Required"),
    dob: z
        .string()
        .min(1, "Required")
        .refine((v) => !Number.isNaN(Date.parse(v)), "Enter a valid date")
        .refine((v) => ageFrom(v) >= MIN_AGE, `Minimum age is ${MIN_AGE}`)
        .refine((v) => ageFrom(v) <= 99, "Enter a valid date"),
    gender: z.string().min(1, "Required"),
    city: z.string().trim().min(1, "Required"),
    country: z
        .string()
        .trim()
        .min(1, "Required")
        .refine((v) => COUNTRIES.includes(v), "Pick a country from the list"),
    instagram: z.string().trim().optional(),

    // 02 Measurements
    height: measurement(140, 220),
    bust: measurement(60, 130),
    waist: measurement(40, 120),
    hips: measurement(60, 140),
    shoeSize: measurement(30, 52),
    hairColor: z.string().min(1, "Required"),
    eyeColor: z.string().min(1, "Required"),

    // 03/04/05
    videoLink: optionalUrl,
    portfolioLink: optionalUrl,
    notes: z.string().trim().max(2000, "Keep it under 2000 characters").optional(),

    consent: z.literal(true, { error: "You must agree to continue" }),
})

type ApplicationData = z.infer<typeof applicationSchema>

// ─── Digitals ─────────────────────────────────────────────

interface PhotoSlot {
    key: string
    label: string
    hint: string
    file: File | null
    preview: string | null
    error: string | null
}

const PHOTO_SLOTS: { key: string; label: string; hint: string }[] = [
    {
        key: "headshot",
        label: "Headshot",
        hint: "Face the camera, hair back, no make-up",
    },
    { key: "profile_left", label: "Profile left", hint: "Turn 90° to your left" },
    {
        key: "profile_right",
        label: "Profile right",
        hint: "Turn 90° to your right",
    },
    { key: "full_body", label: "Full body", hint: "Head to toe, arms relaxed" },
]

function emptySlots(): PhotoSlot[] {
    return PHOTO_SLOTS.map((s) => ({
        ...s,
        file: null,
        preview: null,
        error: null,
    }))
}

// ─── Component ────────────────────────────────────────────

export function ApplyPage({
    agencies,
    scoped = false,
    referrer,
}: {
    /** Agencies this application is sent to. */
    agencies: Agency[]
    /** True when reached through an agency's own apply link. */
    scoped?: boolean
    /** Scout whose personal link this application came through. */
    referrer?: Scout
}) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<ApplicationData>({
        resolver: zodResolver(applicationSchema),
        mode: "onBlur",
    })

    const [photos, setPhotos] = useState<PhotoSlot[]>(emptySlots)
    const [photoError, setPhotoError] = useState("")
    const [submitted, setSubmitted] = useState(false)
    const [submitError, setSubmitError] = useState("")
    const fileRefs = useRef<(HTMLInputElement | null)[]>([])

    const handlePhoto = useCallback((index: number, file: File | null) => {
        if (!file) return
        const result = photoSchema.safeParse(file)
        if (!result.success) {
            setPhotos((prev) =>
                prev.map((p, i) =>
                    i === index
                        ? { ...p, error: result.error.issues[0].message }
                        : p,
                ),
            )
            return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
            setPhotos((prev) =>
                prev.map((p, i) =>
                    i === index
                        ? {
                              ...p,
                              file,
                              preview: e.target?.result as string,
                              error: null,
                          }
                        : p,
                ),
            )
            setPhotoError("")
        }
        reader.readAsDataURL(file)
    }, [])

    const removePhoto = useCallback((index: number) => {
        setPhotos((prev) =>
            prev.map((p, i) =>
                i === index
                    ? { ...p, file: null, preview: null, error: null }
                    : p,
            ),
        )
        if (fileRefs.current[index]) fileRefs.current[index]!.value = ""
    }, [])

    async function onSubmit(data: ApplicationData) {
        setSubmitError("")
        if (photos.some((p) => !p.file)) {
            setPhotoError("All four digitals are required.")
            return
        }

        const formData = new FormData()
        Object.entries(data).forEach(([key, val]) => {
            if (val !== undefined && val !== null && key !== "consent") {
                formData.append(key, String(val))
            }
        })
        formData.append("agencies", agencies.map((a) => a.slug).join(","))
        if (referrer) formData.append("ref", referrer.code)
        photos.forEach((p) => {
            if (p.file) formData.append(`photo_${p.key}`, p.file)
        })

        try {
            const controller = new AbortController()
            const timeout = setTimeout(() => controller.abort(), 30000)
            const res = await fetch("/api/apply", {
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
            <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center px-6 py-24 sm:px-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center text-center"
                >
                    <div className="mb-5 flex h-8 w-8 items-center justify-center border border-foreground">
                        <Check
                            className="h-3.5 w-3.5 text-foreground"
                            strokeWidth={2.5}
                        />
                    </div>
                    <p className="text-xs font-medium uppercase tracking-[0.15em]">
                        Application received
                    </p>
                    <p className="mt-2 max-w-sm text-xs leading-relaxed text-muted-foreground">
                        {agencies.length === 1
                            ? `${agencies[0].name} will be in touch if there's a match.`
                            : "Each agency reviews independently. Any of them may contact you."}
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            setSubmitted(false)
                            setSubmitError("")
                            setPhotoError("")
                            setPhotos(emptySlots())
                            reset()
                        }}
                        className="mt-6 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
                    >
                        Submit another
                    </button>
                </motion.div>
            </main>
        )
    }

    return (
        <main className="mx-auto w-full max-w-2xl px-6 py-16 sm:px-10 sm:py-20">
            {/* ── Intro ── */}
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
                {scoped ? "Direct application" : "One application · every agency"}
            </p>
            <h1 className="mt-4 text-3xl leading-[1.1] text-foreground sm:text-4xl font-[family-name:var(--font-libre)]">
                Become a model
            </h1>
            <p className="mt-5 max-w-xl text-xs leading-relaxed text-muted-foreground">
                {scoped ? (
                    <>
                        You followed {agencies[0]?.name}&apos;s application
                        link, so your details go to them and no one else. They
                        review it directly and will contact you if there&apos;s
                        a match.
                    </>
                ) : (
                    <>
                        This is a network application: your details are sent to
                        every modelling agency on scouting — currently{" "}
                        {agencies.length}{" "}
                        {agencies.length === 1 ? "agency" : "agencies"}. Each
                        agency reviews it independently and any of them may
                        contact you.
                    </>
                )}{" "}
                No professional photos required — natural, un-retouched digitals
                in soft daylight.
            </p>

            {/* ── Recipients ── */}
            <div className="mt-10 border border-border p-5">
                <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    You are applying to
                </p>
                <ul className="mt-3 space-y-1.5">
                    {agencies.map((agency) => (
                        <li
                            key={agency.slug}
                            className="flex items-baseline justify-between gap-4"
                        >
                            <span className="text-sm text-foreground font-[family-name:var(--font-libre)]">
                                {agency.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {agency.location}
                            </span>
                        </li>
                    ))}
                </ul>
                {referrer && (
                    <p className="mt-4 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                        You came through {referrer.name}&apos;s scouting link,
                        so your application is credited to them.
                    </p>
                )}
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                    By submitting, you agree that your application and photos
                    are shared with{" "}
                    {agencies.length === 1
                        ? "the agency listed above"
                        : "each agency listed above"}
                    .
                </p>
            </div>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-14 space-y-14"
                noValidate
            >
                {/* ── 01 Personal ── */}
                <Section number="01" title="Personal">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="First name"
                            required
                            error={errors.firstName?.message}
                        >
                            <input
                                {...register("firstName")}
                                className={fieldClass(errors.firstName)}
                                autoComplete="given-name"
                                aria-required="true"
                            />
                        </Field>
                        <Field
                            label="Last name"
                            required
                            error={errors.lastName?.message}
                        >
                            <input
                                {...register("lastName")}
                                className={fieldClass(errors.lastName)}
                                autoComplete="family-name"
                                aria-required="true"
                            />
                        </Field>
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
                        <Field
                            label="Phone"
                            required
                            error={errors.phone?.message}
                        >
                            <input
                                {...register("phone")}
                                type="tel"
                                placeholder="+36 20 123 4567"
                                className={fieldClass(errors.phone)}
                                autoComplete="tel"
                                aria-required="true"
                            />
                        </Field>
                        <Field
                            label="Date of birth"
                            required
                            error={errors.dob?.message}
                        >
                            <input
                                {...register("dob")}
                                type="date"
                                className={fieldClass(errors.dob)}
                                autoComplete="bday"
                                aria-required="true"
                            />
                        </Field>
                        <SelectField
                            label="Gender"
                            required
                            error={errors.gender?.message}
                            options={GENDERS}
                            registration={register("gender")}
                        />
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
                                list="country-list"
                                placeholder="Start typing a country…"
                                className={fieldClass(errors.country)}
                                autoComplete="country-name"
                                aria-required="true"
                            />
                            <datalist id="country-list">
                                {COUNTRIES.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </Field>
                        <div className="sm:col-span-2">
                            <Field
                                label="Instagram"
                                error={errors.instagram?.message}
                            >
                                <input
                                    {...register("instagram")}
                                    placeholder="@"
                                    className={fieldClass(errors.instagram)}
                                />
                            </Field>
                        </div>
                    </div>

                </Section>

                {/* ── 02 Measurements ── */}
                <Section number="02" title="Measurements">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <MeasurementField
                            label="Height (cm)"
                            error={errors.height?.message}
                            registration={register("height")}
                            min={140}
                            max={220}
                        />
                        <MeasurementField
                            label="Bust (cm)"
                            error={errors.bust?.message}
                            registration={register("bust")}
                            min={60}
                            max={130}
                        />
                        <MeasurementField
                            label="Waist (cm)"
                            error={errors.waist?.message}
                            registration={register("waist")}
                            min={40}
                            max={120}
                        />
                        <MeasurementField
                            label="Hips (cm)"
                            error={errors.hips?.message}
                            registration={register("hips")}
                            min={60}
                            max={140}
                        />
                        <MeasurementField
                            label="Shoe size (EU)"
                            error={errors.shoeSize?.message}
                            registration={register("shoeSize")}
                            min={30}
                            max={52}
                        />
                        <SelectField
                            label="Hair color"
                            required
                            error={errors.hairColor?.message}
                            options={HAIR_COLORS}
                            registration={register("hairColor")}
                        />
                        <SelectField
                            label="Eye color"
                            required
                            error={errors.eyeColor?.message}
                            options={EYE_COLORS}
                            registration={register("eyeColor")}
                        />
                    </div>
                </Section>

                {/* ── 03 Digitals ── */}
                <Section number="03" title="Digitals">
                    <p className="mb-6 max-w-lg text-xs leading-relaxed text-muted-foreground">
                        All four photos are required. Natural light, no
                        retouching. Follow the note under each slot for framing
                        and pose.
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {photos.map((photo, i) => (
                            <div key={photo.key}>
                                <AnimatePresence mode="wait">
                                    {photo.preview ? (
                                        <motion.div
                                            key="preview"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="group relative aspect-4/5 overflow-hidden border border-border"
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={photo.preview}
                                                alt={photo.label}
                                                className="h-full w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePhoto(i)}
                                                aria-label={`Remove ${photo.label} photo`}
                                                className="absolute right-1.5 top-1.5 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            key="upload"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            type="button"
                                            onClick={() =>
                                                fileRefs.current[i]?.click()
                                            }
                                            className={`flex aspect-4/5 w-full flex-col items-center justify-center gap-2 border border-dashed transition-colors hover:border-foreground/30 ${
                                                photo.error || photoError
                                                    ? "border-red-400/50"
                                                    : "border-border"
                                            }`}
                                        >
                                            <Upload className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                                                Upload
                                            </span>
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                                <p className="mt-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                                    {photo.label}
                                    <span className="ml-0.5 text-foreground/30">
                                        *
                                    </span>
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                    {photo.hint}
                                </p>
                                {photo.error && (
                                    <p className="mt-1 text-xs text-red-400">
                                        {photo.error}
                                    </p>
                                )}
                                <input
                                    ref={(el) => {
                                        fileRefs.current[i] = el
                                    }}
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/heic"
                                    className="hidden"
                                    onChange={(e) =>
                                        handlePhoto(
                                            i,
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                />
                            </div>
                        ))}
                    </div>
                    {photoError && (
                        <p className="mt-3 text-xs text-red-400">{photoError}</p>
                    )}

                    <div className="mt-8 border-t border-border pt-6">
                        <p className="mb-3 max-w-lg text-xs leading-relaxed text-muted-foreground">
                            Optional: a short video (up to ~60 seconds) — say
                            your name, height and hometown, then a slow 360°
                            turn. Upload it anywhere you like and paste the
                            link.
                        </p>
                        <Field
                            label="Video link (optional)"
                            error={errors.videoLink?.message}
                        >
                            <input
                                {...register("videoLink")}
                                type="url"
                                inputMode="url"
                                placeholder="https://…"
                                className={fieldClass(errors.videoLink)}
                            />
                        </Field>
                    </div>
                </Section>

                {/* ── 04 Your book ── */}
                <Section number="04" title="Your book">
                    <p className="mb-5 max-w-lg text-xs leading-relaxed text-muted-foreground">
                        Paste a link to your full book — Google Drive, Dropbox,
                        WeTransfer, a portfolio site, anything we can open. Make
                        sure the link is publicly viewable.
                    </p>
                    <Field
                        label="Portfolio link (optional)"
                        error={errors.portfolioLink?.message}
                    >
                        <input
                            {...register("portfolioLink")}
                            type="url"
                            inputMode="url"
                            placeholder="https://drive.google.com/…"
                            className={fieldClass(errors.portfolioLink)}
                        />
                    </Field>
                </Section>

                {/* ── 05 Anything else ── */}
                <Section number="05" title="Anything else">
                    <Field
                        label="Anything we should know? (optional)"
                        error={errors.notes?.message}
                    >
                        <textarea
                            {...register("notes")}
                            rows={4}
                            className={`${fieldClass(errors.notes)} resize-y`}
                        />
                    </Field>
                </Section>

                {/* ── Consent + submit ── */}
                <div className="space-y-5 border-t border-border pt-8">
                    <label className="flex items-start gap-2.5">
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
                            , and confirm I am the person applying (or their
                            legal guardian if under 18).
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
                        className="w-full bg-foreground py-3 text-xs font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 disabled:opacity-50 sm:w-auto sm:px-10"
                    >
                        {isSubmitting ? (
                            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                        ) : (
                            "Submit application →"
                        )}
                    </button>
                </div>
            </form>
        </main>
    )
}

// ─── Section heading ──────────────────────────────────────

function Section({
    number,
    title,
    children,
}: {
    number: string
    title: string
    children: React.ReactNode
}) {
    return (
        <section>
            <div className="mb-6 flex items-baseline gap-4 border-b border-border pb-3">
                <span className="text-xl leading-none text-foreground/25 font-[family-name:var(--font-libre)]">
                    {number}
                </span>
                <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-foreground">
                    {title}
                </h2>
            </div>
            {children}
        </section>
    )
}

// ─── Measurement field ────────────────────────────────────

function MeasurementField({
    label,
    error,
    registration,
    min,
    max,
}: {
    label: string
    error?: string
    registration: ReturnType<ReturnType<typeof useForm<ApplicationData>>["register"]>
    min: number
    max: number
}) {
    return (
        <Field label={label} required error={error}>
            <input
                {...registration}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                aria-required="true"
                className={fieldClass(error ? { message: error } : undefined)}
            />
        </Field>
    )
}

// ─── Select field ─────────────────────────────────────────

function SelectField({
    label,
    required,
    error,
    options,
    registration,
}: {
    label: string
    required?: boolean
    error?: string
    options: string[]
    registration: ReturnType<ReturnType<typeof useForm<ApplicationData>>["register"]>
}) {
    return (
        <Field label={label} required={required} error={error}>
            <select
                {...registration}
                defaultValue=""
                aria-required={required}
                className={`${fieldClass(error ? { message: error } : undefined)} appearance-none rounded-none`}
            >
                <option value="" disabled>
                    Select…
                </option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </Field>
    )
}
