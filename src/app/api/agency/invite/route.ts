import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { getMemberships, getUser } from "@/lib/auth/membership";
import { sql } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { siteUrl } from "@/lib/site";

// The invitation link comes from configuration, never from the request's own
// Origin header — a link that lands in someone's inbox should not be steerable
// by whoever triggered the send.

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Invites a scout to an agency as `member`.
 *
 * Neon Auth is configured not to send invitation email itself, so we deliver it
 * through Resend — which also means the email reads like the rest of the site.
 *
 * Accepting an open-link application comes through here too, so there is one
 * way to gain a membership: accept an invitation.
 */
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { email, organizationId, applicationId } = await request.json();

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
    }

    // Only an agency's own staff may invite into it.
    const membership = (await getMemberships(user.id)).find(
      (m) =>
        m.organizationId === organizationId &&
        (m.role === "owner" || m.role === "admin")
    );
    if (!membership) {
      return NextResponse.json({ error: "Not your agency" }, { status: 403 });
    }

    const { data, error } = await auth.organization.inviteMember({
      email,
      role: "member",
      organizationId,
      resend: true,
    });

    if (error || !data) {
      return NextResponse.json(
        { error: error?.message ?? "Couldn't create the invitation" },
        { status: 400 }
      );
    }

    if (applicationId) {
      await sql`
        UPDATE public.scout_application
        SET status = 'invited', invitation_id = ${data.id}
        WHERE id = ${applicationId} AND organization_id = ${organizationId}
      `;
    }

    // Neon Auth is configured not to send invitation email itself, so if this
    // does not go out nobody ever sees the link.
    const link = siteUrl(`/invite/${data.id}`);

    const sent = await sendEmail({
      to: email,
      subject: `${membership.name} invited you to scout`,
      html: `
          <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:520px;margin:0 auto;color:#000;">
            <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#999;">scouting</p>
            <h1 style="margin:12px 0 0;font-size:20px;font-weight:700;">${escapeHtml(membership.name)}</h1>
            <p style="margin:16px 0 0;font-size:13px;line-height:1.6;">
              You have been invited to scout for ${escapeHtml(membership.name)}.
              Accept it and you get your own link — everyone who applies through
              it stays credited to you.
            </p>
            <p style="margin:28px 0 0;">
              <a href="${link}" style="display:inline-block;background:#000;color:#fff;padding:12px 24px;font-size:11px;text-transform:uppercase;letter-spacing:0.15em;text-decoration:none;">Accept invitation</a>
            </p>
            <p style="margin:24px 0 0;font-size:11px;color:#999;">
              Or paste this into your browser: ${link}
            </p>
          </div>
        `,
    });

    // The invitation exists either way — say so rather than silently implying
    // the scout has been emailed.
    return NextResponse.json({ success: true, invitationId: data.id, sent });
  } catch (error) {
    console.error("Invite error:", error);
    return NextResponse.json(
      { error: "Failed to send the invitation" },
      { status: 500 }
    );
  }
}
