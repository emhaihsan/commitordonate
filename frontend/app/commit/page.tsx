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
      <div className="mx-auto max-w-2xl px-6 py-16">
        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-4">
                <div
                  className={`w-8 h-8 border flex items-center justify-center font-mono text-sm ${
                    s === step
                      ? "border-border-strong bg-foreground text-background"
                      : s < step
                      ? "border-border-strong bg-foreground text-background"
                      : "border-border text-muted"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && <div className={`w-16 h-px ${s < step ? "bg-foreground" : "bg-border"}`} />}
              </div>
            ))}
          </div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted">
            Step {step} of 3
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Define Commitment */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Define your commitment
                </h1>
                <p className="text-muted">
                  Be specific. Vague commitments are easy to rationalize away.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-3">
                    What are you committing to?
                  </label>
                  <textarea
                    value={formData.commitment}
                    onChange={(e) => setFormData({ ...formData, commitment: e.target.value })}
                    placeholder="e.g., Exercise every day for 30 days"
                    className="w-full h-32 px-4 py-3 border border-border bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none focus:border-border-strong resize-none"
                  />
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-3">
                    Deadline
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-3 border border-border bg-transparent text-foreground focus:outline-none focus:border-border-strong"
                  />
                  <p className="text-xs text-muted mt-2">
                    You must confirm completion before this time, or you automatically fail.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Stakes & Validator */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Set the stakes
                </h1>
                <p className="text-muted">
                  This money will be locked. You cannot cancel once submitted.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-3">
                    Stake Amount (USDC)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">$</span>
                    <input
                      type="number"
                      value={formData.stakeAmount}
                      onChange={(e) => setFormData({ ...formData, stakeAmount: e.target.value })}
                      placeholder="100"
                      className="w-full px-4 py-3 pl-8 border border-border bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none focus:border-border-strong"
                    />
                  </div>
                  <p className="text-xs text-muted mt-2">
                    Choose an amount that hurts to lose. That&apos;s the point.
                  </p>
                </div>

                <div>
                  <label className="block font-mono text-xs uppercase tracking-widest text-muted mb-3">
                    Validator Address
                  </label>
                  <input
                    type="text"
                    value={formData.validatorAddress}
                    onChange={(e) => setFormData({ ...formData, validatorAddress: e.target.value })}
                    placeholder="0x..."
                    className="w-full px-4 py-3 border border-border bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none focus:border-border-strong font-mono text-sm"
                  />
                  <p className="text-xs text-muted mt-2">
                    Someone you trust to verify your completion. Their silence counts as rejection.
                  </p>
                </div>

                <div className="border border-border p-4 flex gap-3">
                  <Info className="w-4 h-4 text-muted shrink-0 mt-0.5" />
                  <div className="text-sm text-muted">
                    <p className="font-medium text-foreground mb-1">How validation works</p>
                    <p>After you claim completion, your validator has 24 hours to approve or reject. If they do nothing, you fail automatically.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Charity Selection */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">
                  Choose where failure goes
                </h1>
                <p className="text-muted">
                  If you fail, this is where your money ends up.
                </p>
              </div>

              <div className="space-y-4">
                {CHARITIES.map((charity) => (
                  <label
                    key={charity.id}
                    className={`block border p-4 cursor-pointer transition-colors ${
                      formData.charityId === charity.id
                        ? "border-border-strong bg-foreground/5"
                        : "border-border hover:border-border-strong"
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
                        className={`w-4 h-4 border flex items-center justify-center ${
                          formData.charityId === charity.id
                            ? "border-border-strong"
                            : "border-border"
                        }`}
                      >
                        {formData.charityId === charity.id && (
                          <div className="w-2 h-2 bg-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{charity.name}</p>
                        {charity.address && (
                          <p className="font-mono text-xs text-muted">{charity.address}</p>
                        )}
                      </div>
                    </div>
                  </label>
                ))}

                {formData.charityId === "custom" && (
                  <div className="ml-8">
                    <input
                      type="text"
                      value={formData.customCharityAddress}
                      onChange={(e) => setFormData({ ...formData, customCharityAddress: e.target.value })}
                      placeholder="Enter charity wallet address (0x...)"
                      className="w-full px-4 py-3 border border-border bg-transparent text-foreground placeholder:text-muted/50 focus:outline-none focus:border-border-strong font-mono text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Final Warning */}
              <div className="border border-warning/50 bg-warning/5 p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">This action is irreversible</p>
                  <p className="text-muted">
                    Once you submit, your funds will be locked. There is no cancel button. 
                    There is no refund if you fail. The system will do exactly what it promises.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={!canProceed() || isSubmitting}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                "Locking funds..."
              ) : step === 3 ? (
                <>
                  Lock Funds & Create Commitment
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
