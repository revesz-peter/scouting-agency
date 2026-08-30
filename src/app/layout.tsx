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

const TITLE = "scouting — the progressive infrastructure behind model agencies."
const DESCRIPTION =
    "One system for the whole new-faces pipeline — from the first application to a signed face on the board."

export const metadata: Metadata = {
    metadataBase: new URL("https://scouting.agency"),
    title: {
        default: TITLE,
        template: "%s | scouting",
    },
    description: DESCRIPTION,
    alternates: { canonical: "/" },
    icons: { icon: "/favicon.svg" },
    openGraph: {
        title: TITLE,
        description: DESCRIPTION,
        type: "website",
        url: "https://scouting.agency",
        siteName: "scouting",
    },
    twitter: {
        card: "summary_large_image",
        title: TITLE,
        description: DESCRIPTION,
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
