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
    const NOTIFY_EMAIL = process.env.NOTIFY_EMAIL || "hello@scouting.agency";

    if (RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(RESEND_API_KEY);

      await resend.emails.send({
        from: "Scouting.Agency <noreply@scouting.agency>",
        to: NOTIFY_EMAIL,
        subject: `New Application: ${name}`,
        html: `
          <h2>New Scouting Application</h2>
          <table style="border-collapse:collapse;">
            <tr><td style="padding:4px 12px 4px 0;color:#666;">Name</td><td>${name}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td>${email}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;">Phone</td><td>${phone || "—"}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;">Age</td><td>${age}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;">Height</td><td>${height} cm</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;">Location</td><td>${location}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;">Instagram</td><td>${instagram || "—"}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#666;">Photos</td><td>${photos.length} attached</td></tr>
          </table>
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
