import type { Metadata } from "next";
import { Inter, Cormorant_Garamond, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  weight: ["300"],
  variable: "--font-heading",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "SCOUTING.AGENCY — We're looking for the next face.",
  description:
    "Submit your application to be scouted for top modeling agencies worldwide. Girls aged 14–35, no experience needed.",
  openGraph: {
    title: "SCOUTING.AGENCY — We're looking for the next face.",
    description:
      "Submit your application to be scouted for top modeling agencies worldwide. Girls aged 14–35, no experience needed.",
    type: "website",
    url: "https://scouting.agency",
  },
  twitter: {
    card: "summary",
    title: "SCOUTING.AGENCY — We're looking for the next face.",
    description:
      "Submit your application to be scouted for top modeling agencies worldwide. Girls aged 14–35, no experience needed.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${cormorant.variable} ${playfair.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
