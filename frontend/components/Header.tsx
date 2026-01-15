"use client";

import Link from "next/link";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { LogOut, Wallet, User } from "lucide-react";
import { formatAddress } from "@/lib/contracts";

export default function Header() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = wallets[0]?.address as `0x${string}` | undefined;

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
                <div className="brutal-btn bg-[var(--mint)] px-3 py-2 text-xs font-bold flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  {formatAddress(walletAddress)}
                </div>
              )}
              <button
                onClick={logout}
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
    </header>
  );
}
