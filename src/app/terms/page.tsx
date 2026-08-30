import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
    title: "Terms of Service",
    description:
        "Terms governing the use of the scouting platform by agencies and applicants.",
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
                        scouting is software that model agencies use to run
                        their talent pipeline. We provide the platform; the
                        agency running the pipeline reviews applications and
                        decides on them. Submitting an application does not
                        guarantee representation or placement with any agency.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        Eligibility
                    </h2>
                    <p>
                        Applicants must be at least 14 years of age. By
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
                        application. Applications from minors may not be made
                        available to the agency until parental consent has been
                        verified.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        Application data
                    </h2>
                    <p>
                        Submitted information — including name, contact details,
                        physical measurements, location, Instagram handle, and
                        photographs — is used exclusively so the agency you
                        applied to can evaluate your application. See our{" "}
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
                        submitting, you grant scouting a limited, non-exclusive
                        license to store your photos and make them available to
                        the agency you applied to, solely for evaluation
                        purposes. We will not use your photos for advertising,
                        marketing, or any purpose unrelated to your application
                        without separate written consent.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 text-xs font-medium uppercase tracking-[0.1em] text-foreground">
                        Limitation of liability
                    </h2>
                    <p>
                        scouting provides software to agencies; it does not
                        represent, sign, or place talent itself. We do not
                        guarantee any outcome, placement, or contract. We are
                        not liable for decisions made by agencies using the
                        platform or for any agreements entered into between
                        applicants and third parties.
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
                            href="mailto:legal@scouting.agency"
                            className="underline transition-colors hover:text-foreground"
                        >
                            legal@scouting.agency
                        </a>
                        .
                    </p>
                </section>
            </div>
        </main>
    )
}
