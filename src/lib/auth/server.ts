import { createNeonAuth } from "@neondatabase/auth/next/server"

/**
 * Server-side Neon Auth. Carries every Better Auth server method — getSession,
 * signUp, organization, emailOtp — plus handler() for the API route and
 * middleware() for the proxy.
 *
 * The browser never talks to Neon Auth directly: /api/auth proxies to it, which
 * is why the session cookie needs a signing secret of our own.
 */
export const auth = createNeonAuth({
  baseUrl: process.env.NEON_AUTH_BASE_URL!,
  cookies: { secret: process.env.NEON_AUTH_COOKIE_SECRET! },
})
