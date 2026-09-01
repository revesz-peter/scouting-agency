import { NextResponse } from "next/server";
import { getMemberships, getUser } from "@/lib/auth/membership";
import { sql } from "@/lib/db";

/**
 * Runs right after the founder creates their organization: copies the details
 * from their registration onto the agency.
 *
 * Membership is read from neon_auth, so this can only ever fill in an agency
 * the caller actually owns.
 */
export async function POST() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const owned = (await getMemberships(user.id)).filter(
      (m) => m.role === "owner"
    );
    if (owned.length === 0) {
      return NextResponse.json({ error: "No agency to set up" }, { status: 403 });
    }

    const rows = await sql`
      SELECT slug, website, city, country, board_size, notes
      FROM public.agency_signup
      WHERE lower(email) = lower(${user.email})
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const request = rows[0] as
      | {
          slug: string;
          website: string | null;
          city: string;
          country: string;
          board_size: number | null;
          notes: string | null;
        }
      | undefined;

    if (!request) {
      return NextResponse.json({ error: "No registration found" }, { status: 403 });
    }

    const agency = owned.find((m) => m.slug === request.slug);
    if (!agency) {
      return NextResponse.json(
        { error: "That agency isn't yours" },
        { status: 403 }
      );
    }

    await sql`
      INSERT INTO public.agency_profile
        (organization_id, website, city, country, board_size, notes)
      VALUES
        (${agency.organizationId}, ${request.website}, ${request.city},
         ${request.country}, ${request.board_size}, ${request.notes})
      ON CONFLICT (organization_id) DO NOTHING
    `;

    // No need to mark the request consumed: once the founder has a membership,
    // /auth/continue stops routing them here.
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Agency provision error:", error);
    return NextResponse.json({ error: "Failed to set up" }, { status: 500 });
  }
}
