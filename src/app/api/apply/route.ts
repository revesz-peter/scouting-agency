import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  ageFrom,
  applicationSchema,
  photoSchema,
  type ApplicationData,
} from "@/lib/schemas/application";

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

interface AgencyRow {
  id: string;
  slug: string;
  name: string;
}

interface ScoutRow {
  id: string;
  code: string;
  name: string;
}

/**
 * One row per agency the application was addressed to, sharing a submission_id.
 * Each agency reviews its own copy independently, so a decision by one says
 * nothing about the others.
 */
async function persist(
  values: ApplicationData,
  agencies: AgencyRow[],
  referrer: ScoutRow | null
) {
  const submissionId = crypto.randomUUID();

  // Straight to the agency when nobody referred it. Through a scout's link it
  // waits for the scout: they send on what is worth the agency's time, and that
  // choice is what their kept rate measures.
  const sentAt = referrer ? null : new Date().toISOString();

  const inserted = await Promise.all(
    agencies.map(
      (agency) => sql`
        INSERT INTO public.application (
          submission_id, organization_id, scout_id,
          first_name, last_name, email, phone, dob, gender, city, country, instagram,
          height_cm, bust_cm, waist_cm, hips_cm, shoe_eu, hair_color, eye_color,
          video_link, portfolio_link, notes, sent_at
        ) VALUES (
          ${submissionId}, ${agency.id}, ${referrer?.id ?? null},
          ${values.firstName}, ${values.lastName}, ${values.email}, ${values.phone},
          ${values.dob}, ${values.gender}, ${values.city}, ${values.country},
          ${values.instagram || null},
          ${Number(values.height)}, ${Number(values.bust)}, ${Number(values.waist)},
          ${Number(values.hips)}, ${Number(values.shoeSize)},
          ${values.hairColor}, ${values.eyeColor},
          ${values.videoLink || null}, ${values.portfolioLink || null},
          ${values.notes || null}, ${sentAt}
        )
        RETURNING id
      `
    )
  );

  // The arrival is the first line of the history the profile shows.
  const ids = inserted.flat().map((r) => (r as { id: string }).id);
  await sql`
    INSERT INTO public.application_event (application_id, kind, stage)
    SELECT unnest(${ids}::uuid[]), 'applied', 'applied'
  `;
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

    const raw = {} as Record<FieldName, string>;
    for (const field of FIELDS) {
      raw[field] = ((formData.get(field) as string | null) ?? "").trim();
    }

    // The form validates in the browser, but a direct POST does not go through
    // it — and this now writes to the database. Re-check everything here,
    // including the age floor the terms page commits to.
    const parsed = applicationSchema.safeParse({ ...raw, consent: true });
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Some answers need another look", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const values: ApplicationData = parsed.data;

    // Collect digitals. All four are required, and each has to be an image
    // within the size limit — the browser checked, but re-check regardless.
    const photos: { name: string; label: string; content: Buffer }[] = [];
    for (const { key, label } of PHOTO_KEYS) {
      const file = formData.get(key) as File | null;
      const photo = photoSchema.safeParse(file);
      if (!photo.success) {
        return NextResponse.json(
          { error: `${label}: ${photo.error.issues[0]?.message ?? "invalid"}` },
          { status: 400 }
        );
      }
      const bytes = await file!.arrayBuffer();
      photos.push({ name: file!.name, label, content: Buffer.from(bytes) });
    }

    // Which agencies this application was addressed to. Resolved against the
    // database — an agency only receives applications once it actually exists.
    const slugs = ((formData.get("agencies") as string | null) ?? "")
      .split(",")
      .map((slug) => slug.trim())
      .filter(Boolean);

    const agencies = slugs.length
      ? ((await sql`
          SELECT o.id, o.slug, o.name
          FROM neon_auth.organization o
          JOIN public.agency_profile p ON p.organization_id = o.id
          WHERE o.slug = ANY(${slugs}) AND p.status = 'active' 
        `) as AgencyRow[])
      : [];

    // Scout whose personal link the applicant came through. Credit follows the
    // application from here through pre-select, the vote, and signing.
    const referrerCode = ((formData.get("ref") as string | null) ?? "")
      .trim()
      .toLowerCase();
    const referrer = referrerCode
      ? (((
          await sql`
            SELECT id, code, display_name AS name
            FROM public.scout_profile
            WHERE code = ${referrerCode}
          `
        )[0] as ScoutRow | undefined) ?? null)
      : null;

    // An application addressed to nobody is worse than a rejected one: the
    // applicant is told it went through and it is stored nowhere.
    if (agencies.length === 0) {
      return NextResponse.json(
        { error: "That agency isn't taking applications yet." },
        { status: 404 }
      );
    }

    await persist(values, agencies, referrer);

    const fullName = `${values.firstName} ${values.lastName}`.trim();
    const age = ageFrom(values.dob);
    const recipients = agencies.map((a) => a.name).join(", ");
    const credited = referrer ? `${referrer.name} (${referrer.code})` : "";

    // The digitals only exist in this email — the database holds the structured
    // fields, not the photos — so it matters that it goes out.
    const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL;

    if (NOTIFY_EMAIL) {
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

      const handle = (values.instagram ?? "").replace(/^@/, "");

      await sendEmail({
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
                ${linkRow("Video", values.videoLink ?? "")}
                ${linkRow("Portfolio", values.portfolioLink ?? "")}
                ${row("Notes", values.notes ?? "")}
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
