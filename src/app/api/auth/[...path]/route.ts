import { auth } from "@/lib/auth/server";

/**
 * Proxies auth requests to the hosted Neon Auth instance and turns its response
 * into an http-only session cookie on our own origin.
 */
export const { GET, POST } = auth.handler();
