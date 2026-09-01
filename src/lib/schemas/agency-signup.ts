import { z } from "zod"

import { COUNTRIES } from "@/lib/application-options"

/**
 * Registering an agency and creating the founder's account are one step, so
 * this schema covers both. Shared by the form and the route handler — the
 * server parses what it is about to write, and what it signs up.
 */

/** Slugs the platform needs for its own routes. */
export const RESERVED_SLUGS = [
    "admin",
    "agency",
    "api",
    "apply",
    "auth",
    "dashboard",
    "invite",
    "join",
    "l",
    "onboarding",
    "privacy",
    "s",
    "scout",
    "scouting",
    "sign-in",
    "sign-up",
    "terms",
    "www",
]

/** Better Auth's own floor is 8 characters; don't promise less than it enforces. */
export const MIN_PASSWORD = 8

export const agencySignupSchema = z.object({
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
        .refine(
            (v) => !v.startsWith("-") && !v.endsWith("-"),
            "No leading or trailing dash",
        )
        .refine((v) => !RESERVED_SLUGS.includes(v), "That one is reserved"),
    contactName: z.string().trim().min(1, "Required"),
    role: z.string().trim().optional(),
    email: z.string().email("Enter a valid email"),
    password: z
        .string()
        .min(MIN_PASSWORD, `At least ${MIN_PASSWORD} characters`)
        .max(128, "Keep it under 128 characters"),
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

export type AgencySignupData = z.infer<typeof agencySignupSchema>
