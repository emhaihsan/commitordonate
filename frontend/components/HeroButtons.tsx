"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useWeb3Auth, useWeb3AuthConnect } from "@web3auth/modal/react";

export default function HeroButtons() {
  const { isInitialized, isConnected } = useWeb3Auth();
  const { connect } = useWeb3AuthConnect();

  if (!isInitialized) {
    return (
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="brutal-btn bg-gray-200 px-8 py-4 text-lg font-bold animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => connect()}
          className="brutal-btn bg-[var(--pink)] px-8 py-4 text-lg font-bold inline-flex items-center gap-3"
        >
          Get Started
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Link
        href="/commit"
        className="brutal-btn bg-[var(--pink)] px-8 py-4 text-lg font-bold inline-flex items-center gap-3"
      >
        Create Commitment
        <ArrowRight className="w-5 h-5" />
      </Link>
      <Link
        href="/dashboard"
        className="brutal-btn bg-white px-8 py-4 text-lg font-bold inline-flex items-center gap-3"
      >
        View Dashboard
      </Link>
    </div>
  );
}
