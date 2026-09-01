import { NextResponse } from "next/server";
import { getMemberships, getUser } from "@/lib/auth/membership";
import { sql } from "@/lib/db";
import { scoutProfileSchema } from "@/lib/schemas/scout";

/**
 * Creates the scout's profile once they belong to an agency. A scout must be a
 * member of at least one, so this refuses anyone who has not accepted an
 * invitation yet.
 */
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const memberships = await getMemberships(user.id);
    if (memberships.length === 0) {
      return NextResponse.json(
        { error: "Accept an agency invitation first" },
        { status: 403 }
      );
    }

    const parsed = scoutProfileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Check your details" },
        { status: 400 }
      );
    }

    const { displayName, code, city, country } = parsed.data;

    const taken = await sql`
      SELECT 1 FROM public.scout_profile
      WHERE code = ${code} AND user_id <> ${user.id}
    `;
    if (taken.length > 0) {
      return NextResponse.json(
        { error: "That code is taken. Pick another." },
        { status: 409 }
      );
    }

    await sql`
      INSERT INTO public.scout_profile (user_id, code, display_name, city, country)
      VALUES (${user.id}, ${code}, ${displayName}, ${city || null}, ${country || null})
      ON CONFLICT (user_id) DO UPDATE SET
        code = EXCLUDED.code,
        display_name = EXCLUDED.display_name,
        city = EXCLUDED.city,
        country = EXCLUDED.country
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Scout profile error:", error);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
