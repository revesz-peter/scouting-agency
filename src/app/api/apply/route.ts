import { NextResponse } from "next/server";
import { getAgency } from "@/lib/agencies";
import { getScout } from "@/lib/scouts";

const PHOTO_KEYS = [
  { key: "photo_headshot", label: "Headshot" },
  { key: "photo_profile_left", label: "Profile left" },
  { key: "photo_profile_right", label: "Profile right" },
  { key: "photo_full_body", label: "Full body" },
];

const FIELDS = [
  "firstName",
  "lastName",
  "email",
  "phone",
  "dob",
  "gender",
  "city",
  "country",
  "instagram",
  "height",
  "bust",
  "waist",
  "hips",
  "shoeSize",
  "hairColor",
  "eyeColor",
  "videoLink",
  "portfolioLink",
  "notes",
] as const;

type FieldName = (typeof FIELDS)[number];

function ageFrom(dob: string): number | null {
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

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

    // Which agencies this application was addressed to
    const agencies = ((formData.get("agencies") as string | null) ?? "")
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean)
      .map((slug) => getAgency(slug))
      .filter((agency) => agency !== undefined);

    // Scout whose personal link the applicant came through
    const referrerCode = ((formData.get("ref") as string | null) ?? "").trim();
    const referrer = referrerCode ? getScout(referrerCode) : undefined;

    // Collect digitals
    const photos: { name: string; label: string; content: Buffer }[] = [];
    for (const { key, label } of PHOTO_KEYS) {
      const file = formData.get(key) as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        photos.push({ name: file.name, label, content: Buffer.from(bytes) });
      }
    }

    const fullName = `${values.firstName} ${values.lastName}`.trim();
    const age = values.dob ? ageFrom(values.dob) : null;
    const recipients = agencies.map((a) => a.name).join(", ") || "—";
    const credited = referrer ? `${referrer.name} (${referrer.code})` : "";

    // Send email via Resend
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

      const linkRow = (label: string, value: string) =>
        value
          ? `<tr>
              <td style="padding:6px 0;color:#999;width:130px;vertical-align:top;">${escapeHtml(label)}</td>
              <td style="padding:6px 0;"><a href="${escapeHtml(value)}" style="color:#000;">${escapeHtml(value)}</a></td>
            </tr>`
          : "";

      const handle = values.instagram.replace(/^@/, "");

      await resend.emails.send({
        from: "scouting <hello@budapestlabs.com>",
        to: NOTIFY_EMAIL,
        subject: `New application: ${fullName}${age !== null && age < 18 ? " (minor)" : ""} → ${recipients}${credited ? ` (via ${referrer!.name})` : ""}`,
        html: `
          <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;color:#000;">
            <div style="padding:32px 0;border-bottom:1px solid #e5e5e5;">
              <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#999;">scouting</p>
              <h1 style="margin:12px 0 0;font-size:20px;font-weight:700;">${escapeHtml(fullName)}</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#737373;">
                ${age !== null ? `${age} y/o · ` : ""}${escapeHtml(values.height)} cm · ${escapeHtml(values.city)}, ${escapeHtml(values.country)}
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#999;">Applying to: ${escapeHtml(recipients)}</p>
              ${credited ? `<p style="margin:4px 0 0;font-size:12px;color:#999;">Scouted by: ${escapeHtml(credited)}</p>` : ""}
            </div>

            <div style="padding:24px 0;border-bottom:1px solid #e5e5e5;">
              <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#999;">Personal</p>
              <table style="border-collapse:collapse;width:100%;font-size:13px;">
                ${row("Email", values.email)}
                ${row("Phone", values.phone)}
                ${row("Date of birth", values.dob)}
                ${row("Gender", values.gender)}
                ${row("City", values.city)}
                ${row("Country", values.country)}
                ${handle ? `<tr>
                  <td style="padding:6px 0;color:#999;width:130px;">Instagram</td>
                  <td style="padding:6px 0;"><a href="https://instagram.com/${escapeHtml(handle)}" style="color:#000;">@${escapeHtml(handle)}</a></td>
                </tr>` : ""}
              </table>
            </div>

            <div style="padding:24px 0;border-bottom:1px solid #e5e5e5;">
              <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#999;">Measurements</p>
              <table style="border-collapse:collapse;width:100%;font-size:13px;">
                ${row("Height", values.height && `${values.height} cm`)}
                ${row("Bust", values.bust && `${values.bust} cm`)}
                ${row("Waist", values.waist && `${values.waist} cm`)}
                ${row("Hips", values.hips && `${values.hips} cm`)}
                ${row("Shoe size", values.shoeSize && `${values.shoeSize} EU`)}
                ${row("Hair color", values.hairColor)}
                ${row("Eye color", values.eyeColor)}
              </table>
            </div>

            ${values.videoLink || values.portfolioLink || values.notes ? `
            <div style="padding:24px 0;border-bottom:1px solid #e5e5e5;">
              <p style="margin:0 0 8px;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#999;">Links &amp; notes</p>
              <table style="border-collapse:collapse;width:100%;font-size:13px;">
                ${linkRow("Video", values.videoLink)}
                ${linkRow("Portfolio", values.portfolioLink)}
                ${row("Notes", values.notes)}
              </table>
            </div>
            ` : ""}

            ${photos.length > 0 ? `
            <div style="padding:24px 0;">
              <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#999;">
                ${photos.length} digital${photos.length > 1 ? "s" : ""} attached — ${photos.map((p) => escapeHtml(p.label)).join(", ")}
              </p>
            </div>
            ` : ""}
          </div>
        `,
        attachments: photos.map((p) => ({
          filename: p.name,
          content: p.content,
        })),
      });
    } else {
      console.log("=== New Application ===");
      console.log({ ...values, agencies: recipients, age, scoutedBy: credited || "—" });
      console.log(`Photos: ${photos.map((p) => p.label).join(", ")}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Failed to process application" },
      { status: 500 }
    );
  }
}
