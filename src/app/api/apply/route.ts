import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const age = formData.get("age") as string;
    const height = formData.get("height") as string;
    const location = formData.get("location") as string;
    const instagram = formData.get("instagram") as string;

    // Collect photos
    const photoKeys = ["photo_0", "photo_1", "photo_2"];
    const photos: { name: string; content: Buffer }[] = [];

    for (const key of photoKeys) {
      const file = formData.get(key) as File | null;
      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        photos.push({
          name: file.name,
          content: Buffer.from(bytes),
        });
      }
    }

    // Send email via Resend
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "budapestlabs@gmail.com";

    if (RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(RESEND_API_KEY);

      await resend.emails.send({
        from: "scouting agency <hello@budapestlabs.com>",
        to: NOTIFY_EMAIL,
        subject: `New Application: ${name}`,
        html: `
          <div style="font-family:-apple-system,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#000;">
            <div style="padding:32px 0;border-bottom:1px solid #e5e5e5;">
              <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#999;">scouting agency</p>
              <h1 style="margin:12px 0 0;font-size:20px;font-weight:700;">${name}</h1>
              <p style="margin:4px 0 0;font-size:13px;color:#737373;">${age} y/o · ${height} cm · ${location}</p>
            </div>

            <div style="padding:24px 0;border-bottom:1px solid #e5e5e5;">
              <table style="border-collapse:collapse;width:100%;font-size:13px;">
                <tr>
                  <td style="padding:6px 0;color:#999;width:100px;">Email</td>
                  <td style="padding:6px 0;"><a href="mailto:${email}" style="color:#000;text-decoration:none;">${email}</a></td>
                </tr>
                ${phone ? `<tr>
                  <td style="padding:6px 0;color:#999;">Phone</td>
                  <td style="padding:6px 0;"><a href="tel:${phone}" style="color:#000;text-decoration:none;">${phone}</a></td>
                </tr>` : ""}
                ${instagram ? `<tr>
                  <td style="padding:6px 0;color:#999;">Instagram</td>
                  <td style="padding:6px 0;"><a href="https://instagram.com/${instagram.replace("@", "")}" style="color:#000;text-decoration:none;">@${instagram.replace("@", "")}</a></td>
                </tr>` : ""}
              </table>
            </div>

            ${photos.length > 0 ? `
            <div style="padding:24px 0;">
              <p style="margin:0;font-size:10px;text-transform:uppercase;letter-spacing:0.2em;color:#999;">${photos.length} photo${photos.length > 1 ? "s" : ""} attached — see below</p>
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
      console.log({ name, email, phone, age, height, location, instagram });
      console.log(`Photos: ${photos.length}`);
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
