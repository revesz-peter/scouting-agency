import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How scouting collects, uses, and protects personal data submitted through the platform.",
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
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">Who we are</h2>
          <p>
            scouting is software that model agencies use to run their talent
            pipeline. When you submit an application, the agency running that
            pipeline decides on it; we process your data on that agency&apos;s
            behalf and to operate the platform.
          </p>
        </section>

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
            Your data is used exclusively so that the agency you applied to can
            review and decide on your application, and so we can operate the
            platform that carries it. We will never sell, rent, or share your
            information for advertising, marketing, or any purpose unrelated to
            that application.
          </p>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">Data sharing</h2>
          <p>
            Your application data and photos are visible to the agency whose
            pipeline you applied to, and to the service providers we use to
            deliver and store it. We do not share your data with any other third
            parties.
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
            Minors&apos; data is handled with additional care and is only made
            available to the agency after parental consent has been confirmed. See
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
              href="mailto:privacy@scouting.agency"
              className="underline transition-colors hover:text-foreground"
            >
              privacy@scouting.agency
            </a>
            . If your request concerns a specific application, you may also
            contact the agency you applied to directly.
          </p>
        </section>
      </div>
    </main>
  );
}
