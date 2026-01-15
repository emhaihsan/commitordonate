import { Lock, Users, Heart, Clock, Zap, Target, Skull } from "lucide-react";
import HeroButtons from "@/components/HeroButtons";
import CTAButton from "@/components/CTAButton";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-20 right-10 w-32 h-32 bg-[var(--pink)] brutal-border rotate-12 opacity-60" />
        <div className="absolute top-40 right-40 w-20 h-20 bg-[var(--yellow)] brutal-border -rotate-6 opacity-80" />
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-[var(--mint)] brutal-border rotate-45 opacity-70" />
        
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 items-center">
            <div>
              <div className="brutal-btn inline-block bg-[var(--lime)] px-4 py-2 text-sm font-bold mb-6 rotate-[-2deg]">
                ⚡ DISCIPLINE WITH CONSEQUENCES
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] mb-6">
                Make promises
                <span className="block bg-[var(--yellow)] brutal-border inline-block px-4 py-1 mt-2 rotate-[-1deg]">
                  that cost you
                </span>
                <span className="block mt-2">if you break them.</span>
              </h1>
              <p className="text-xl leading-relaxed mb-8 max-w-lg font-medium">
                Stake money on your commitments. Keep your promise and get it back. 
                <span className="bg-[var(--pink)] px-2">Fail, and it goes to charity.</span> No excuses. No retries.
              </p>
              <HeroButtons />
            </div>
            
            {/* Hero Card */}
            <div className="hidden lg:block">
              <div className="brutal-card p-8 bg-[var(--cyan)] rotate-3 hover:rotate-0 transition-transform">
                <div className="brutal-card p-6 bg-white -rotate-2">
                  <div className="text-center">
                    <Skull className="w-16 h-16 mx-auto mb-4" />
                    <p className="font-mono text-7xl font-black">$100</p>
                    <p className="font-mono text-lg font-bold mt-2 bg-black text-white inline-block px-4 py-1">
                      AT STAKE
                    </p>
                    <div className="mt-6 pt-6 border-t-[3px] border-black">
                      <p className="text-sm font-bold text-[var(--muted)]">
                        &quot;Exercise every day for 30 days&quot;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[var(--yellow)] border-y-[3px] border-black py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <div className="brutal-btn inline-block bg-black text-white px-6 py-3 text-sm font-bold mb-6">
              HOW IT WORKS
            </div>
            <h2 className="text-4xl md:text-5xl font-black">
              Four steps. <span className="bg-white brutal-border px-4 py-1 inline-block rotate-[-1deg]">No loopholes.</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="brutal-card p-6 bg-white hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 brutal-border bg-[var(--pink)] flex items-center justify-center mb-4">
                <Lock className="w-7 h-7" />
              </div>
              <div className="brutal-btn inline-block bg-black text-white px-3 py-1 text-xs font-bold mb-3">01</div>
              <h3 className="text-xl font-black mb-3">Commit & Stake</h3>
              <p className="text-sm leading-relaxed">
                Define your commitment. Set a deadline. Lock your money. <span className="font-bold">Once submitted, there is no cancel button.</span>
              </p>
            </div>
            
            <div className="brutal-card p-6 bg-white hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 brutal-border bg-[var(--cyan)] flex items-center justify-center mb-4">
                <Clock className="w-7 h-7" />
              </div>
              <div className="brutal-btn inline-block bg-black text-white px-3 py-1 text-xs font-bold mb-3">02</div>
              <h3 className="text-xl font-black mb-3">Do the Work</h3>
              <p className="text-sm leading-relaxed">
                Your money is watching. No reminders. No streaks. <span className="font-bold">Just a deadline and a promise you made.</span>
              </p>
            </div>
            
            <div className="brutal-card p-6 bg-white hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 brutal-border bg-[var(--lavender)] flex items-center justify-center mb-4">
                <Users className="w-7 h-7" />
              </div>
              <div className="brutal-btn inline-block bg-black text-white px-3 py-1 text-xs font-bold mb-3">03</div>
              <h3 className="text-xl font-black mb-3">Get Validated</h3>
              <p className="text-sm leading-relaxed">
                Claim completion. Your validator has 24 hours to confirm or deny. <span className="font-bold">Silence counts as failure.</span>
              </p>
            </div>
            
            <div className="brutal-card p-6 bg-white hover:-translate-y-2 transition-transform">
              <div className="w-14 h-14 brutal-border bg-[var(--mint)] flex items-center justify-center mb-4">
                <Heart className="w-7 h-7" />
              </div>
              <div className="brutal-btn inline-block bg-black text-white px-3 py-1 text-xs font-bold mb-3">04</div>
              <h3 className="text-xl font-black mb-3">Outcome</h3>
              <p className="text-sm leading-relaxed">
                Success: you get your money back. <span className="font-bold">Failure: it goes to charity.</span> Either way, the system keeps its promise.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="brutal-btn inline-block bg-[var(--lavender)] px-4 py-2 text-sm font-bold mb-6">
                💡 PHILOSOPHY
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Discipline is <span className="bg-[var(--orange)] brutal-border px-3 py-1 inline-block">expensive.</span>
              </h2>
              <p className="text-lg leading-relaxed mb-6">
                Most habit apps try to motivate you. They send reminders. They gamify progress. 
                <span className="font-bold"> They make quitting invisible.</span>
              </p>
              <p className="text-lg leading-relaxed">
                This is different. Here, <span className="bg-[var(--pink)] px-2 font-bold">quitting costs you.</span> Not emotionally. Not socially. 
                But tangibly. Your money goes somewhere meaningful — just not back to you.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="brutal-card p-6 bg-[var(--danger)]/10 border-[var(--danger)]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 brutal-border bg-[var(--danger)] flex items-center justify-center shrink-0">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-lg mb-2">What we DON&apos;T do</p>
                    <ul className="space-y-1 text-sm font-medium">
                      <li>❌ No gamification or streaks</li>
                      <li>❌ No celebratory animations</li>
                      <li>❌ No retry buttons</li>
                      <li>❌ No motivational fluff</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="brutal-card p-6 bg-[var(--success)]/10 border-[var(--success)]">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 brutal-border bg-[var(--success)] flex items-center justify-center shrink-0">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-black text-lg mb-2">What we DO</p>
                    <ul className="space-y-1 text-sm font-medium">
                      <li>✓ Make consequences real</li>
                      <li>✓ Keep rules irreversible</li>
                      <li>✓ Turn failure into donation</li>
                      <li>✓ Take your promise seriously</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[var(--pink)] border-y-[3px] border-black py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            Ready to make a <span className="bg-white brutal-border px-4 py-1 inline-block rotate-2">real commitment?</span>
          </h2>
          <p className="text-xl font-medium mb-8 max-w-md mx-auto">
            The best time to start was yesterday. The second best time is now.
          </p>
          <CTAButton />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-mono text-sm font-bold">
              💀 COMMIT_OR_DONATE — Discipline, with consequences.
            </p>
            <p className="font-mono text-sm">
              Built for accountability. No excuses accepted.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
