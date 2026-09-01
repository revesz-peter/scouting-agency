import { NextResponse } from "next/server";

import { getAdmin } from "@/lib/auth/admin";
import { sql } from "@/lib/db";

const STATUSES = ["pending", "active", "suspended"];

/**
 * Puts an agency's public links live, or takes them down.
 *
 * Re-checks the operator here rather than trusting the page that rendered the
 * button: a layout is not a security boundary, and this is the call that lets
 * an agency start collecting applications.
 */
export async function POST(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      // Same answer a stranger gets from the panel itself.
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { organizationId, status } = await request.json();

    if (typeof status !== "string" || !STATUSES.includes(status)) {
      return NextResponse.json({ error: "Unknown status" }, { status: 400 });
    }

    const updated = await sql`
      UPDATE public.agency_profile
      SET status = ${status},
          confirmed_at = ${status === "active" ? new Date().toISOString() : null},
          confirmed_by = ${status === "active" ? admin.id : null}
      WHERE organization_id = ${organizationId}
      RETURNING organization_id
    `;

    if (updated.length === 0) {
      return NextResponse.json({ error: "No such agency" }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Admin confirm error:", error);
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
