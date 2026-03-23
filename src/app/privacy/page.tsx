import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How scouting agency collects, uses, and protects your personal data.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <Link
        href="/"
        className="mb-8 inline-block text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
      >
        &larr; Back
      </Link>
      <h1 className="mb-8 text-xs font-bold uppercase tracking-[0.25em]">Privacy Policy</h1>
      <div className="space-y-6 text-xs leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">What we collect</h2>
          <p>When you submit an application, we collect:</p>
          <ul className="mt-2 list-inside list-disc space-y-1">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number (optional)</li>
            <li>Age</li>
            <li>Height</li>
            <li>Location (city, country)</li>
            <li>Instagram handle (optional)</li>
            <li>Photos (face, profile, full body)</li>
          </ul>
          <p className="mt-2">
            We do not use cookies, tracking scripts, or analytics on this site.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">How we use it</h2>
          <p>
            Your data is used exclusively to evaluate your scouting application and
            to connect you with modeling agencies. We will never sell, rent, or
            share your information for advertising, marketing, or any purpose
            unrelated to talent scouting.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">Data sharing</h2>
          <p>
            We share your application data and photos only with vetted partner
            modeling agencies for the purpose of scouting evaluation. We do not
            share data with any other third parties.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">Data retention</h2>
          <p>
            Application data is retained for up to 12 months after submission to
            allow ongoing scouting consideration. You may request early deletion at
            any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">Minors&apos; data</h2>
          <p>
            We accept applications from individuals aged 14 and above. For
            applicants under 18, we require parental or guardian consent before
            processing the application. We may collect additional information — such
            as a parent or guardian&apos;s name, email, and phone number — for the
            purpose of verifying consent.
          </p>
          <p className="mt-2">
            Minors&apos; data is handled with additional care and is only shared
            with partner agencies after parental consent has been confirmed. See
            our{" "}
            <Link href="/terms" className="underline transition-colors hover:text-foreground">
              Terms of Service
            </Link>{" "}
            for full consent requirements.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">Your rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data at
            any time. To exercise these rights, contact us at the email below. We
            will respond within 30 days.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">Contact</h2>
          <p>
            For privacy-related questions or data requests, reach us at{" "}
            <a
              href="mailto:hello@scouting.agency"
              className="underline transition-colors hover:text-foreground"
            >
              hello@scouting.agency
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
