"use client";

import { Web3AuthProvider } from "@web3auth/modal/react";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createConfig, http } from "wagmi";
import web3AuthContextConfig from "./web3authConfig";
import { arbitrumSepoliaCustom, RPC_URL } from "./contracts";

const queryClient = new QueryClient();

// Wagmi config with Arbitrum Sepolia
const wagmiConfig = createConfig({
  chains: [arbitrumSepoliaCustom],
  transports: {
    [arbitrumSepoliaCustom.id]: http(RPC_URL),
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          {children}
        </WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}
