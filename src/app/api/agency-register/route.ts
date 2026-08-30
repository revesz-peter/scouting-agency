import { NextResponse } from "next/server";

const FIELDS = [
  "agencyName",
  "website",
  "slug",
  "contactName",
  "role",
  "email",
  "phone",
  "city",
  "country",
  "boardSize",
  "notes",
] as const;

type FieldName = (typeof FIELDS)[number];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const values = {} as Record<FieldName, string>;
    for (const field of FIELDS) {
      values[field] = ((formData.get(field) as string | null) ?? "").trim();
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "reveszpeter26@gmail.com";

    if (RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(RESEND_API_KEY);

      const row = (label: string, value: string) =>
        value
          ? `<tr>
              <td style="padding:6px 0;color:#999;width:130px;vertical-align:top;">${escapeHtml(label)}</td>
              <td style="padding:6px 0;">${escapeHtml(value)}</td>
            </tr>`
          : "";

      await resend.emails.send({
        from: "scouting <hello@budapestlabs.com>",
        to: NOTIFY_EMAIL,
        subject: `Agency request: ${values.agencyName}`,
        html: `
          <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;color:#000;">
            <div style="padding:32px 0;border-bottom:1px solid #e5e5e5;">
              <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#999;">scouting</p>
              <h1 style="margin:12px 0 0;font-size:20px;font-weight:700;">${escapeHtml(values.agencyName)}</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#737373;">${escapeHtml(values.city)}, ${escapeHtml(values.country)}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#999;">Wants: scouting.agency/board/${escapeHtml(values.slug)}</p>
            </div>

            <div style="padding:24px 0;">
              <table style="border-collapse:collapse;width:100%;font-size:13px;">
                ${row("Contact", [values.contactName, values.role].filter(Boolean).join(" · "))}
                ${values.email ? `<tr>
                  <td style="padding:6px 0;color:#999;width:130px;">Email</td>
                  <td style="padding:6px 0;"><a href="mailto:${escapeHtml(values.email)}" style="color:#000;">${escapeHtml(values.email)}</a></td>
                </tr>` : ""}
                ${row("Phone", values.phone)}
                ${values.website ? `<tr>
                  <td style="padding:6px 0;color:#999;width:130px;">Website</td>
                  <td style="padding:6px 0;"><a href="${escapeHtml(values.website)}" style="color:#000;">${escapeHtml(values.website)}</a></td>
                </tr>` : ""}
                ${row("Board size", values.boardSize)}
                ${row("Notes", values.notes)}
              </table>
            </div>
          </div>
        `,
      });
    } else {
      console.log("=== Agency Registration ===");
      console.log(values);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Agency registration error:", error);
    return NextResponse.json(
      { error: "Failed to process registration" },
      { status: 500 }
    );
  }
}
