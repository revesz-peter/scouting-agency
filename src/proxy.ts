import { auth } from "@/lib/auth/server";

/**
 * Next.js 16 renamed Middleware to Proxy; this file replaces middleware.ts.
 *
 * This is an optimistic check only — it redirects signed-out visitors away from
 * the app routes so they never see a flash of a dashboard. Real authorization
 * (which agency, and whether the member is an admin) is done in the layouts,
 * against the database.
 */
export default auth.middleware({ loginUrl: "/agency/sign-in" });

export const config = {
  // /agency/sign-in and /agency/register are how an agency gets in, so they
  // stay public — everything else under /agency needs a session.
  matcher: [
    "/agency/((?!sign-in|register).*)",
    "/scout/:path*",
    "/onboarding/:path*",
  ],
};
