"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Loader2
} from "lucide-react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useCommitmentVault } from "@/lib/hooks/useContracts";
import { 
  CommitmentStatus as ContractStatus, 
  CommitmentOutcome,
  type Commitment as ContractCommitment,
  formatAddress as formatAddr,
} from "@/lib/contracts";

type CommitmentStatus = "active" | "pending_confirmation" | "pending_validation" | "success" | "failed";

interface CommitmentDetail {
  id: string;
  commitment: string;
  description?: string;
  deadline: string;
  stakeAmount: number;
  status: CommitmentStatus;
  validator: string;
  charity: string;
  charityAddress: string;
  createdAt: string;
  confirmedAt?: string;
  resolvedAt?: string;
  txHash?: string;
  donationTxHash?: string;
}

function mapContractStatus(status: ContractStatus, outcome: CommitmentOutcome): CommitmentStatus {
  if (status === ContractStatus.Resolved) {
    return outcome === CommitmentOutcome.Success ? "success" : "failed";
  }
  if (status === ContractStatus.PendingValidation) {
    return "pending_validation";
  }
  return "active";
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function TimelineStep({ 
  title, 
  description, 
  timestamp, 
  status,
  isLast = false
}: { 
  title: string; 
  description: string; 
  timestamp?: string;
  status: "completed" | "current" | "pending" | "failed";
  isLast?: boolean;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 brutal-border flex items-center justify-center text-sm font-bold ${
          status === "completed" ? "bg-[var(--mint)]" :
          status === "current" ? "bg-[var(--yellow)]" :
          status === "failed" ? "bg-[var(--danger)] text-white" :
          "bg-white text-[var(--muted)]"
        }`}>
          {status === "completed" ? "✓" : status === "failed" ? "✗" : status === "current" ? "→" : "○"}
        </div>
        {!isLast && (
          <div className={`w-1 flex-1 min-h-[40px] ${
            status === "completed" || status === "current" ? "bg-black" : "bg-gray-300"
          }`} />
        )}
      </div>
      <div className="pb-8">
        <p className={`font-bold text-lg ${status === "pending" ? "text-[var(--muted)]" : ""}`}>{title}</p>
        <p className="text-sm mt-1">{description}</p>
        {timestamp && (
          <p className="font-mono text-xs text-[var(--muted)] mt-2 font-medium">{formatDate(timestamp)}</p>
        )}
      </div>
    </div>
  );
}

export default function CommitmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { ready, authenticated, login } = usePrivy();
  const { getCommitment, confirmCompletion: confirmCompletionContract } = useCommitmentVault();
  
  const [commitment, setCommitment] = useState<CommitmentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadCommitment();
    }
  }, [id]);

  const loadCommitment = async () => {
    setIsLoading(true);
    try {
      const c = await getCommitment(BigInt(id));
      if (c) {
        setCommitment({
          id,
          commitment: c.description,
          deadline: new Date(Number(c.deadline) * 1000).toISOString(),
          stakeAmount: Number(c.amount) / 1e6,
          status: mapContractStatus(c.status, c.outcome),
          validator: c.validator,
          charity: formatAddr(c.charity),
          charityAddress: c.charity,
          createdAt: new Date().toISOString(),
          confirmedAt: c.confirmationTime > 0 ? new Date(Number(c.confirmationTime) * 1000).toISOString() : undefined,
        });
      }
    } catch (err) {
      console.error("Error loading commitment:", err);
    }
    setIsLoading(false);
  };

  if (!ready || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="brutal-card p-8 bg-white text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="font-bold">Loading commitment...</p>
        </div>
      </div>
    );
  }

  if (!commitment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center brutal-card p-12 bg-white">
          <h1 className="text-3xl font-black mb-4">😕 Commitment not found</h1>
          <Link href="/dashboard" className="brutal-btn bg-[var(--pink)] px-6 py-3 font-bold inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirmCompletion = async () => {
    setIsConfirming(true);
    setError(null);
    try {
      await confirmCompletionContract(BigInt(id));
      await loadCommitment();
    } catch (err: any) {
      setError(err.message || "Failed to confirm completion");
    }
    setIsConfirming(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTimelineSteps = () => {
    const steps = [];
    
    // Created
    steps.push({
      title: "Commitment Created",
      description: `$${commitment.stakeAmount} locked in escrow`,
      timestamp: commitment.createdAt,
      status: "completed" as const,
    });

    // Waiting/Active
    if (commitment.status === "active") {
      steps.push({
        title: "In Progress",
        description: "Complete your commitment before the deadline",
        status: "current" as const,
      });
      steps.push({
        title: "Confirm Completion",
        description: "You must confirm before deadline",
        status: "pending" as const,
      });
      steps.push({
        title: "Validator Review",
        description: "24-hour window for validator response",
        status: "pending" as const,
      });
      steps.push({
        title: "Resolution",
        description: "Final outcome determined",
        status: "pending" as const,
        isLast: true,
      });
    } else if (commitment.status === "pending_validation") {
      steps.push({
        title: "In Progress",
        description: "Commitment period completed",
        timestamp: commitment.deadline,
        status: "completed" as const,
      });
      steps.push({
        title: "Completion Confirmed",
        description: "You claimed completion",
        timestamp: commitment.confirmedAt,
        status: "completed" as const,
      });
      steps.push({
        title: "Awaiting Validator",
        description: "Validator has 24 hours to respond. Silence = failure.",
        status: "current" as const,
      });
      steps.push({
        title: "Resolution",
        description: "Final outcome pending",
        status: "pending" as const,
        isLast: true,
      });
    } else if (commitment.status === "success") {
      steps.push({
        title: "In Progress",
        description: "Commitment period completed",
        status: "completed" as const,
      });
      steps.push({
        title: "Completion Confirmed",
        description: "You claimed completion",
        timestamp: commitment.confirmedAt,
        status: "completed" as const,
      });
      steps.push({
        title: "Validator Approved",
        description: "Your validator confirmed success",
        status: "completed" as const,
      });
      steps.push({
        title: "Funds Returned",
        description: `$${commitment.stakeAmount} returned to your wallet`,
        timestamp: commitment.resolvedAt,
        status: "completed" as const,
        isLast: true,
      });
    } else if (commitment.status === "failed") {
      steps.push({
        title: "In Progress",
        description: "Commitment period ended",
        status: "completed" as const,
      });
      steps.push({
        title: "Commitment Failed",
        description: "Deadline passed or validator rejected",
        timestamp: commitment.resolvedAt,
        status: "failed" as const,
      });
      steps.push({
        title: "Funds Donated",
        description: `$${commitment.stakeAmount} sent to ${commitment.charity}`,
        timestamp: commitment.resolvedAt,
        status: "completed" as const,
        isLast: true,
      });
    }

    return steps;
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="brutal-btn bg-white px-4 py-2 font-bold inline-flex items-center gap-2 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-4xl font-black tracking-tight">{commitment.commitment}</h1>
            <div className={`brutal-btn px-4 py-2 flex items-center gap-2 font-bold ${
              commitment.status === "success" ? "bg-[var(--mint)]" :
              commitment.status === "failed" ? "bg-[var(--danger)] text-white" :
              commitment.status === "pending_validation" ? "bg-[var(--yellow)]" :
              "bg-[var(--cyan)]"
            }`}>
              {commitment.status === "success" && <CheckCircle className="w-5 h-5" />}
              {commitment.status === "failed" && <XCircle className="w-5 h-5" />}
              {commitment.status === "pending_validation" && <Clock className="w-5 h-5" />}
              {commitment.status === "active" && <Clock className="w-5 h-5" />}
              <span className="text-sm uppercase">
                {commitment.status === "pending_validation" ? "Awaiting Validator" : commitment.status}
              </span>
            </div>
          </div>
          {commitment.description && (
            <p className="text-lg font-medium">{commitment.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Card (for active commitments) */}
            {commitment.status === "active" && (
              <div className="brutal-card p-6 bg-[var(--cyan)]">
                <h2 className="font-black text-xl mb-4">🎯 Ready to confirm completion?</h2>
                <p className="text-sm mb-6">
                  Once you confirm, your validator has 24 hours to approve or reject. 
                  <span className="font-bold"> If they don&apos;t respond, you will be marked as failed.</span>
                </p>
                <button
                  onClick={handleConfirmCompletion}
                  disabled={isConfirming}
                  className="w-full brutal-btn bg-black text-white px-6 py-4 font-bold disabled:opacity-50"
                >
                  {isConfirming ? "✅ Confirming..." : "✅ Confirm Completion"}
                </button>
              </div>
            )}

            {/* Pending Validation Warning */}
            {commitment.status === "pending_validation" && (
              <div className="brutal-card p-6 bg-[var(--yellow)]">
                <div className="flex gap-4">
                  <AlertTriangle className="w-8 h-8 shrink-0" />
                  <div>
                    <h2 className="font-black text-xl mb-2">⏳ Awaiting Validator Response</h2>
                    <p className="text-sm mb-4">
                      Your validator has been notified. They have 24 hours to approve or reject your completion claim.
                    </p>
                    <p className="text-sm font-bold">
                      ⚠️ If the validator does not respond within 24 hours, 
                      your commitment will be marked as failed and funds will be donated.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Failed Notice */}
            {commitment.status === "failed" && (
              <div className="brutal-card p-6 bg-[var(--danger)] text-white">
                <div className="flex gap-4">
                  <XCircle className="w-8 h-8 shrink-0" />
                  <div>
                    <h2 className="font-black text-xl mb-2">💀 Commitment Failed</h2>
                    <p className="text-sm mb-4">
                      Your ${commitment.stakeAmount} has been donated to {commitment.charity}.
                    </p>
                    {commitment.donationTxHash && (
                      <a
                        href={`https://etherscan.io/tx/${commitment.donationTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="brutal-btn bg-white text-black px-4 py-2 inline-flex items-center gap-2 font-bold text-sm"
                      >
                        View donation transaction
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success Notice */}
            {commitment.status === "success" && (
              <div className="brutal-card p-6 bg-[var(--mint)]">
                <div className="flex gap-4">
                  <CheckCircle className="w-8 h-8 shrink-0" />
                  <div>
                    <h2 className="font-black text-xl mb-2">🏆 Commitment Successful!</h2>
                    <p className="text-sm">
                      Your ${commitment.stakeAmount} has been returned to your wallet. 
                      <span className="font-bold"> You kept your promise.</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="brutal-card p-6 bg-white">
              <h2 className="font-black text-xl mb-6">📅 Timeline</h2>
              <div>
                {getTimelineSteps().map((step, index) => (
                  <TimelineStep
                    key={index}
                    title={step.title}
                    description={step.description}
                    timestamp={step.timestamp}
                    status={step.status}
                    isLast={step.isLast}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <div className="brutal-card p-6 bg-white">
              <h2 className="font-black text-xl mb-6">📋 Details</h2>
              <div className="space-y-4">
                <div className="brutal-card p-4 bg-[var(--yellow)]">
                  <p className="font-mono text-xs mb-1 font-bold">💰 STAKE AMOUNT</p>
                  <p className="font-mono text-3xl font-black">${commitment.stakeAmount}</p>
                </div>
                <div className="brutal-card p-4 bg-white">
                  <p className="font-mono text-xs mb-1 font-bold">⏰ DEADLINE</p>
                  <p className="text-sm font-bold">{formatDate(commitment.deadline)}</p>
                </div>
                <div className="brutal-card p-4 bg-[var(--lavender)]">
                  <p className="font-mono text-xs mb-1 font-bold">👤 VALIDATOR</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-medium">{formatAddress(commitment.validator)}</p>
                    <button
                      onClick={() => copyToClipboard(commitment.validator)}
                      className="brutal-btn bg-white p-1"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="brutal-card p-4 bg-[var(--pink)]">
                  <p className="font-mono text-xs mb-1 font-bold">🎯 CHARITY</p>
                  <p className="font-bold mb-1">{commitment.charity}</p>
                  <p className="font-mono text-xs">{formatAddress(commitment.charityAddress)}</p>
                </div>
              </div>
            </div>

            {/* Transaction */}
            {commitment.txHash && (
              <div className="brutal-card p-6 bg-white">
                <h2 className="font-black text-lg mb-4">🔗 Transaction</h2>
                <a
                  href={`https://etherscan.io/tx/${commitment.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="brutal-btn bg-[var(--cyan)] px-4 py-2 inline-flex items-center gap-2 font-bold text-sm"
                >
                  <span className="font-mono">{formatAddress(commitment.txHash)}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
