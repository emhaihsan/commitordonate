"use client";

import { useState } from "react";
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
  Check
} from "lucide-react";

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

const MOCK_COMMITMENTS: Record<string, CommitmentDetail> = {
  "1": {
    id: "1",
    commitment: "Exercise every day for 30 days",
    description: "At least 30 minutes of physical activity including running, gym, or home workout.",
    deadline: "2024-02-15T23:59:00",
    stakeAmount: 100,
    status: "active",
    validator: "0x1234567890abcdef1234567890abcdef12345678",
    charity: "UNICEF",
    charityAddress: "0xabcdef1234567890abcdef1234567890abcdef12",
    createdAt: "2024-01-15T10:00:00",
    txHash: "0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
  },
  "2": {
    id: "2",
    commitment: "Complete React course on Udemy",
    deadline: "2024-02-01T23:59:00",
    stakeAmount: 50,
    status: "pending_validation",
    validator: "0x2345678901bcdef2345678901bcdef23456789",
    charity: "Red Cross",
    charityAddress: "0xbcdef2345678901abcdef2345678901abcdef23",
    createdAt: "2024-01-10T14:30:00",
    confirmedAt: "2024-02-01T20:00:00",
    txHash: "0x8765432109edcba98765432109edcba98765432109edcba98765432109edcba9",
  },
  "3": {
    id: "3",
    commitment: "Read 5 books this month",
    deadline: "2024-01-31T23:59:00",
    stakeAmount: 75,
    status: "success",
    validator: "0x3456789012cdef3456789012cdef345678901",
    charity: "Doctors Without Borders",
    charityAddress: "0xcdef3456789012abcdef3456789012abcdef34",
    createdAt: "2024-01-01T09:00:00",
    confirmedAt: "2024-01-30T18:00:00",
    resolvedAt: "2024-01-30T20:00:00",
    txHash: "0x7654321098dcba987654321098dcba987654321098dcba987654321098dcba98",
  },
  "4": {
    id: "4",
    commitment: "No social media for 2 weeks",
    deadline: "2024-01-20T23:59:00",
    stakeAmount: 200,
    status: "failed",
    validator: "0x4567890123def4567890123def456789012",
    charity: "UNICEF",
    charityAddress: "0xdef4567890123abcdef4567890123abcdef45",
    createdAt: "2024-01-06T12:00:00",
    resolvedAt: "2024-01-21T00:00:00",
    txHash: "0x6543210987cba9876543210987cba9876543210987cba9876543210987cba987",
    donationTxHash: "0x5432109876ba98765432109876ba98765432109876ba98765432109876ba9876",
  },
};

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
        <div className={`w-3 h-3 rounded-full border-2 ${
          status === "completed" ? "bg-foreground border-foreground" :
          status === "current" ? "bg-transparent border-foreground" :
          status === "failed" ? "bg-danger border-danger" :
          "bg-transparent border-border"
        }`} />
        {!isLast && (
          <div className={`w-px flex-1 min-h-[40px] ${
            status === "completed" || status === "current" ? "bg-foreground" : "bg-border"
          }`} />
        )}
      </div>
      <div className="pb-8">
        <p className={`font-medium ${status === "pending" ? "text-muted" : ""}`}>{title}</p>
        <p className="text-sm text-muted mt-1">{description}</p>
        {timestamp && (
          <p className="font-mono text-xs text-muted mt-2">{formatDate(timestamp)}</p>
        )}
      </div>
    </div>
  );
}

