"use client";

import { useCallback, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type PublicClient,
  type WalletClient,
} from "viem";
import {
  commitmentVaultConfig,
  mockUsdcConfig,
  VAULT_ADDRESS,
  MOCKUSDC_ADDRESS,
  type Commitment,
  CommitmentStatus,
  CommitmentOutcome,
  arbitrumSepoliaCustom,
  RPC_URL,
} from "../contracts";

export function usePublicClient(): PublicClient {
  return createPublicClient({
    chain: arbitrumSepoliaCustom,
    transport: http(RPC_URL),
  });
}

export function useCommitmentVault() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);

  const getActiveAccount = useCallback((): `0x${string}` => {
    if (!authenticated || wallets.length === 0) {
      throw new Error("No wallet connected");
    }
    return wallets[0].address as `0x${string}`;
  }, [authenticated, wallets]);

  const getWalletClient = useCallback(async (): Promise<WalletClient | null> => {
    if (!authenticated || wallets.length === 0) return null;
    const wallet = wallets[0];
    await wallet.switchChain(arbitrumSepoliaCustom.id);
    const provider = await wallet.getEthereumProvider();

    // Use custom transport for signing, but with our custom chain RPC
    return createWalletClient({
      chain: arbitrumSepoliaCustom,
      transport: custom(provider),
      account: wallet.address as `0x${string}`,
    });
  }, [authenticated, wallets]);

  // Helper to send transaction via our RPC after signing with Privy
  const sendViaOurRpc = useCallback(async (
    signedTx: `0x${string}`
  ): Promise<`0x${string}`> => {
    const hash = await publicClient.sendRawTransaction({
      serializedTransaction: signedTx,
    });
    return hash;
  }, [publicClient]);

  const getCommitment = useCallback(
    async (commitmentId: bigint): Promise<Commitment | null> => {
      try {
        const result = await publicClient.readContract({
          ...commitmentVaultConfig,
          functionName: "getCommitment",
          args: [commitmentId],
        });
        return result as Commitment;
      } catch (error) {
        console.error("Error fetching commitment:", error);
        return null;
      }
    },
    [publicClient]
  );

  const getUserCommitments = useCallback(
    async (userAddress: `0x${string}`): Promise<bigint[]> => {
      try {
        const result = await publicClient.readContract({
          ...commitmentVaultConfig,
          functionName: "getUserCommitments",
          args: [userAddress],
        });
        return result as bigint[];
      } catch (error) {
        console.error("Error fetching user commitments:", error);
        return [];
      }
    },
    [publicClient]
  );

  const getValidatorCommitments = useCallback(
    async (validatorAddress: `0x${string}`): Promise<bigint[]> => {
      try {
        const result = await publicClient.readContract({
          ...commitmentVaultConfig,
          functionName: "getValidatorCommitments",
          args: [validatorAddress],
        });
        return result as bigint[];
      } catch (error) {
        console.error("Error fetching validator commitments:", error);
        return [];
      }
    },
    [publicClient]
  );

  const getCommitmentCounter = useCallback(async (): Promise<bigint> => {
    try {
      const result = await publicClient.readContract({
        ...commitmentVaultConfig,
        functionName: "commitmentCounter",
      });
      return result as bigint;
    } catch (error) {
      console.error("Error fetching commitment counter:", error);
      return BigInt(0);
    }
  }, [publicClient]);

  const createCommitmentToken = useCallback(
    async (
      validator: `0x${string}`,
      charity: `0x${string}`,
      token: `0x${string}`,
      amount: bigint,
      deadline: bigint,
      description: string
    ): Promise<bigint | null> => {
      setIsLoading(true);
      try {
        const walletClient = await getWalletClient();
        if (!walletClient) throw new Error("No wallet connected");
        const account = getActiveAccount();

        const hash = await walletClient.writeContract({
          ...commitmentVaultConfig,
          functionName: "createCommitmentToken",
          args: [validator, charity, token, amount, deadline, description],
          chain: arbitrumSepoliaCustom,
          account,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        
        const counter = await getCommitmentCounter();
        setIsLoading(false);
        return counter;
      } catch (error) {
        console.error("Error creating commitment:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [getWalletClient, getActiveAccount, publicClient, getCommitmentCounter]
  );

  const createCommitmentETH = useCallback(
    async (
      validator: `0x${string}`,
      charity: `0x${string}`,
      deadline: bigint,
      description: string,
      amount: bigint
    ): Promise<bigint | null> => {
      setIsLoading(true);
      try {
        const walletClient = await getWalletClient();
        if (!walletClient) throw new Error("No wallet connected");
        const account = getActiveAccount();

        const hash = await walletClient.writeContract({
          ...commitmentVaultConfig,
          functionName: "createCommitmentETH",
          args: [validator, charity, deadline, description],
          value: amount,
          chain: arbitrumSepoliaCustom,
          account,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        
        const counter = await getCommitmentCounter();
        setIsLoading(false);
        return counter;
      } catch (error) {
        console.error("Error creating commitment with ETH:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [getWalletClient, getActiveAccount, publicClient, getCommitmentCounter]
  );

  const confirmCompletion = useCallback(
    async (commitmentId: bigint): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Must be called by commitment creator - use user wallet
        const walletClient = await getWalletClient();
        if (!walletClient) throw new Error("No wallet connected");
        const account = getActiveAccount();

        const hash = await walletClient.writeContract({
          ...commitmentVaultConfig,
          functionName: "confirmCompletion",
          args: [commitmentId],
          chain: arbitrumSepoliaCustom,
          account,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error("Error confirming completion:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [getWalletClient, getActiveAccount, publicClient]
  );

  const approve = useCallback(
    async (commitmentId: bigint): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Must be called by validator - use user wallet
        const walletClient = await getWalletClient();
        if (!walletClient) throw new Error("No wallet connected");
        const account = getActiveAccount();

        const hash = await walletClient.writeContract({
          ...commitmentVaultConfig,
          functionName: "approve",
          args: [commitmentId],
          chain: arbitrumSepoliaCustom,
          account,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error("Error approving commitment:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [getWalletClient, getActiveAccount, publicClient]
  );

  const reject = useCallback(
    async (commitmentId: bigint): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Must be called by validator - use user wallet
        const walletClient = await getWalletClient();
        if (!walletClient) throw new Error("No wallet connected");
        const account = getActiveAccount();

        const hash = await walletClient.writeContract({
          ...commitmentVaultConfig,
          functionName: "reject",
          args: [commitmentId],
          chain: arbitrumSepoliaCustom,
          account,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error("Error rejecting commitment:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [getWalletClient, getActiveAccount, publicClient]
  );

  const resolveExpired = useCallback(
    async (commitmentId: bigint): Promise<boolean> => {
      setIsLoading(true);
      try {
        const walletClient = await getWalletClient();
        if (!walletClient) throw new Error("No wallet connected");
        const account = getActiveAccount();

        const hash = await walletClient.writeContract({
          ...commitmentVaultConfig,
          functionName: "resolveExpired",
          args: [commitmentId],
          chain: arbitrumSepoliaCustom,
          account,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error("Error resolving expired commitment:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [getWalletClient, getActiveAccount, publicClient]
  );

  return {
    isLoading,
    getCommitment,
    getUserCommitments,
    getValidatorCommitments,
    getCommitmentCounter,
    createCommitmentToken,
    createCommitmentETH,
    confirmCompletion,
    approve,
    reject,
    resolveExpired,
  };
}

export function useMockUSDC() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);

  const getActiveAccount = useCallback((): `0x${string}` => {
    if (!authenticated || wallets.length === 0) {
      throw new Error("No wallet connected");
    }
    return wallets[0].address as `0x${string}`;
  }, [authenticated, wallets]);

  const getWalletClient = useCallback(async (): Promise<WalletClient | null> => {
    if (!authenticated || wallets.length === 0) return null;
    const wallet = wallets[0];
    await wallet.switchChain(arbitrumSepoliaCustom.id);
    const provider = await wallet.getEthereumProvider();
    return createWalletClient({
      chain: arbitrumSepoliaCustom,
      transport: custom(provider),
      account: wallet.address as `0x${string}`,
    });
  }, [authenticated, wallets]);

  const getBalance = useCallback(
    async (address: `0x${string}`): Promise<bigint> => {
      try {
        const result = await publicClient.readContract({
          ...mockUsdcConfig,
          functionName: "balanceOf",
          args: [address],
        });
        return result as bigint;
      } catch (error) {
        console.error("Error fetching balance:", error);
        return BigInt(0);
      }
    },
    [publicClient]
  );

  const getAllowance = useCallback(
    async (owner: `0x${string}`, spender: `0x${string}`): Promise<bigint> => {
      try {
        const result = await publicClient.readContract({
          ...mockUsdcConfig,
          functionName: "allowance",
          args: [owner, spender],
        });
        return result as bigint;
      } catch (error) {
        console.error("Error fetching allowance:", error);
        return BigInt(0);
      }
    },
    [publicClient]
  );

  const approveToken = useCallback(
    async (spender: `0x${string}`, amount: bigint): Promise<boolean> => {
      setIsLoading(true);
      try {
        const walletClient = await getWalletClient();
        if (!walletClient) throw new Error("No wallet connected");
        const account = getActiveAccount();

        const hash = await walletClient.writeContract({
          ...mockUsdcConfig,
          functionName: "approve",
          args: [spender, amount],
          chain: arbitrumSepoliaCustom,
          account,
        });

        await publicClient.waitForTransactionReceipt({ hash });
        setIsLoading(false);
        return true;
      } catch (error) {
        console.error("Error approving token:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [getWalletClient, publicClient]
  );

  const faucet = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (!authenticated || wallets.length === 0) throw new Error("No wallet connected");
      const userAddress = wallets[0].address;

      // Try sponsored faucet first (gasless)
      const response = await fetch("/api/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "faucet",
          userAddress,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // If sponsor fails, fall back to user-signed transaction
        const walletClient = await getWalletClient();
        if (!walletClient) throw new Error("No wallet connected");
        const account = getActiveAccount();

        const hash = await walletClient.writeContract({
          ...mockUsdcConfig,
          functionName: "faucet",
          chain: arbitrumSepoliaCustom,
          account,
        });

        await publicClient.waitForTransactionReceipt({ hash });
      }

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error claiming from faucet:", error);
      setIsLoading(false);
      throw error;
    }
  }, [authenticated, wallets, getWalletClient, publicClient]);

  return {
    isLoading,
    getBalance,
    getAllowance,
    approveToken,
    faucet,
    VAULT_ADDRESS,
  };
}
