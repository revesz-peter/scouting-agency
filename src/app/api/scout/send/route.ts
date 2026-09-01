import { NextResponse } from "next/server";

import { getScoutProfile, getUser } from "@/lib/auth/membership";
import { sql } from "@/lib/db";

/**
 * Sends held applications on to the agency they were addressed to.
 *
 * Scoped to the caller's own scout id, so passing someone else's application
 * ids does nothing — a scout can only send what came through their link.
 */
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const scout = await getScoutProfile(user.id);
    if (!scout) {
      return NextResponse.json({ error: "No scout link yet" }, { status: 403 });
    }

    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Nothing selected" }, { status: 400 });
    }

    // `sent_at IS NULL` keeps this from re-stamping something already sent.
    const sent = await sql`
      UPDATE public.application
      SET sent_at = now()
      WHERE id = ANY(${ids})
        AND scout_id = ${scout.id}
        AND sent_at IS NULL
      RETURNING id
    `;

    if (sent.length > 0) {
      await sql`
        INSERT INTO public.application_event
          (application_id, kind, actor_id)
        SELECT unnest(${sent.map((r) => (r as { id: string }).id)}::uuid[]),
               'sent_on', ${user.id}
      `;
    }

    return NextResponse.json({ success: true, sent: sent.length });
  } catch (error) {
    console.error("Scout send error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
