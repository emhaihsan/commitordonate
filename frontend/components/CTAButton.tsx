"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePrivy } from "@privy-io/react-auth";

export default function CTAButton() {
  const { ready, authenticated, login } = usePrivy();

  if (!ready) {
    return (
      <div className="brutal-btn bg-black text-white px-10 py-5 text-xl font-bold animate-pulse">
        Loading...
      </div>
    );
  }

  if (!authenticated) {
    return (
      <button
        onClick={login}
        className="brutal-btn bg-black text-white px-10 py-5 text-xl font-bold inline-flex items-center gap-3"
      >
        Get Started Now
        <ArrowRight className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Link
      href="/commit"
      className="brutal-btn bg-black text-white px-10 py-5 text-xl font-bold inline-flex items-center gap-3"
    >
      Create Your First Commitment
      <ArrowRight className="w-6 h-6" />
    </Link>
  );
}
