"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, AlertTriangle, User } from "lucide-react";

interface PendingValidation {
  id: string;
  commitment: string;
  committer: string;
  committerAddress: string;
  stakeAmount: number;
  deadline: string;
  confirmedAt: string;
  expiresAt: string;
  charity: string;
}

const MOCK_PENDING: PendingValidation[] = [
  {
    id: "v1",
    commitment: "Exercise every day for 30 days",
    committer: "Alice",
    committerAddress: "0x1234567890abcdef1234567890abcdef12345678",
    stakeAmount: 100,
    deadline: "2024-02-15T23:59:00",
    confirmedAt: "2024-02-15T18:00:00",
    expiresAt: "2024-02-16T18:00:00",
    charity: "UNICEF",
  },
  {
    id: "v2",
    commitment: "Complete React course on Udemy",
    committer: "Bob",
    committerAddress: "0x2345678901bcdef2345678901bcdef23456789",
    stakeAmount: 50,
    deadline: "2024-02-01T23:59:00",
    confirmedAt: "2024-02-01T20:00:00",
    expiresAt: "2024-02-02T20:00:00",
    charity: "Red Cross",
  },
];

interface PastValidation {
  id: string;
  commitment: string;
  committer: string;
  stakeAmount: number;
  outcome: "approved" | "rejected";
  resolvedAt: string;
}

const MOCK_PAST: PastValidation[] = [
  {
    id: "pv1",
    commitment: "Read 5 books this month",
    committer: "Charlie",
    stakeAmount: 75,
    outcome: "approved",
    resolvedAt: "2024-01-30T20:00:00",
  },
  {
    id: "pv2",
    commitment: "No social media for 2 weeks",
    committer: "Diana",
    stakeAmount: 200,
    outcome: "rejected",
    resolvedAt: "2024-01-21T00:00:00",
  },
];

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeRemaining(expiresAt: string) {
  const now = new Date();
  const end = new Date(expiresAt);
  const diff = end.getTime() - now.getTime();
  
  if (diff < 0) return "Expired";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
}

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function ValidationCard({ validation }: { validation: PendingValidation }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsApproving(false);
    // In real app, refresh data
  };

  const handleReject = async () => {
    setIsRejecting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRejecting(false);
    setShowConfirmReject(false);
    // In real app, refresh data
  };

  return (
    <div className="border border-border">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border border-border-strong flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">{validation.committer}</p>
              <p className="font-mono text-xs text-muted">{formatAddress(validation.committerAddress)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-warning">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm">{formatTimeRemaining(validation.expiresAt)} left</span>
          </div>
        </div>

        {/* Commitment */}
        <div className="mb-6">
          <p className="font-mono text-xs text-muted mb-2">COMMITMENT</p>
          <p className="text-lg font-medium">{validation.commitment}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6 py-4 border-t border-b border-border">
          <div>
            <p className="font-mono text-xs text-muted mb-1">STAKE</p>
            <p className="font-mono font-bold">${validation.stakeAmount}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted mb-1">CONFIRMED</p>
            <p className="text-sm">{formatDate(validation.confirmedAt)}</p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted mb-1">IF REJECTED</p>
            <p className="text-sm">→ {validation.charity}</p>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-foreground/5 p-4 mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-4 h-4 text-muted shrink-0 mt-0.5" />
            <p className="text-sm text-muted">
              <strong className="text-foreground">Your decision is final.</strong> If you approve, the committer 
              gets their ${validation.stakeAmount} back. If you reject or do nothing, the money goes to {validation.charity}.
            </p>
          </div>
        </div>

        {/* Actions */}
        {!showConfirmReject ? (
          <div className="flex gap-4">
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-success text-white px-6 py-3 text-sm font-medium hover:bg-success/90 transition-colors disabled:opacity-50"
            >
              {isApproving ? (
                "Approving..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Approve Completion
                </>
              )}
            </button>
            <button
              onClick={() => setShowConfirmReject(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-danger text-danger px-6 py-3 text-sm font-medium hover:bg-danger hover:text-white transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        ) : (
          <div className="border border-danger p-4">
            <p className="text-sm mb-4">
              Are you sure you want to reject? This will donate ${validation.stakeAmount} to {validation.charity}. 
              This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-danger text-white px-6 py-3 text-sm font-medium hover:bg-danger/90 transition-colors disabled:opacity-50"
              >
                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
              </button>
              <button
                onClick={() => setShowConfirmReject(false)}
                className="flex-1 inline-flex items-center justify-center gap-2 border border-border px-6 py-3 text-sm font-medium hover:border-border-strong transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ValidatePage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
            Validator Portal
          </p>
          <h1 className="text-3xl font-bold tracking-tight mb-4">Pending Validations</h1>
          <p className="text-muted max-w-2xl">
            These people have named you as their validator. Your response determines whether they 
            get their money back or it goes to charity. Silence counts as rejection.
          </p>
        </div>

        {/* Pending Validations */}
        <section className="mb-12">
          {MOCK_PENDING.length === 0 ? (
            <div className="border border-border p-12 text-center">
              <p className="text-muted">No pending validations</p>
            </div>
          ) : (
            <div className="space-y-6">
              {MOCK_PENDING.map((validation) => (
                <ValidationCard key={validation.id} validation={validation} />
              ))}
            </div>
          )}
        </section>

        {/* Past Validations */}
        <section>
          <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-border">
            Past Validations
          </h2>
          
          {MOCK_PAST.length === 0 ? (
            <div className="border border-border p-12 text-center">
              <p className="text-muted">No past validations</p>
            </div>
          ) : (
            <div className="border border-border">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-muted font-normal">
                      Commitment
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-muted font-normal">
                      Committer
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-muted font-normal">
                      Stake
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-muted font-normal">
                      Your Decision
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-muted font-normal">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_PAST.map((validation) => (
                    <tr key={validation.id} className="border-b border-border last:border-b-0">
                      <td className="p-4">{validation.commitment}</td>
                      <td className="p-4">{validation.committer}</td>
                      <td className="p-4 font-mono">${validation.stakeAmount}</td>
                      <td className="p-4">
                        <div className={`flex items-center gap-2 ${
                          validation.outcome === "approved" ? "text-success" : "text-danger"
                        }`}>
                          {validation.outcome === "approved" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span className="text-sm capitalize">{validation.outcome}</span>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-sm text-muted">
                        {formatDate(validation.resolvedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Info Section */}
        <section className="mt-12 border-t border-border pt-12">
          <h2 className="text-xl font-semibold mb-6">How Validation Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-border p-6">
              <p className="font-mono text-sm text-muted mb-2">01</p>
              <h3 className="font-semibold mb-2">You Were Chosen</h3>
              <p className="text-sm text-muted">
                Someone trusted you enough to stake real money on your judgment.
              </p>
            </div>
            <div className="border border-border p-6">
              <p className="font-mono text-sm text-muted mb-2">02</p>
              <h3 className="font-semibold mb-2">24 Hour Window</h3>
              <p className="text-sm text-muted">
                You have 24 hours from when they confirm completion. After that, silence = rejection.
              </p>
            </div>
            <div className="border border-border p-6">
              <p className="font-mono text-sm text-muted mb-2">03</p>
              <h3 className="font-semibold mb-2">Be Honest</h3>
              <p className="text-sm text-muted">
                Your decision is final and on-chain. The system trusts your judgment completely.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
