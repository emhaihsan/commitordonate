"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { arbitrumSepoliaCustom } from "./contracts";

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
        defaultChain: arbitrumSepoliaCustom,
        supportedChains: [arbitrumSepoliaCustom],
      }}
    >
      {children}
    </PrivyProvider>
  );
}
