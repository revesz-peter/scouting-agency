import type { Metadata } from "next"
import { Inter, Libre_Baskerville } from "next/font/google"
import "./globals.css"

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    variable: "--font-sans",
})

const libre = Libre_Baskerville({
    subsets: ["latin"],
    weight: ["400", "700"],
    display: "swap",
    variable: "--font-libre",
})

export const metadata: Metadata = {
    metadataBase: new URL("https://scouting.agency"),
    title: {
        default: "scouting agency — we're looking for the next face.",
        template: "%s | scouting agency",
    },
    description:
        "Submit your application to be scouted for top modeling agencies worldwide. Girls aged 14+, no experience needed.",
    alternates: { canonical: "/" },
    openGraph: {
        title: "scouting agency — we're looking for the next face.",
        description:
            "Submit your application to be scouted for top modeling agencies worldwide. Girls aged 14+, no experience needed.",
        type: "website",
        url: "https://scouting.agency",
        siteName: "scouting agency",
    },
    twitter: {
        card: "summary_large_image",
        title: "scouting agency — we're looking for the next face.",
        description:
            "Submit your application to be scouted for top modeling agencies worldwide. Girls aged 14+, no experience needed.",
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${libre.variable} font-sans`}>{children}</body>
        </html>
    )
}
