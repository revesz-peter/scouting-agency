import { z } from "zod"

import { COUNTRIES } from "@/lib/application-options"

/** Codes that would collide with the platform's own /s routes or read badly. */
const RESERVED_CODES = ["admin", "api", "apply", "join", "new", "s", "scouting"]

export const scoutProfileSchema = z.object({
    displayName: z.string().trim().min(1, "Required"),
    code: z
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
        .refine((v) => !RESERVED_CODES.includes(v), "That one is reserved"),
    city: z.string().trim().optional(),
    country: z
        .string()
        .trim()
        .optional()
        .refine(
            (v) => !v || COUNTRIES.includes(v),
            "Pick a country from the list",
        ),
})

export type ScoutProfileData = z.infer<typeof scoutProfileSchema>
