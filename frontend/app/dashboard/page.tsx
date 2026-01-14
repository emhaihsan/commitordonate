"use client";

import Link from "next/link";
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowRight, Plus } from "lucide-react";

type CommitmentStatus = "active" | "pending_confirmation" | "pending_validation" | "success" | "failed";

interface Commitment {
  id: string;
  commitment: string;
  deadline: string;
  stakeAmount: number;
  status: CommitmentStatus;
  validator: string;
  charity: string;
  createdAt: string;
  confirmedAt?: string;
  resolvedAt?: string;
}

const MOCK_COMMITMENTS: Commitment[] = [
  {
    id: "1",
    commitment: "Exercise every day for 30 days",
    deadline: "2024-02-15T23:59:00",
    stakeAmount: 100,
    status: "active",
    validator: "0x1234...5678",
    charity: "UNICEF",
    createdAt: "2024-01-15T10:00:00",
  },
  {
    id: "2",
    commitment: "Complete React course on Udemy",
    deadline: "2024-02-01T23:59:00",
    stakeAmount: 50,
    status: "pending_validation",
    validator: "0x2345...6789",
    charity: "Red Cross",
    createdAt: "2024-01-10T14:30:00",
    confirmedAt: "2024-02-01T20:00:00",
  },
  {
    id: "3",
    commitment: "Read 5 books this month",
    deadline: "2024-01-31T23:59:00",
    stakeAmount: 75,
    status: "success",
    validator: "0x3456...7890",
    charity: "Doctors Without Borders",
    createdAt: "2024-01-01T09:00:00",
    confirmedAt: "2024-01-30T18:00:00",
    resolvedAt: "2024-01-30T20:00:00",
  },
  {
    id: "4",
    commitment: "No social media for 2 weeks",
    deadline: "2024-01-20T23:59:00",
    stakeAmount: 200,
    status: "failed",
    validator: "0x4567...8901",
    charity: "UNICEF",
    createdAt: "2024-01-06T12:00:00",
    resolvedAt: "2024-01-21T00:00:00",
  },
];

const STATUS_CONFIG: Record<CommitmentStatus, { label: string; icon: React.ReactNode; color: string }> = {
  active: {
    label: "Active",
    icon: <Clock className="w-4 h-4" />,
    color: "text-foreground",
  },
  pending_confirmation: {
    label: "Confirm Required",
    icon: <AlertCircle className="w-4 h-4" />,
    color: "text-warning",
  },
  pending_validation: {
    label: "Awaiting Validator",
    icon: <Clock className="w-4 h-4" />,
    color: "text-warning",
  },
  success: {
    label: "Success",
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-success",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="w-4 h-4" />,
    color: "text-danger",
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

export default function DashboardPage() {
  const activeCommitments = MOCK_COMMITMENTS.filter(
    (c) => c.status === "active" || c.status === "pending_confirmation" || c.status === "pending_validation"
  );
  const pastCommitments = MOCK_COMMITMENTS.filter(
    (c) => c.status === "success" || c.status === "failed"
  );

  const totalStaked = activeCommitments.reduce((sum, c) => sum + c.stakeAmount, 0);
  const successCount = MOCK_COMMITMENTS.filter((c) => c.status === "success").length;
  const failedCount = MOCK_COMMITMENTS.filter((c) => c.status === "failed").length;

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
              Dashboard
            </p>
            <h1 className="text-3xl font-bold tracking-tight">Your Commitments</h1>
          </div>
          <Link
            href="/commit"
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Commitment
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border mb-12">
          <div className="bg-background p-6 border-r border-border">
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
              Currently at Stake
            </p>
            <p className="text-3xl font-bold font-mono">${totalStaked}</p>
          </div>
          <div className="bg-background p-6 border-r border-border">
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
              Active
            </p>
            <p className="text-3xl font-bold font-mono">{activeCommitments.length}</p>
          </div>
          <div className="bg-background p-6 border-r border-border">
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
              Succeeded
            </p>
            <p className="text-3xl font-bold font-mono text-success">{successCount}</p>
          </div>
          <div className="bg-background p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-muted mb-2">
              Failed
            </p>
            <p className="text-3xl font-bold font-mono text-danger">{failedCount}</p>
          </div>
        </div>

        {/* Active Commitments */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-border">
            Active Commitments
          </h2>
          
          {activeCommitments.length === 0 ? (
            <div className="border border-border p-12 text-center">
              <p className="text-muted mb-4">No active commitments</p>
              <Link
                href="/commit"
                className="inline-flex items-center gap-2 text-sm font-medium hover:text-muted transition-colors"
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
                    className="block border border-border hover:border-border-strong transition-colors"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <p className="font-medium text-lg mb-1">{commitment.commitment}</p>
                          <p className="text-sm text-muted">
                            Created {formatDate(commitment.createdAt)}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 ${statusConfig.color}`}>
                          {statusConfig.icon}
                          <span className="text-sm font-medium">{statusConfig.label}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
                        <div>
                          <p className="font-mono text-xs text-muted mb-1">STAKE</p>
                          <p className="font-mono font-medium">${commitment.stakeAmount}</p>
                        </div>
                        <div>
                          <p className="font-mono text-xs text-muted mb-1">DEADLINE</p>
                          <p className="font-mono font-medium">{formatDate(commitment.deadline)}</p>
                        </div>
                        <div>
                          <p className="font-mono text-xs text-muted mb-1">TIME LEFT</p>
                          <p className="font-mono font-medium">{formatTimeRemaining(commitment.deadline)}</p>
                        </div>
                        <div>
                          <p className="font-mono text-xs text-muted mb-1">VALIDATOR</p>
                          <p className="font-mono font-medium">{commitment.validator}</p>
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
          <h2 className="text-xl font-semibold mb-6 pb-4 border-b border-border">
            Past Commitments
          </h2>
          
          {pastCommitments.length === 0 ? (
            <div className="border border-border p-12 text-center">
              <p className="text-muted">No past commitments yet</p>
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
                      Stake
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-muted font-normal">
                      Outcome
                    </th>
                    <th className="text-left p-4 font-mono text-xs uppercase tracking-widest text-muted font-normal">
                      Resolved
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pastCommitments.map((commitment) => {
                    const statusConfig = STATUS_CONFIG[commitment.status];
                    return (
                      <tr key={commitment.id} className="border-b border-border last:border-b-0">
                        <td className="p-4">
                          <Link
                            href={`/commitment/${commitment.id}`}
                            className="hover:text-muted transition-colors"
                          >
                            {commitment.commitment}
                          </Link>
                        </td>
                        <td className="p-4 font-mono">${commitment.stakeAmount}</td>
                        <td className="p-4">
                          <div className={`flex items-center gap-2 ${statusConfig.color}`}>
                            {statusConfig.icon}
                            <span className="text-sm">{statusConfig.label}</span>
                          </div>
                        </td>
                        <td className="p-4 font-mono text-sm text-muted">
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
      </div>
    </div>
  );
}
