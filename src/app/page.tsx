import { LandingPage } from "@/components/landing-page";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://scouting.agency/#org",
      name: "scouting",
      url: "https://scouting.agency",
      description:
        "Software that model agencies use to run their new-faces pipeline, from application to signed talent.",
    },
    {
      "@type": "SoftwareApplication",
      "@id": "https://scouting.agency/#app",
      name: "scouting",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: "https://scouting.agency",
      publisher: { "@id": "https://scouting.agency/#org" },
      description:
        "Talent pipeline infrastructure for model agencies: structured intake, pre-selection, scheduling, board voting, and onboarding in one system.",
    },
    {
      "@type": "WebSite",
      "@id": "https://scouting.agency/#website",
      url: "https://scouting.agency",
      name: "scouting",
      publisher: { "@id": "https://scouting.agency/#org" },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="flex min-h-svh flex-col">
        <SiteHeader />
        <div className="flex-1">
          <LandingPage />
        </div>
        <SiteFooter />
      </div>
    </>
  );
}
