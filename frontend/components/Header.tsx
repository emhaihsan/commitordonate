"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { LogOut, Wallet, User, Copy, X, RefreshCw } from "lucide-react";
import { formatAddress, MOCKUSDC_ADDRESS, isETH, formatAmountByToken } from "@/lib/contracts";
import { createPublicClient, http } from "viem";
import { arbitrumSepoliaCustom } from "@/lib/contracts";
import MockUSDCABI from "@/lib/abis/MockUSDC.json";

export default function Header() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = wallets[0]?.address as `0x${string}` | undefined;
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [ethBalance, setEthBalance] = useState<bigint>(BigInt(0));
  const [usdcBalance, setUsdcBalance] = useState<bigint>(BigInt(0));
  const [loadingBalances, setLoadingBalances] = useState(false);
  const [copied, setCopied] = useState(false);

  const publicClient = createPublicClient({
    chain: arbitrumSepoliaCustom,
    transport: http(),
  });

  const loadBalances = async () => {
    if (!walletAddress) return;
    setLoadingBalances(true);
    try {
      const [ethBal, usdcBal] = await Promise.all([
        publicClient.getBalance({ address: walletAddress }),
        publicClient.readContract({
          address: MOCKUSDC_ADDRESS,
          abi: MockUSDCABI.abi,
          functionName: "balanceOf",
          args: [walletAddress],
        }),
      ]);
      setEthBalance(ethBal);
      setUsdcBalance(usdcBal as bigint);
    } catch (error) {
      console.error("Error loading balances:", error);
    } finally {
      setLoadingBalances(false);
    }
  };

  useEffect(() => {
    if (walletAddress && showWalletModal) {
      loadBalances();
    }
  }, [walletAddress, showWalletModal]);

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)] border-b-[3px] border-black">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="brutal-btn bg-[var(--yellow)] px-4 py-2 text-lg font-bold tracking-tight"
          >
            💀 COMMIT_OR_DONATE
          </Link>

          {!ready ? (
            <div className="brutal-btn bg-gray-200 px-4 py-2 text-sm font-bold animate-pulse">
              Loading...
            </div>
          ) : authenticated ? (
            <nav className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="brutal-btn bg-white px-4 py-2 text-sm font-bold hover:bg-[var(--cyan)]"
              >
                Dashboard
              </Link>
              <Link
                href="/validate"
                className="brutal-btn bg-white px-4 py-2 text-sm font-bold hover:bg-[var(--lavender)]"
              >
                Validate
              </Link>
              <Link
                href="/commit"
                className="brutal-btn bg-[var(--pink)] px-4 py-2 text-sm font-bold hover:bg-[var(--orange)]"
              >
                + New Commitment
              </Link>
              <div className="w-[2px] h-8 bg-black mx-1" />
              {walletAddress && (
                <button
                  onClick={() => setShowWalletModal(true)}
                  className="brutal-btn bg-[var(--mint)] px-3 py-2 text-xs font-bold flex items-center gap-2 hover:bg-[var(--cyan)] cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  {formatAddress(walletAddress)}
                </button>
              )}
              <button
                onClick={handleLogout}
                className="brutal-btn bg-white px-3 py-2 text-sm font-bold hover:bg-[var(--danger)] hover:text-white flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </nav>
          ) : (
            <button
              onClick={login}
              className="brutal-btn bg-[var(--pink)] px-6 py-3 text-sm font-bold hover:bg-[var(--orange)] flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Connect / Sign In
            </button>
          )}
        </div>
      </div>

      {/* Wallet Details Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50" onClick={() => setShowWalletModal(false)}>
          <div
            className="bg-white border-[3px] border-black p-6 max-w-md w-full mx-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black">Wallet Details</h2>
              <button
                onClick={() => setShowWalletModal(false)}
                className="brutal-btn bg-[var(--danger)] p-2 hover:bg-red-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Address */}
              <div className="brutal-card p-4 bg-[var(--yellow)]">
                <p className="text-xs font-bold uppercase tracking-widest mb-2">Wallet Address</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-mono text-sm break-all">{walletAddress}</p>
                  <button
                    onClick={handleCopyAddress}
                    className="brutal-btn bg-white p-2 hover:bg-[var(--cyan)] shrink-0"
                    title="Copy address"
                  >
                    {copied ? <Copy className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* ETH Balance */}
              <div className="brutal-card p-4 bg-[var(--cyan)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest">ETH Balance</p>
                  <button
                    onClick={loadBalances}
                    disabled={loadingBalances}
                    className="brutal-btn bg-white p-1 hover:bg-[var(--mint)]"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingBalances ? "animate-spin" : ""}`} />
                  </button>
                </div>
                <p className="text-2xl font-black font-mono">
                  {loadingBalances ? "..." : formatAmountByToken(ethBalance, "0x0000000000000000000000000000000000000000" as `0x${string}`)}
                </p>
              </div>

              {/* USDC Balance */}
              <div className="brutal-card p-4 bg-[var(--mint)]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest">USDC Balance</p>
                  <button
                    onClick={loadBalances}
                    disabled={loadingBalances}
                    className="brutal-btn bg-white p-1 hover:bg-[var(--cyan)]"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingBalances ? "animate-spin" : ""}`} />
                  </button>
                </div>
                <p className="text-2xl font-black font-mono">
                  {loadingBalances ? "..." : formatAmountByToken(usdcBalance, MOCKUSDC_ADDRESS)}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-black">
              <p className="text-xs text-gray-600 text-center">
                This is your embedded wallet address. Save it safely!
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
