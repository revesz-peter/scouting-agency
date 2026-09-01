import { z } from "zod"

import { COUNTRIES } from "@/lib/application-options"

/** A prospective scout applying through an agency's open link. */
export const joinSchema = z.object({
    name: z.string().trim().min(1, "Required"),
    email: z.string().email("Enter a valid email"),
    city: z.string().trim().optional(),
    country: z
        .string()
        .trim()
        .optional()
        .refine(
            (v) => !v || COUNTRIES.includes(v),
            "Pick a country from the list",
        ),
    instagram: z.string().trim().optional(),
    message: z
        .string()
        .trim()
        .max(2000, "Keep it under 2000 characters")
        .optional(),
})

export type JoinData = z.infer<typeof joinSchema>
