import { z } from "zod"

import {
    BUSTS,
    COUNTRIES,
    EYE_COLORS,
    GENDERS,
    HAIR_COLORS,
    HEIGHTS,
    HIPS,
    SHOE_SIZES,
    WAISTS,
    type Option,
} from "@/lib/application-options"

/**
 * The application form's shape, shared by the browser form and the route
 * handler. It lives here rather than in the component so the server can parse
 * what it is about to write — a submission that never touched our form still
 * has to clear the same bar, including the age floor the terms commit to.
 */

export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"]
export const MIN_AGE = 14

// z.instanceof rather than a refine chain: a missing photo arrives as null on
// the server, and chained refines all run even after one fails — so a size
// check would read .size off null and throw.
export const photoSchema = z
    .instanceof(File, { message: "Please upload a file" })
    .refine((f) => f.size <= MAX_FILE_SIZE, "Max 10 MB per photo")
    .refine(
        (f) => ACCEPTED_TYPES.includes(f.type),
        "JPG, PNG, WebP, or HEIC only",
    )

export function ageFrom(dob: string): number {
    const birth = new Date(dob)
    const now = new Date()
    let age = now.getFullYear() - birth.getFullYear()
    const monthDiff = now.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        age--
    }
    return age
}

const optionalUrl = z
    .string()
    .trim()
    .optional()
    .refine(
        (v) => !v || /^https?:\/\/.+\..+/.test(v),
        "Enter a full link starting with http",
    )

/** A measurement has to be one the form actually offers, not any integer. */
function oneOf(options: Option[], message: string) {
    const values = options.map((o) => o.value)
    return z.string().min(1, "Required").refine((v) => values.includes(v), message)
}

export const applicationSchema = z.object({
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
    gender: z
        .string()
        .min(1, "Required")
        .refine((v) => GENDERS.includes(v), "Pick an option from the list"),
    city: z.string().trim().min(1, "Required"),
    country: z
        .string()
        .trim()
        .min(1, "Required")
        .refine((v) => COUNTRIES.includes(v), "Pick a country from the list"),
    instagram: z.string().trim().optional(),

    // 02 Measurements
    height: oneOf(HEIGHTS, "Pick a height from the list"),
    bust: oneOf(BUSTS, "Pick a measurement from the list"),
    waist: oneOf(WAISTS, "Pick a measurement from the list"),
    hips: oneOf(HIPS, "Pick a measurement from the list"),
    shoeSize: oneOf(SHOE_SIZES, "Pick a size from the list"),
    hairColor: z
        .string()
        .min(1, "Required")
        .refine((v) => HAIR_COLORS.includes(v), "Pick an option from the list"),
    eyeColor: z
        .string()
        .min(1, "Required")
        .refine((v) => EYE_COLORS.includes(v), "Pick an option from the list"),

    // 03/04/05
    videoLink: optionalUrl,
    portfolioLink: optionalUrl,
    notes: z.string().trim().max(2000, "Keep it under 2000 characters").optional(),

    consent: z.literal(true, { error: "You must agree to continue" }),
})

export type ApplicationData = z.infer<typeof applicationSchema>
