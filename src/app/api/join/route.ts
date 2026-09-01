import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { joinSchema } from "@/lib/schemas/join";

/**
 * A prospective scout applying through an agency's open link. Anonymous — this
 * creates a request the agency reviews, never a membership.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = joinSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Some answers need another look" },
        { status: 400 }
      );
    }

    const slug = typeof body.slug === "string" ? body.slug.trim() : "";
    const rows = await sql`
      SELECT id FROM neon_auth.organization WHERE slug = ${slug}
    `;
    const agency = rows[0] as { id: string } | undefined;

    if (!agency) {
      return NextResponse.json({ error: "Unknown agency" }, { status: 404 });
    }

    const { name, email, city, country, instagram, message } = parsed.data;

    // Applying twice is a re-application, not an error — refresh the pending
    // row rather than telling someone they already asked.
    await sql`
      INSERT INTO public.scout_application
        (organization_id, email, name, city, country, instagram, message)
      VALUES
        (${agency.id}, ${email}, ${name}, ${city || null},
         ${country || null}, ${instagram || null}, ${message || null})
      ON CONFLICT (organization_id, email) DO UPDATE SET
        name = EXCLUDED.name,
        city = EXCLUDED.city,
        country = EXCLUDED.country,
        instagram = EXCLUDED.instagram,
        message = EXCLUDED.message
      WHERE public.scout_application.status = 'pending'
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Scout application error:", error);
    return NextResponse.json(
      { error: "Failed to send your application" },
      { status: 500 }
    );
  }
}
