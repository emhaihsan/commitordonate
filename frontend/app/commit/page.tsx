"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Info } from "lucide-react";

const CHARITIES = [
  { id: "unicef", name: "UNICEF", address: "0x1234...5678" },
  { id: "redcross", name: "Red Cross", address: "0x2345...6789" },
  { id: "doctors", name: "Doctors Without Borders", address: "0x3456...7890" },
  { id: "custom", name: "Custom Address", address: "" },
];

export default function CommitPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    commitment: "",
    deadline: "",
    stakeAmount: "",
    validatorAddress: "",
    charityId: "",
    customCharityAddress: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    setIsSubmitting(true);
    // Simulate transaction
    await new Promise(resolve => setTimeout(resolve, 2000));
    router.push("/dashboard?created=true");
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.commitment.length > 0 && formData.deadline.length > 0;
    }
    if (step === 2) {
      return formData.stakeAmount.length > 0 && formData.validatorAddress.length > 0;
    }
    if (step === 3) {
      return formData.charityId.length > 0 && 
        (formData.charityId !== "custom" || formData.customCharityAddress.length > 0);
    }
    return false;
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-12">
        {/* Progress */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 brutal-border flex items-center justify-center font-mono text-lg font-black ${
                    s === step
                      ? "bg-[var(--pink)]"
                      : s < step
                      ? "bg-[var(--mint)]"
                      : "bg-white text-[var(--muted)]"
                  }`}
                >
                  {s < step ? "✓" : s}
                </div>
                {s < 3 && <div className={`w-12 h-1 ${s < step ? "bg-black" : "bg-gray-300"}`} />}
              </div>
            ))}
          </div>
          <div className="brutal-btn inline-block bg-[var(--yellow)] px-4 py-2 text-sm font-bold">
            STEP {step} OF 3
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Define Commitment */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-3">
                  Define your <span className="bg-[var(--cyan)] brutal-border px-2">commitment</span>
                </h1>
                <p className="text-lg font-medium">
                  Be specific. <span className="text-[var(--muted)]">Vague commitments are easy to rationalize away.</span>
                </p>
              </div>

              <div className="space-y-6">
                <div className="brutal-card p-6 bg-white">
                  <label className="block font-mono text-xs uppercase tracking-widest mb-3 font-bold">
                    📝 What are you committing to?
                  </label>
                  <textarea
                    value={formData.commitment}
                    onChange={(e) => setFormData({ ...formData, commitment: e.target.value })}
                    placeholder="e.g., Exercise every day for 30 days"
                    className="brutal-input w-full h-32 resize-none"
                  />
                </div>

                <div className="brutal-card p-6 bg-white">
                  <label className="block font-mono text-xs uppercase tracking-widest mb-3 font-bold">
                    ⏰ Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="brutal-input w-full"
                  />
                  <p className="text-sm text-[var(--muted)] mt-3 font-medium">
                    ⚠️ You must confirm completion before this time, or you automatically fail.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Stakes & Validator */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-3">
                  Set the <span className="bg-[var(--orange)] brutal-border px-2">stakes</span>
                </h1>
                <p className="text-lg font-medium">
                  This money will be locked. <span className="text-[var(--danger)] font-bold">You cannot cancel once submitted.</span>
                </p>
              </div>

              <div className="space-y-6">
                <div className="brutal-card p-6 bg-[var(--yellow)]">
                  <label className="block font-mono text-xs uppercase tracking-widest mb-3 font-bold">
                    💰 Stake Amount (USDC)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg">$</span>
                    <input
                      type="number"
                      value={formData.stakeAmount}
                      onChange={(e) => setFormData({ ...formData, stakeAmount: e.target.value })}
                      placeholder="100"
                      className="brutal-input w-full pl-10 text-2xl font-black"
                    />
                  </div>
                  <p className="text-sm mt-3 font-bold">
                    💡 Choose an amount that hurts to lose. That&apos;s the point.
                  </p>
                </div>

                <div className="brutal-card p-6 bg-white">
                  <label className="block font-mono text-xs uppercase tracking-widest mb-3 font-bold">
                    👤 Validator Address
                  </label>
                  <input
                    type="text"
                    value={formData.validatorAddress}
                    onChange={(e) => setFormData({ ...formData, validatorAddress: e.target.value })}
                    placeholder="0x..."
                    className="brutal-input w-full font-mono text-sm"
                  />
                  <p className="text-sm text-[var(--muted)] mt-3 font-medium">
                    Someone you trust to verify your completion. Their silence counts as rejection.
                  </p>
                </div>

                <div className="brutal-card p-5 bg-[var(--lavender)] flex gap-4">
                  <Info className="w-6 h-6 shrink-0" />
                  <div>
                    <p className="font-bold mb-1">How validation works</p>
                    <p className="text-sm">After you claim completion, your validator has 24 hours to approve or reject. If they do nothing, you fail automatically.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Charity Selection */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl font-black tracking-tight mb-3">
                  Choose where <span className="bg-[var(--pink)] brutal-border px-2">failure</span> goes
                </h1>
                <p className="text-lg font-medium">
                  If you fail, this is where your money ends up.
                </p>
              </div>

              <div className="space-y-4">
                {CHARITIES.map((charity) => (
                  <label
                    key={charity.id}
                    className={`block brutal-card p-5 cursor-pointer transition-all ${
                      formData.charityId === charity.id
                        ? "bg-[var(--mint)] -translate-y-1"
                        : "bg-white hover:-translate-y-1"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <input
                        type="radio"
                        name="charity"
                        value={charity.id}
                        checked={formData.charityId === charity.id}
                        onChange={(e) => setFormData({ ...formData, charityId: e.target.value })}
                        className="sr-only"
                      />
                      <div
                        className={`w-6 h-6 brutal-border flex items-center justify-center ${
                          formData.charityId === charity.id
                            ? "bg-black"
                            : "bg-white"
                        }`}
                      >
                        {formData.charityId === charity.id && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{charity.name}</p>
                        {charity.address && (
                          <p className="font-mono text-xs text-[var(--muted)]">{charity.address}</p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}

                {formData.charityId === "custom" && (
                  <div className="ml-10">
                    <input
                      type="text"
                      value={formData.customCharityAddress}
                      onChange={(e) => setFormData({ ...formData, customCharityAddress: e.target.value })}
                      placeholder="Enter charity wallet address (0x...)"
                      className="brutal-input w-full font-mono text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Final Warning */}
              <div className="brutal-card p-5 bg-[var(--danger)] text-white flex gap-4">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <div>
                  <p className="font-bold text-lg mb-1">⚠️ This action is IRREVERSIBLE</p>
                  <p className="text-sm">
                    Once you submit, your funds will be locked. There is no cancel button. 
                    There is no refund if you fail. The system will do exactly what it promises.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t-[3px] border-black">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="brutal-btn bg-white px-5 py-3 font-bold"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={!canProceed() || isSubmitting}
              className={`brutal-btn px-8 py-4 font-bold inline-flex items-center gap-2 ${
                step === 3 ? "bg-[var(--danger)] text-white" : "bg-[var(--pink)]"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                "🔒 Locking funds..."
              ) : step === 3 ? (
                <>
                  🔒 Lock Funds & Create
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
