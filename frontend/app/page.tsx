import Link from "next/link";
import { ArrowRight, Lock, Users, Heart, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            <div className="flex flex-col justify-center">
              <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
                Discipline, with consequences
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Make promises<br />that cost you<br />if you break them.
              </h1>
              <p className="text-lg text-muted leading-relaxed mb-8 max-w-md">
                Stake money on your commitments. Keep your promise and get it back. 
                Fail, and it goes to charity. No excuses. No retries.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/commit"
                  className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  Create Commitment
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center gap-2 border border-border-strong px-6 py-3 text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="grid-pattern w-full h-80 border border-border relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-mono text-6xl font-bold">$100</p>
                    <p className="font-mono text-sm text-muted mt-2">AT STAKE</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-tight mb-16">
            Four steps. No loopholes.
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            <div className="bg-background p-8">
              <div className="w-10 h-10 border border-border-strong flex items-center justify-center mb-6">
                <Lock className="w-5 h-5" />
              </div>
              <p className="font-mono text-xs text-muted mb-2">01</p>
              <h3 className="text-lg font-semibold mb-3">Commit & Stake</h3>
              <p className="text-sm text-muted leading-relaxed">
                Define your commitment. Set a deadline. Lock your money. Once submitted, there is no cancel button.
              </p>
            </div>
            
            <div className="bg-background p-8">
              <div className="w-10 h-10 border border-border-strong flex items-center justify-center mb-6">
                <Clock className="w-5 h-5" />
              </div>
              <p className="font-mono text-xs text-muted mb-2">02</p>
              <h3 className="text-lg font-semibold mb-3">Do the Work</h3>
              <p className="text-sm text-muted leading-relaxed">
                Your money is watching. No reminders. No streaks. Just a deadline and a promise you made.
              </p>
            </div>
            
            <div className="bg-background p-8">
              <div className="w-10 h-10 border border-border-strong flex items-center justify-center mb-6">
                <Users className="w-5 h-5" />
              </div>
              <p className="font-mono text-xs text-muted mb-2">03</p>
              <h3 className="text-lg font-semibold mb-3">Get Validated</h3>
              <p className="text-sm text-muted leading-relaxed">
                Claim completion. Your validator has 24 hours to confirm or deny. Silence counts as failure.
              </p>
            </div>
            
            <div className="bg-background p-8">
              <div className="w-10 h-10 border border-border-strong flex items-center justify-center mb-6">
                <Heart className="w-5 h-5" />
              </div>
              <p className="font-mono text-xs text-muted mb-2">04</p>
              <h3 className="text-lg font-semibold mb-3">Outcome</h3>
              <p className="text-sm text-muted leading-relaxed">
                Success: you get your money back. Failure: it goes to charity. Either way, the system keeps its promise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
                Philosophy
              </p>
              <h2 className="text-3xl font-bold tracking-tight mb-6">
                Discipline is expensive.
              </h2>
              <p className="text-muted leading-relaxed mb-6">
                Most habit apps try to motivate you. They send reminders. They gamify progress. 
                They make quitting invisible.
              </p>
              <p className="text-muted leading-relaxed">
                This is different. Here, quitting costs you. Not emotionally. Not socially. 
                But tangibly. Your money goes somewhere meaningful — just not back to you.
              </p>
            </div>
            <div className="border border-border p-8">
              <div className="space-y-6">
                <div className="border-b border-border pb-6">
                  <p className="font-mono text-sm text-danger mb-1">What we don&apos;t do</p>
                  <ul className="space-y-2 text-sm text-muted">
                    <li>— No gamification or streaks</li>
                    <li>— No celebratory animations</li>
                    <li>— No retry buttons</li>
                    <li>— No motivational fluff</li>
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-sm text-success mb-1">What we do</p>
                  <ul className="space-y-2 text-sm text-muted">
                    <li>— Make consequences real</li>
                    <li>— Keep rules irreversible</li>
                    <li>— Turn failure into donation</li>
                    <li>— Take your promise seriously</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to make a real commitment?
            </h2>
            <p className="text-muted mb-8 max-w-md mx-auto">
              The best time to start was yesterday. The second best time is now.
            </p>
            <Link
              href="/commit"
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Create Your First Commitment
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-xs text-muted">
              COMMIT_OR_DONATE — Discipline, with consequences.
            </p>
            <p className="font-mono text-xs text-muted">
              Built for accountability. No excuses accepted.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
