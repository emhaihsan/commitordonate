import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Commit or Donate",
  description: "Discipline, with consequences. Make commitments that cost you if you fail.",
};

function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="font-mono text-sm font-bold tracking-tight">
            COMMIT_OR_DONATE
          </Link>
          <nav className="flex items-center gap-8">
            <Link 
              href="/dashboard" 
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/validate" 
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Validate
            </Link>
            <Link 
              href="/commit" 
              className="border border-border-strong px-4 py-2 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              New Commitment
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Header />
        <main className="pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
