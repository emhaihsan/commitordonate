"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Plus, Flame, Trophy, Skull, Loader2, ExternalLink, X } from "lucide-react";
import { useWeb3Auth, useWeb3AuthConnect } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { useCommitmentVault } from "@/lib/hooks/useContracts";
import { 
  CommitmentStatus as ContractStatus, 
  CommitmentOutcome,
  type Commitment as ContractCommitment,
  formatAddress,
  formatAmountByToken,
  getCurrencySymbol,
  isETH,
  MOCKUSDC_ADDRESS,
  getExplorerTxUrl,
  formatTxHash,
} from "@/lib/contracts";

type CommitmentStatus = "active" | "pending_confirmation" | "pending_validation" | "success" | "failed";

interface DisplayCommitment {
  id: string;
  commitment: string;
  deadline: string;
  stakeAmount: string;
  rawAmount: bigint;
  currencySymbol: string;
  token: `0x${string}`;
  status: CommitmentStatus;
  validator: string;
  charity: string;
  createdAt: string;
  confirmedAt?: string;
  resolvedAt?: string;
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

function mapContractCommitment(id: bigint, c: ContractCommitment): DisplayCommitment {
  return {
    id: id.toString(),
    commitment: c.description,
    deadline: new Date(Number(c.deadline) * 1000).toISOString(),
    stakeAmount: formatAmountByToken(c.amount, c.token),
    rawAmount: c.amount,
    currencySymbol: getCurrencySymbol(c.token),
    token: c.token,
    status: mapContractStatus(c.status, c.outcome),
    validator: formatAddress(c.validator),
    charity: formatAddress(c.charity),
    createdAt: new Date().toISOString(),
    confirmedAt: c.confirmationTime > 0 ? new Date(Number(c.confirmationTime) * 1000).toISOString() : undefined,
  };
}

const STATUS_CONFIG: Record<CommitmentStatus, { label: string; icon: React.ReactNode; bgColor: string; textColor: string }> = {
  active: {
    label: "Active",
    icon: <Flame className="w-4 h-4" />,
    bgColor: "bg-[var(--cyan)]",
    textColor: "text-black",
  },
  pending_confirmation: {
    label: "Confirm Required",
    icon: <AlertCircle className="w-4 h-4" />,
    bgColor: "bg-[var(--orange)]",
    textColor: "text-black",
  },
  pending_validation: {
    label: "Awaiting Validator",
    icon: <Clock className="w-4 h-4" />,
    bgColor: "bg-[var(--yellow)]",
    textColor: "text-black",
  },
  success: {
    label: "Success",
    icon: <Trophy className="w-4 h-4" />,
    bgColor: "bg-[var(--mint)]",
    textColor: "text-black",
  },
  failed: {
    label: "Failed",
    icon: <Skull className="w-4 h-4" />,
    bgColor: "bg-[var(--danger)]",
    textColor: "text-black",
  },
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeRemaining(deadline: string) {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  
  if (diff < 0) return "Expired";
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const { isInitialized, isConnected } = useWeb3Auth();
  const { connect } = useWeb3AuthConnect();
  const { address } = useAccount();
  const { getUserCommitments, getCommitment } = useCommitmentVault();

  const [commitments, setCommitments] = useState<DisplayCommitment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [createdTxHash, setCreatedTxHash] = useState<string | null>(null);

  // Check for commitment creation success from URL params
  useEffect(() => {
    const created = searchParams.get('created');
    const txHash = searchParams.get('txHash');
    if (created === 'true' && txHash) {
      setShowSuccessBanner(true);
      setCreatedTxHash(txHash);
      // Clear URL params after showing
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const walletAddress = address as `0x${string}` | undefined;

  useEffect(() => {
    if (walletAddress) {
      loadCommitments();
    } else {
      setIsLoading(false);
    }
  }, [walletAddress]);

  const loadCommitments = async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    try {
      const commitmentIds = await getUserCommitments(walletAddress);
      const loadedCommitments: DisplayCommitment[] = [];
      
      for (const id of commitmentIds) {
        const commitment = await getCommitment(id);
        if (commitment) {
          loadedCommitments.push(mapContractCommitment(id, commitment));
        }
      }
      
      setCommitments(loadedCommitments);
    } catch (error) {
      console.error("Error loading commitments:", error);
    }
    setIsLoading(false);
  };

  const activeCommitments = commitments.filter(
    (c) => c.status === "active" || c.status === "pending_confirmation" || c.status === "pending_validation"
  );
  const pastCommitments = commitments.filter(
    (c) => c.status === "success" || c.status === "failed"
  );

  // Calculate total staked amounts by currency
  const totalETH = activeCommitments
    .filter((c) => isETH(c.token))
    .reduce((sum, c) => sum + c.rawAmount, BigInt(0));
  const totalUSDC = activeCommitments
    .filter((c) => !isETH(c.token))
    .reduce((sum, c) => sum + c.rawAmount, BigInt(0));

  const ethDisplay = totalETH > BigInt(0) ? `Ξ${formatAmountByToken(totalETH, "0x0000000000000000000000000000000000000000")}` : "";
  const usdcDisplay = totalUSDC > BigInt(0) ? `$${formatAmountByToken(totalUSDC, MOCKUSDC_ADDRESS)}` : "";
  const stakeDisplay = [ethDisplay, usdcDisplay].filter(Boolean).join(" / ") || "0";

  const successCount = commitments.filter((c) => c.status === "success").length;
  const failedCount = commitments.filter((c) => c.status === "failed").length;

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
          <p className="text-lg mb-6">Connect your wallet to view your commitments.</p>
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
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Success Banner */}
        {showSuccessBanner && createdTxHash && (
          <div className="mb-6 brutal-card p-4 bg-green-100 border-2 border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-bold text-green-800">Commitment created successfully!</p>
                  <a
                    href={getExplorerTxUrl(createdTxHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm font-mono text-green-600 hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View on Arbiscan: {formatTxHash(createdTxHash)}
                  </a>
                </div>
              </div>
              <button
                onClick={() => setShowSuccessBanner(false)}
                className="p-1 hover:bg-green-200 rounded"
              >
                <X className="w-5 h-5 text-green-600" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="brutal-btn inline-block bg-[var(--cyan)] px-4 py-2 text-sm font-bold mb-4">
              📊 DASHBOARD
            </div>
            <h1 className="text-4xl font-black tracking-tight">Your Commitments</h1>
          </div>
          <Link
            href="/commit"
            className="brutal-btn bg-[var(--pink)] px-6 py-3 text-sm font-bold inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Commitment
          </Link>
        </div>

        {isLoading ? (
          <div className="brutal-card p-12 bg-white text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="font-bold">Loading your commitments...</p>
          </div>
        ) : (
          <>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="brutal-card p-6 bg-[var(--yellow)]">
            <p className="font-mono text-xs uppercase tracking-widest mb-2 font-bold">
              💰 At Stake
            </p>
            <p className="text-4xl font-black font-mono">{stakeDisplay}</p>
          </div>
          <div className="brutal-card p-6 bg-[var(--cyan)]">
            <p className="font-mono text-xs uppercase tracking-widest mb-2 font-bold">
              🔥 Active
            </p>
            <p className="text-4xl font-black font-mono">{activeCommitments.length}</p>
          </div>
          <div className="brutal-card p-6 bg-[var(--mint)]">
            <p className="font-mono text-xs uppercase tracking-widest mb-2 font-bold">
              🏆 Succeeded
            </p>
            <p className="text-4xl font-black font-mono">{successCount}</p>
          </div>
          <div className="brutal-card p-6 bg-[var(--danger)] text-black">
            <p className="font-mono text-xs uppercase tracking-widest mb-2 font-bold">
              💀 Failed
            </p>
            <p className="text-4xl font-black font-mono">{failedCount}</p>
          </div>
        </div>

        {/* Active Commitments */}
        <section className="mb-12">
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <span className="bg-[var(--orange)] brutal-border px-3 py-1">Active</span>
            Commitments
          </h2>
          
          {activeCommitments.length === 0 ? (
            <div className="brutal-card p-12 text-center bg-white">
              <p className="text-[var(--muted)] mb-4 font-medium">No active commitments</p>
              <Link
                href="/commit"
                className="brutal-btn bg-[var(--pink)] px-6 py-3 inline-flex items-center gap-2 font-bold"
              >
                Create your first commitment
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeCommitments.map((commitment) => {
                const statusConfig = STATUS_CONFIG[commitment.status];
                return (
                  <Link
                    key={commitment.id}
                    href={`/commitment/${commitment.id}`}
                    className="block brutal-card bg-white hover:-translate-y-1 transition-transform"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <p className="font-bold text-xl mb-1">{commitment.commitment}</p>
                          <p className="text-sm text-[var(--muted)] font-medium">
                            Created {formatDate(commitment.createdAt)}
                          </p>
                        </div>
                        <div className={`brutal-btn px-3 py-1 flex items-center gap-2 ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                          {statusConfig.icon}
                          <span className="text-sm font-bold">{statusConfig.label}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t-[3px] border-black">
                        <div>
                          <p className="font-mono text-xs text-[var(--muted)] mb-1 font-bold">STAKE</p>
                          <p className="font-mono font-black text-lg">{commitment.currencySymbol}{commitment.stakeAmount}</p>
                        </div>
                        <div>
                          <p className="font-mono text-xs text-[var(--muted)] mb-1 font-bold">DEADLINE</p>
                          <p className="font-mono font-bold">{formatDate(commitment.deadline)}</p>
                        </div>
                        <div>
                          <p className="font-mono text-xs text-[var(--muted)] mb-1 font-bold">TIME LEFT</p>
                          <p className="font-mono font-bold text-[var(--danger)]">{formatTimeRemaining(commitment.deadline)}</p>
                        </div>
                        <div>
                          <p className="font-mono text-xs text-[var(--muted)] mb-1 font-bold">VALIDATOR</p>
                          <p className="font-mono font-medium text-sm">{commitment.validator}</p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Past Commitments */}
        <section>
          <h2 className="text-2xl font-black mb-6 flex items-center gap-3">
            <span className="bg-[var(--lavender)] brutal-border px-3 py-1">Past</span>
            Commitments
          </h2>
          
          {pastCommitments.length === 0 ? (
            <div className="brutal-card p-12 text-center bg-white">
              <p className="text-[var(--muted)] font-medium">No past commitments yet</p>
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
                      Stake
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest font-bold">
                      Outcome
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest font-bold">
                      Resolved
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pastCommitments.map((commitment) => {
                    const statusConfig = STATUS_CONFIG[commitment.status];
                    return (
                      <tr key={commitment.id} className="border-b-[2px] border-black last:border-b-0 hover:bg-[var(--background)]">
                        <td className="p-4">
                          <Link
                            href={`/commitment/${commitment.id}`}
                            className="font-bold hover:underline"
                          >
                            {commitment.commitment}
                          </Link>
                        </td>
                        <td className="p-4 font-mono font-bold">{commitment.currencySymbol}{commitment.stakeAmount}</td>
                        <td className="p-4">
                          <div className={`brutal-btn inline-flex px-3 py-1 items-center gap-2 ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                            {statusConfig.icon}
                            <span className="text-sm font-bold">{statusConfig.label}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm font-medium">
                          {commitment.resolvedAt ? formatDate(commitment.resolvedAt) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
        </>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="brutal-card p-8 bg-white text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="font-bold">Loading dashboard...</p>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
