import { ScoutingPage } from "@/components/scouting-page";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://scouting.agency/#org",
      name: "scouting agency",
      url: "https://scouting.agency",
      email: "hello@scouting.agency",
      description:
        "Talent scouting platform connecting aspiring models with top agencies worldwide.",
    },
    {
      "@type": "WebSite",
      "@id": "https://scouting.agency/#website",
      url: "https://scouting.agency",
      name: "scouting agency",
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
      <ScoutingPage />
    </>
  );
}
