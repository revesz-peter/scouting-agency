import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "Terms governing the use of scouting agency's talent scouting platform.",
    alternates: { canonical: "/terms" },
}

export default function TermsPage() {
    return (
        <main className="mx-auto max-w-2xl px-6 py-24">
            <Link
                href="/"
                className="mb-8 inline-block text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
            >
                &larr; Back
            </Link>
            <h1 className="mb-8 text-xs font-bold uppercase tracking-[0.25em]">
                Terms of Service
            </h1>
            <div className="space-y-6 text-xs leading-relaxed text-muted-foreground">
                <section>
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        Service
                    </h2>
                    <p>
                        scouting agency is a talent scouting platform that
                        connects aspiring models with professional modeling
                        agencies. Submitting an application does not guarantee
                        representation or placement with any agency.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        Eligibility
                    </h2>
                    <p>
                        Applicants must be between 14 and 35 years of age. By
                        submitting an application, you confirm that all
                        information provided is accurate and that you have the
                        right to share the photos and personal data included.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        Parental / guardian consent
                    </h2>
                    <p>
                        Applicants under the age of 18 must have the explicit
                        consent of a parent or legal guardian before submit ting
                        an application. By checking the consent box on the
                        application form, the applicant confirms that a parent
                        or guardian has reviewed and approved the submission.
                    </p>
                    <p className="mt-2">
                        We reserve the right to request the name, email address,
                        and phone number of a parent or guardian for
                        verification purposes before processing any minor&apos;s
                        application. Applications from minors may not be
                        forwarded to partner agencies until parental consent has
                        been verified.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        Application data
                    </h2>
                    <p>
                        Submitted information — including name, contact details,
                        physical measurements, location, Instagram handle, and
                        photographs — is used exclusively for scouting
                        evaluation and agency placement. See our{" "}
                        <Link
                            href="/privacy"
                            className="underline transition-colors hover:text-foreground"
                        >
                            Privacy Policy
                        </Link>{" "}
                        for full details on data handling.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        Photos &amp; intellectual property
                    </h2>
                    <p>
                        You retain ownership of all photos you upload. By
                        submitting, you grant scouting agency a limited,
                        non-exclusive license to share your photos with partner
                        agencies solely for scouting and evaluation purposes. We
                        will not use your photos for advertising, marketing, or
                        any purpose unrelated to your application without
                        separate written consent.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        Limitation of liability
                    </h2>
                    <p>
                        scouting agency acts as an intermediary between
                        applicants and modeling agencies. We do not guarantee
                        any outcome, placement, or contract. We are not liable
                        for decisions made by partner agencies or for any
                        agreements entered into between applicants and third
                        parties.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        Changes to these terms
                    </h2>
                    <p>
                        We may update these terms from time to time. Continued
                        use of the platform after changes constitutes acceptance
                        of the revised terms.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        Contact
                    </h2>
                    <p>
                        For questions about these terms, reach us at{" "}
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
    )
}