export default function CommitmentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const commitment = MOCK_COMMITMENTS[id];
  
  const [isConfirming, setIsConfirming] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!commitment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Commitment not found</h1>
          <Link href="/dashboard" className="text-muted hover:text-foreground transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const handleConfirmCompletion = async () => {
    setIsConfirming(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConfirming(false);
    // In real app, this would update the status
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
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-3xl font-bold tracking-tight">{commitment.commitment}</h1>
            <div className={`flex items-center gap-2 px-3 py-1.5 border ${
              commitment.status === "success" ? "border-success text-success" :
              commitment.status === "failed" ? "border-danger text-danger" :
              commitment.status === "pending_validation" ? "border-warning text-warning" :
              "border-border-strong"
            }`}>
              {commitment.status === "success" && <CheckCircle className="w-4 h-4" />}
              {commitment.status === "failed" && <XCircle className="w-4 h-4" />}
              {commitment.status === "pending_validation" && <Clock className="w-4 h-4" />}
              {commitment.status === "active" && <Clock className="w-4 h-4" />}
              <span className="text-sm font-medium uppercase">
                {commitment.status === "pending_validation" ? "Awaiting Validator" : commitment.status}
              </span>
            </div>
          </div>
          {commitment.description && (
            <p className="text-muted">{commitment.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Action Card (for active commitments) */}
            {commitment.status === "active" && (
              <div className="border border-border-strong p-6">
                <h2 className="font-semibold mb-4">Ready to confirm completion?</h2>
                <p className="text-sm text-muted mb-6">
                  Once you confirm, your validator has 24 hours to approve or reject. 
                  If they don&apos;t respond, you will be marked as failed.
                </p>
                <button
                  onClick={handleConfirmCompletion}
                  disabled={isConfirming}
                  className="w-full inline-flex items-center justify-center gap-2 bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
                >
                  {isConfirming ? "Confirming..." : "Confirm Completion"}
                </button>
              </div>
            )}

            {/* Pending Validation Warning */}
            {commitment.status === "pending_validation" && (
              <div className="border border-warning p-6">
                <div className="flex gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
                  <div>
                    <h2 className="font-semibold mb-2">Awaiting Validator Response</h2>
                    <p className="text-sm text-muted mb-4">
                      Your validator has been notified. They have 24 hours to approve or reject your completion claim.
                    </p>
                    <p className="text-sm text-muted">
                      <strong className="text-foreground">Remember:</strong> If the validator does not respond within 24 hours, 
                      your commitment will be marked as failed and funds will be donated.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Failed Notice */}
            {commitment.status === "failed" && (
              <div className="border border-danger p-6">
                <div className="flex gap-3">
                  <XCircle className="w-5 h-5 text-danger shrink-0" />
                  <div>
                    <h2 className="font-semibold mb-2">Commitment Failed</h2>
                    <p className="text-sm text-muted mb-4">
                      Your ${commitment.stakeAmount} has been donated to {commitment.charity}.
                    </p>
                    {commitment.donationTxHash && (
                      <a
                        href={`https://etherscan.io/tx/${commitment.donationTxHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                      >
                        View donation transaction
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Success Notice */}
            {commitment.status === "success" && (
              <div className="border border-success p-6">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-success shrink-0" />
                  <div>
                    <h2 className="font-semibold mb-2">Commitment Successful</h2>
                    <p className="text-sm text-muted">
                      Your ${commitment.stakeAmount} has been returned to your wallet. 
                      You kept your promise.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="border border-border p-6">
              <h2 className="font-semibold mb-6">Timeline</h2>
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
            <div className="border border-border p-6">
              <h2 className="font-semibold mb-6">Details</h2>
              <div className="space-y-4">
                <div>
                  <p className="font-mono text-xs text-muted mb-1">STAKE AMOUNT</p>
                  <p className="font-mono text-xl font-bold">${commitment.stakeAmount}</p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="font-mono text-xs text-muted mb-1">DEADLINE</p>
                  <p className="text-sm">{formatDate(commitment.deadline)}</p>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="font-mono text-xs text-muted mb-1">VALIDATOR</p>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{formatAddress(commitment.validator)}</p>
                    <button
                      onClick={() => copyToClipboard(commitment.validator)}
                      className="text-muted hover:text-foreground transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="border-t border-border pt-4">
                  <p className="font-mono text-xs text-muted mb-1">CHARITY</p>
                  <p className="text-sm mb-1">{commitment.charity}</p>
                  <p className="font-mono text-xs text-muted">{formatAddress(commitment.charityAddress)}</p>
                </div>
              </div>
            </div>

            {/* Transaction */}
            {commitment.txHash && (
              <div className="border border-border p-6">
                <h2 className="font-semibold mb-4">Transaction</h2>
                <a
                  href={`https://etherscan.io/tx/${commitment.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
                >
                  <span className="font-mono">{formatAddress(commitment.txHash)}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
