"use client";

import { useCallback, useState } from "react";
import { useAccount, useWalletClient as useWagmiWalletClient } from "wagmi";
import {
  createPublicClient,
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
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWagmiWalletClient();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);

  const getActiveAccount = useCallback((): `0x${string}` => {
    if (!isConnected || !address) {
      throw new Error("No wallet connected");
    }
    return address;
  }, [isConnected, address]);

  const getWalletClient = useCallback(async (): Promise<WalletClient | null> => {
    if (!isConnected || !walletClient) return null;
    return walletClient as WalletClient;
  }, [isConnected, walletClient]);

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
    ): Promise<{ commitmentId: bigint; txHash: string } | null> => {
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

        await publicClient.waitForTransactionReceipt({ hash });
        
        const counter = await getCommitmentCounter();
        setIsLoading(false);
        return { commitmentId: counter, txHash: hash };
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
    ): Promise<{ commitmentId: bigint; txHash: string } | null> => {
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

        await publicClient.waitForTransactionReceipt({ hash });
        
        const counter = await getCommitmentCounter();
        setIsLoading(false);
        return { commitmentId: counter, txHash: hash };
      } catch (error) {
        console.error("Error creating commitment with ETH:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [getWalletClient, getActiveAccount, publicClient, getCommitmentCounter]
  );

  const confirmCompletion = useCallback(
    async (commitmentId: bigint): Promise<{ success: boolean; txHash: string }> => {
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
        return { success: true, txHash: hash };
      } catch (error) {
        console.error("Error confirming completion:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [getWalletClient, getActiveAccount, publicClient]
  );

  const approve = useCallback(
    async (commitmentId: bigint): Promise<{ success: boolean; txHash: string }> => {
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
        return { success: true, txHash: hash };
      } catch (error) {
        console.error("Error approving commitment:", error);
        setIsLoading(false);
        throw error;
      }
    },
    [getWalletClient, getActiveAccount, publicClient]
  );

  const reject = useCallback(
    async (commitmentId: bigint): Promise<{ success: boolean; txHash: string }> => {
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
        return { success: true, txHash: hash };
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
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWagmiWalletClient();
  const publicClient = usePublicClient();
  const [isLoading, setIsLoading] = useState(false);

  const getActiveAccount = useCallback((): `0x${string}` => {
    if (!isConnected || !address) {
      throw new Error("No wallet connected");
    }
    return address;
  }, [isConnected, address]);

  const getWalletClient = useCallback(async (): Promise<WalletClient | null> => {
    if (!isConnected || !walletClient) return null;
    return walletClient as WalletClient;
  }, [isConnected, walletClient]);

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

  const faucet = useCallback(async (): Promise<{ success: boolean; txHash: string }> => {
    setIsLoading(true);
    try {
      if (!isConnected || !address) throw new Error("No wallet connected");

      // Try sponsored faucet first (gasless)
      const response = await fetch("/api/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "faucet",
          userAddress: address,
        }),
      });

      const result = await response.json();

      if (response.ok && result.hash) {
        setIsLoading(false);
        return { success: true, txHash: result.hash };
      }

      // If sponsor fails, fall back to user-signed transaction
      const wc = await getWalletClient();
      if (!wc) throw new Error("No wallet connected");
      const account = getActiveAccount();

      const hash = await wc.writeContract({
        ...mockUsdcConfig,
        functionName: "faucet",
        chain: arbitrumSepoliaCustom,
        account,
      });

      await publicClient.waitForTransactionReceipt({ hash });
      setIsLoading(false);
      return { success: true, txHash: hash };
    } catch (error) {
      console.error("Error claiming from faucet:", error);
      setIsLoading(false);
      throw error;
    }
  }, [isConnected, address, getWalletClient, publicClient, getActiveAccount]);

  return {
    isLoading,
    getBalance,
    getAllowance,
    approveToken,
    faucet,
    VAULT_ADDRESS,
  };
}
