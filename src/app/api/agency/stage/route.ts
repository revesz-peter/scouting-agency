import { NextResponse } from "next/server";

import { getMemberships, getUser } from "@/lib/auth/membership";
import { sql } from "@/lib/db";

/** The six stages, as the application table constrains them. */
const STAGES = [
  "applied",
  "pre_select",
  "scheduled",
  "final_voting",
  "onboarding",
  "on_board",
];

/**
 * Moves applications from one stage to the next.
 *
 * Scoped to the agency in the WHERE clause as well as the membership check, so
 * a caller cannot move another agency's applications by passing their ids.
 */
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { organizationId, ids, stage } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "Nothing selected" }, { status: 400 });
    }
    if (typeof stage !== "string" || !STAGES.includes(stage)) {
      return NextResponse.json({ error: "Unknown stage" }, { status: 400 });
    }

    const membership = (await getMemberships(user.id)).find(
      (m) =>
        m.organizationId === organizationId &&
        (m.role === "owner" || m.role === "admin")
    );
    if (!membership) {
      return NextResponse.json({ error: "Not your agency" }, { status: 403 });
    }

    // An application a scout is still holding is not the agency's to move.
    const moved = await sql`
      UPDATE public.application
      SET stage = ${stage}
      WHERE id = ANY(${ids})
        AND organization_id = ${organizationId}
        AND sent_at IS NOT NULL
      RETURNING id
    `;

    if (moved.length > 0) {
      await sql`
        INSERT INTO public.application_event
          (application_id, kind, stage, actor_id)
        SELECT unnest(${moved.map((r) => (r as { id: string }).id)}::uuid[]),
               'stage', ${stage}, ${user.id}
      `;
    }

    return NextResponse.json({ success: true, moved: moved.length });
  } catch (error) {
    console.error("Stage move error:", error);
    return NextResponse.json({ error: "Failed to move" }, { status: 500 });
  }
}
