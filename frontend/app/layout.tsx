import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

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
  title: "Commit or Donate",
  description: "Discipline, with consequences. Make commitments that cost you if you fail.",
};

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)] border-b-[3px] border-black">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between">
          <Link 
            href="/" 
            className="brutal-btn bg-[var(--yellow)] px-4 py-2 text-lg font-bold tracking-tight"
          >
            💀 COMMIT_OR_DONATE
          </Link>
          <nav className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="brutal-btn bg-white px-4 py-2 text-sm font-bold hover:bg-[var(--cyan)]"
            >
              Dashboard
            </Link>
            <Link 
              href="/validate" 
              className="brutal-btn bg-white px-4 py-2 text-sm font-bold hover:bg-[var(--lavender)]"
            >
              Validate
            </Link>
            <Link 
              href="/commit" 
              className="brutal-btn bg-[var(--pink)] px-5 py-2 text-sm font-bold hover:bg-[var(--orange)]"
            >
              + New Commitment
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

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
        <Header />
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
