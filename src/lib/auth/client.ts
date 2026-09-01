"use client"

import { createAuthClient } from "@neondatabase/auth/next"

/**
 * Browser-side Neon Auth, talking to our own /api/auth proxy on the same origin
 * — so it takes no URL. Use it from the sign-in, sign-up, and verify forms.
 */
export const authClient = createAuthClient()

export const { signIn, signUp, signOut, useSession } = authClient
