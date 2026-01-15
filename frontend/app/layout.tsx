import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/lib/providers";
import Header from "@/components/Header";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const spaceMono = Space_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Commit or Donate - Discipline with Consequences",
  description: "A personal commitment app where failure has real consequences. If you break your promise, your money gets donated to charity. No excuses. No retries. No mercy.",
  keywords: ["commitment", "discipline", "accountability", "web3", "blockchain", "arbitrum", "donation", "charity"],
  authors: [{ name: "Commit or Donate Team" }],
  openGraph: {
    title: "Commit or Donate - Discipline with Consequences",
    description: "Make commitments that cost you if you fail. Your stake goes to charity if you don't follow through.",
    type: "website",
    images: ["/logohero.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Commit or Donate - Discipline with Consequences",
    description: "Make commitments that cost you if you fail. Your stake goes to charity if you don't follow through.",
    images: ["/logohero.webp"],
  },
  icons: {
    icon: "/logo.ico",
    shortcut: "/logo.ico",
    apple: "/logo.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${spaceMono.variable} antialiased bg-[var(--background)] text-foreground`}
      >
        <Providers>
          <Header />
          <main className="pt-20">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
