"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, CheckCircle, XCircle, AlertTriangle, User, Loader2, ExternalLink } from "lucide-react";
import { useWeb3Auth, useWeb3AuthConnect } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { useCommitmentVault } from "@/lib/hooks/useContracts";
import { 
  CommitmentStatus as ContractStatus, 
  CommitmentOutcome,
  type Commitment as ContractCommitment,
  formatAddress as formatAddr,
  formatAmountByToken,
  getCurrencySymbol,
  getExplorerTxUrl,
  formatTxHash,
} from "@/lib/contracts";

interface PendingValidation {
  id: string;
  commitment: string;
  committer: string;
  committerAddress: string;
  stakeAmount: string;
  currencySymbol: string;
  deadline: string;
  confirmedAt: string;
  expiresAt: string;
  charity: string;
}

interface PastValidation {
  id: string;
  commitment: string;
  committer: string;
  stakeAmount: string;
  currencySymbol: string;
  outcome: "approved" | "rejected";
  resolvedAt: string;
  txHash?: string;
}

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

function ValidationCard({ validation, onAction }: { validation: PendingValidation; onAction?: () => void }) {
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showConfirmReject, setShowConfirmReject] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionTxHash, setActionTxHash] = useState<string | null>(null);
  const { approve, reject } = useCommitmentVault();

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`validationTxHash:${validation.id}`);
      if (saved) setActionTxHash(saved);
    } catch {
      // ignore
    }
  }, [validation.id]);

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);
    setActionTxHash(null);
    try {
      const result = await approve(BigInt(validation.id));
      setActionTxHash(result.txHash);
      try {
        window.localStorage.setItem(`validationTxHash:${validation.id}`, result.txHash);
      } catch {
        // ignore
      }
      onAction?.();
    } catch (err: any) {
      setError(err.message || "Failed to approve");
    }
    setIsApproving(false);
  };

  const handleReject = async () => {
    setIsRejecting(true);
    setError(null);
    setActionTxHash(null);
    try {
      const result = await reject(BigInt(validation.id));
      setActionTxHash(result.txHash);
      try {
        window.localStorage.setItem(`validationTxHash:${validation.id}`, result.txHash);
      } catch {
        // ignore
      }
      onAction?.();
    } catch (err: any) {
      setError(err.message || "Failed to reject");
    }
    setIsRejecting(false);
    setShowConfirmReject(false);
  };

  return (
    <div className="brutal-card bg-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 brutal-border bg-[var(--lavender)] flex items-center justify-center">
              <User className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-xl">{validation.committer}</p>
              <p className="font-mono text-xs text-[var(--muted)]">{formatAddress(validation.committerAddress)}</p>
            </div>
          </div>
          <div className="brutal-btn bg-[var(--orange)] px-4 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-sm font-bold">{formatTimeRemaining(validation.expiresAt)} left</span>
          </div>
        </div>

        {/* Commitment */}
        <div className="mb-6 brutal-card p-4 bg-[var(--background)]">
          <p className="font-mono text-xs mb-2 font-bold">📋 COMMITMENT</p>
          <p className="text-xl font-bold">{validation.commitment}</p>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="brutal-card p-4 bg-[var(--yellow)]">
            <p className="font-mono text-xs mb-1 font-bold">💰 STAKE</p>
            <p className="font-mono font-black text-2xl">{validation.currencySymbol}{validation.stakeAmount}</p>
          </div>
          <div className="brutal-card p-4 bg-white">
            <p className="font-mono text-xs mb-1 font-bold">✅ CONFIRMED</p>
            <p className="text-sm font-bold">{formatDate(validation.confirmedAt)}</p>
          </div>
          <div className="brutal-card p-4 bg-[var(--pink)]">
            <p className="font-mono text-xs mb-1 font-bold">🎯 IF REJECTED</p>
            <p className="text-sm font-bold">→ {validation.charity}</p>
          </div>
        </div>

        {/* Warning */}
        <div className="brutal-card p-4 bg-[var(--warning)]/20 border-[var(--warning)] mb-6">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm">
              <strong>Your decision is final.</strong> If you approve, the committer 
              gets their {validation.currencySymbol}{validation.stakeAmount} back. If you reject or do nothing, the money goes to {validation.charity}.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="brutal-card p-4 bg-[var(--danger)] text-white mb-6">
            <p className="font-bold">⚠️ {error}</p>
          </div>
        )}

        {/* Actions */}
        {!showConfirmReject ? (
          <div className="flex gap-4">
            <button
              onClick={handleApprove}
              disabled={isApproving}
              className="flex-1 brutal-btn bg-[var(--mint)] px-6 py-4 font-bold inline-flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isApproving ? (
                "✅ Approving..."
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Approve Completion
                </>
              )}
            </button>
            <button
              onClick={() => setShowConfirmReject(true)}
              className="flex-1 brutal-btn bg-white px-6 py-4 font-bold inline-flex items-center justify-center gap-2 hover:bg-[var(--danger)] hover:text-white"
            >
              <XCircle className="w-5 h-5" />
              Reject
            </button>
          </div>
        ) : (
          <div className="brutal-card p-5 bg-[var(--danger)]/10 border-[var(--danger)]">
            <p className="text-sm mb-4 font-medium">
              ⚠️ Are you sure you want to reject? This will donate {validation.currencySymbol}{validation.stakeAmount} to {validation.charity}. 
              <strong> This action cannot be undone.</strong>
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleReject}
                disabled={isRejecting}
                className="flex-1 brutal-btn bg-[var(--danger)] text-white px-6 py-3 font-bold disabled:opacity-50"
              >
                {isRejecting ? "💀 Rejecting..." : "💀 Confirm Rejection"}
              </button>
              <button
                onClick={() => setShowConfirmReject(false)}
                className="flex-1 brutal-btn bg-white px-6 py-3 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Transaction Hash Display */}
        {actionTxHash && (
          <div className="mt-4 p-3 bg-green-100 border-2 border-green-500 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="font-bold text-sm">Action completed!</span>
            </div>
            <a
              href={getExplorerTxUrl(actionTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-mono text-green-600 hover:underline mt-1"
            >
              <Clock className="w-3 h-3" />
              View on Mantlescan: {formatTxHash(actionTxHash)}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ValidatePage() {
  const { isInitialized, isConnected } = useWeb3Auth();
  const { connect } = useWeb3AuthConnect();
  const { address } = useAccount();
  const { getValidatorCommitments, getCommitment } = useCommitmentVault();

  const [pendingValidations, setPendingValidations] = useState<PendingValidation[]>([]);
  const [pastValidations, setPastValidations] = useState<PastValidation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const walletAddress = address as `0x${string}` | undefined;

  useEffect(() => {
    if (walletAddress) {
      loadValidations();
    } else {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const loadValidations = async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    try {
      const commitmentIds = await getValidatorCommitments(walletAddress);
      const pending: PendingValidation[] = [];
      const past: PastValidation[] = [];

      for (const id of commitmentIds) {
        const c = await getCommitment(id);
        if (!c) continue;

        if (c.status === ContractStatus.PendingValidation) {
          pending.push({
            id: id.toString(),
            commitment: c.description,
            committer: formatAddr(c.creator),
            committerAddress: c.creator,
            stakeAmount: formatAmountByToken(c.amount, c.token),
            currencySymbol: getCurrencySymbol(c.token),
            deadline: new Date(Number(c.deadline) * 1000).toISOString(),
            confirmedAt: new Date(Number(c.confirmationTime) * 1000).toISOString(),
            expiresAt: new Date(Number(c.validatorDeadline) * 1000).toISOString(),
            charity: formatAddr(c.charity),
          });
        } else if (c.status === ContractStatus.Resolved) {
          let savedTxHash: string | undefined;
          try {
            const fromStorage = window.localStorage.getItem(`validationTxHash:${id.toString()}`);
            if (fromStorage) savedTxHash = fromStorage;
          } catch {
            // ignore
          }
          past.push({
            id: id.toString(),
            commitment: c.description,
            committer: formatAddr(c.creator),
            stakeAmount: formatAmountByToken(c.amount, c.token),
            currencySymbol: getCurrencySymbol(c.token),
            outcome: c.outcome === CommitmentOutcome.Success ? "approved" : "rejected",
            resolvedAt: new Date().toISOString(),
            txHash: savedTxHash,
          });
        }
      }

      setPendingValidations(pending);
      setPastValidations(past);
    } catch (error) {
      console.error("Error loading validations:", error);
    }
    setIsLoading(false);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="brutal-card p-8 bg-white text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="brutal-card p-12 bg-white text-center max-w-md">
          <h1 className="text-3xl font-black mb-4">🔐 Login Required</h1>
          <p className="text-lg mb-6">Connect your wallet to see validations assigned to you.</p>
          <button
            onClick={() => connect()}
            className="brutal-btn bg-[var(--pink)] px-8 py-4 font-bold text-lg"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="brutal-btn inline-block bg-[var(--lavender)] px-4 py-2 text-sm font-bold mb-4">
            ⚖️ VALIDATOR PORTAL
          </div>
          <h1 className="text-4xl font-black tracking-tight mb-4">Pending Validations</h1>
          <p className="text-lg font-medium max-w-2xl">
            These people have named you as their validator. Your response determines whether they 
            get their money back or it goes to charity. <span className="text-[var(--danger)] font-bold">Silence counts as rejection.</span>
          </p>
        </div>

        {isLoading ? (
          <div className="brutal-card p-12 bg-white text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="font-bold">Loading validations...</p>
          </div>
        ) : (
          <>
        {/* Pending Validations */}
        <section className="mb-12">
          {pendingValidations.length === 0 ? (
            <div className="brutal-card p-12 text-center bg-white">
              <p className="text-[var(--muted)] font-medium">No pending validations</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingValidations.map((validation) => (
                <ValidationCard key={validation.id} validation={validation} onAction={loadValidations} />
              ))}
            </div>
          )}
        </section>

        {/* Past Validations */}
        <section>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <span className="bg-[var(--mint)] brutal-border px-3 py-1">Past</span>
            Validations
          </h2>
          
          {pastValidations.length === 0 ? (
            <div className="brutal-card p-12 text-center bg-white">
              <p className="text-[var(--muted)] font-medium">No past validations</p>
            </div>
          ) : (
            <div className="brutal-card bg-white overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b-[3px] border-black bg-[var(--background)]">
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest font-bold">
                      Commitment
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest font-bold">
                      Committer
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest font-bold">
                      Stake
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest font-bold">
                      Your Decision
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest font-bold">
                      Tx
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest font-bold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pastValidations.map((validation) => (
                    <tr key={validation.id} className="border-b-[2px] border-black last:border-b-0 hover:bg-[var(--background)]">
                      <td className="p-4 font-bold">{validation.commitment}</td>
                      <td className="p-4 font-medium">{validation.committer}</td>
                      <td className="p-4 font-mono font-bold">{validation.currencySymbol}{validation.stakeAmount}</td>
                      <td className="p-4">
                        <div className={`brutal-btn inline-flex px-3 py-1 items-center gap-2 ${
                          validation.outcome === "approved" ? "bg-[var(--mint)]" : "bg-[var(--danger)] text-white"
                        }`}>
                          {validation.outcome === "approved" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          <span className="text-sm font-bold capitalize">{validation.outcome}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {validation.txHash ? (
                          <a
                            href={getExplorerTxUrl(validation.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-xs hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {formatTxHash(validation.txHash)}
                          </a>
                        ) : (
                          <span className="font-mono text-xs text-[var(--muted)]">—</span>
                        )}
                      </td>
                      <td className="p-4 font-mono text-sm font-medium">
                        {formatDate(validation.resolvedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        </>
        )}


        {/* Info Section */}
        <section className="mt-12 bg-[var(--cyan)] brutal-border p-8">
          <h2 className="text-2xl font-black mb-6">How Validation Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="brutal-card p-6 bg-white">
              <div className="brutal-btn inline-block bg-[var(--pink)] px-3 py-1 text-xs font-bold mb-3">01</div>
              <h3 className="font-black text-lg mb-2">You Were Chosen</h3>
              <p className="text-sm">
                Someone trusted you enough to stake real money on your judgment.
              </p>
            </div>
            <div className="brutal-card p-6 bg-white">
              <div className="brutal-btn inline-block bg-[var(--yellow)] px-3 py-1 text-xs font-bold mb-3">02</div>
              <h3 className="font-black text-lg mb-2">24 Hour Window</h3>
              <p className="text-sm">
                You have 24 hours from when they confirm completion. After that, silence = rejection.
              </p>
            </div>
            <div className="brutal-card p-6 bg-white">
              <div className="brutal-btn inline-block bg-[var(--lavender)] px-3 py-1 text-xs font-bold mb-3">03</div>
              <h3 className="font-black text-lg mb-2">Be Honest</h3>
              <p className="text-sm">
                Your decision is final and on-chain. The system trusts your judgment completely.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
