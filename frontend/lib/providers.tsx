"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { arbitrumSepolia } from "viem/chains";
import { addRpcUrlOverrideToChain } from "@privy-io/chains";

const RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";

// Override Arbitrum Sepolia RPC with custom Alchemy endpoint
const arbitrumSepoliaWithCustomRpc = addRpcUrlOverrideToChain(arbitrumSepolia, RPC_URL);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ""}
      config={{
        appearance: {
          theme: "light",
          accentColor: "#FF6B9D",
          logo: "https://your-logo-url.com/logo.png",
          showWalletLoginFirst: false,
        },
        loginMethods: ["email", "wallet", "google"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
        defaultChain: arbitrumSepoliaWithCustomRpc,
        supportedChains: [arbitrumSepoliaWithCustomRpc],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
