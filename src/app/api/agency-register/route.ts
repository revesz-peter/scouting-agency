import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";
import { agencySignupSchema } from "@/lib/schemas/agency-signup";
import { sendEmail } from "@/lib/email";
import { siteLink } from "@/lib/site";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Registering an agency and creating the founder's account in one request.
 *
 * Order matters: the slug is checked first, then the account is created, then
 * the agency details are stored. A failure at any step leaves nothing behind
 * that would block a retry.
 *
 * Neon Auth sends the verification code itself, so there is nothing to approve
 * — the founder verifies and creates the agency, becoming its owner.
 */
export async function POST(request: Request) {
  try {
    const parsed = agencySignupSchema.safeParse(await request.json());

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return NextResponse.json(
        { error: issue?.message ?? "Check your details", field: issue?.path[0] },
        { status: 400 }
      );
    }

    const values = parsed.data;

    // The slug is claimed here, so check it against agencies that exist and
    // signups already holding it.
    const [taken, held] = await Promise.all([
      sql`SELECT 1 FROM neon_auth.organization WHERE slug = ${values.slug}`,
      sql`SELECT 1 FROM public.agency_signup WHERE slug = ${values.slug}`,
    ]);

    if (taken.length > 0 || held.length > 0) {
      return NextResponse.json(
        { error: "That link is taken. Pick another.", field: "slug" },
        { status: 409 }
      );
    }

    // Note: signing up with an address that already has an account returns a
    // normal-looking success — Better Auth does that deliberately so this form
    // cannot be used to discover which emails are registered. So there is no
    // "already exists" case to branch on here, and the insert below has to
    // tolerate the row already being there.
    const { error } = await auth.signUp.email({
      name: values.contactName,
      email: values.email,
      password: values.password,
    });

    if (error) {
      return NextResponse.json(
        { error: error.message ?? "Couldn't create your account", field: "email" },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO public.agency_signup
        (agency_name, slug, website, contact_name, role, email, phone,
         city, country, board_size, notes)
      VALUES
        (${values.agencyName}, ${values.slug}, ${values.website || null},
         ${values.contactName}, ${values.role || null}, ${values.email},
         ${values.phone || null}, ${values.city}, ${values.country},
         ${values.boardSize ? Number(values.boardSize) : null},
         ${values.notes || null})
      ON CONFLICT DO NOTHING
    `;

    // Courtesy notification — the founder needs nothing from us to continue.
    const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

    if (NOTIFY_EMAIL) {
      await sendEmail({
        to: NOTIFY_EMAIL,
        subject: `New agency: ${values.agencyName}`,
        html: `
          <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#000;">
            <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#999;">scouting</p>
            <h1 style="margin:12px 0 0;font-size:20px;font-weight:700;">${escapeHtml(values.agencyName)}</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#737373;">${escapeHtml(values.city)}, ${escapeHtml(values.country)}</p>
            <p style="margin:16px 0 0;font-size:13px;">
              ${escapeHtml(values.contactName)} &middot; ${escapeHtml(values.email)}<br>
              ${escapeHtml(siteLink(`/apply/${values.slug}`))}
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, email: values.email });
  } catch (error) {
    console.error("Agency registration error:", error);
    return NextResponse.json(
      { error: "Failed to register the agency" },
      { status: 500 }
    );
  }
}
