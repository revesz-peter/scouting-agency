import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { getMemberships, getUser } from "@/lib/auth/membership";
import { sql } from "@/lib/db";
import { RESERVED_SLUGS } from "@/lib/schemas/agency-signup";

/**
 * Changes an agency's link.
 *
 * Only the owner: this breaks every apply link, join link, and printed QR the
 * agency has handed out, which is not a booker's call to make.
 */
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { organizationId, slug } = await request.json();

    const membership = (await getMemberships(user.id)).find(
      (m) => m.organizationId === organizationId && m.role === "owner"
    );
    if (!membership) {
      return NextResponse.json(
        { error: "Only the owner can change the link" },
        { status: 403 }
      );
    }

    const next = typeof slug === "string" ? slug.trim().toLowerCase() : "";

    if (!/^[a-z0-9-]{2,32}$/.test(next)) {
      return NextResponse.json(
        { error: "Lowercase letters, numbers and dashes, 2–32 characters" },
        { status: 400 }
      );
    }
    if (next.startsWith("-") || next.endsWith("-")) {
      return NextResponse.json(
        { error: "No leading or trailing dash" },
        { status: 400 }
      );
    }
    if (RESERVED_SLUGS.includes(next)) {
      return NextResponse.json({ error: "That one is reserved" }, { status: 400 });
    }
    if (next === membership.slug) {
      return NextResponse.json({ success: true, slug: next });
    }

    // Held by another agency, or by a registration that has not created its
    // agency yet.
    const [taken, held] = await Promise.all([
      sql`SELECT 1 FROM neon_auth.organization WHERE slug = ${next}`,
      sql`SELECT 1 FROM public.agency_signup
          WHERE slug = ${next} AND lower(email) <> lower(${user.email})`,
    ]);
    if (taken.length > 0 || held.length > 0) {
      return NextResponse.json(
        { error: "That link is taken. Pick another." },
        { status: 409 }
      );
    }

    const { error } = await auth.organization.update({
      organizationId,
      data: { slug: next },
    });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Couldn't change the link" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, slug: next });
  } catch (error) {
    console.error("Slug change error:", error);
    return NextResponse.json({ error: "Failed to change" }, { status: 500 });
  }
}
