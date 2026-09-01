import { NextResponse } from "next/server";
import { getMemberships, getUser } from "@/lib/auth/membership";
import { sql } from "@/lib/db";

/** Passing on a scout application. Accepting one goes through /api/agency/invite. */
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { id, organizationId } = await request.json();

    const membership = (await getMemberships(user.id)).find(
      (m) =>
        m.organizationId === organizationId &&
        (m.role === "owner" || m.role === "admin")
    );
    if (!membership) {
      return NextResponse.json({ error: "Not your agency" }, { status: 403 });
    }

    await sql`
      UPDATE public.scout_application
      SET status = 'rejected'
      WHERE id = ${id} AND organization_id = ${organizationId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Scout application update error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
