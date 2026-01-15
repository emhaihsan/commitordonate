import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { arbitrumSepolia } from "viem/chains";
import CommitmentVaultABI from "@/lib/abis/CommitmentVault.json";
import MockUSDCABI from "@/lib/abis/MockUSDC.json";

const RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://sepolia-rollup.arbitrum.io/rpc";
const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PRIVATE_KEY;
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;
const MOCKUSDC_ADDRESS = process.env.NEXT_PUBLIC_MOCKUSDC_ADDRESS as `0x${string}`;

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(RPC_URL),
});

function getSponsorWalletClient() {
  if (!SPONSOR_PRIVATE_KEY) {
    throw new Error("SPONSOR_PRIVATE_KEY not configured");
  }
  const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY as `0x${string}`);
  return createWalletClient({
    account,
    chain: arbitrumSepolia,
    transport: http(RPC_URL),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, params, userAddress } = body;

    if (!SPONSOR_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Gas sponsorship not configured. Please set SPONSOR_PRIVATE_KEY." },
        { status: 500 }
      );
    }

    const walletClient = getSponsorWalletClient();
    let hash: `0x${string}`;

    switch (action) {
      case "faucet": {
        const data = encodeFunctionData({
          abi: MockUSDCABI.abi,
          functionName: "mint",
          args: [userAddress, BigInt(1000) * BigInt(10 ** 6)], // 1000 USDC
        });

        hash = await walletClient.sendTransaction({
          to: MOCKUSDC_ADDRESS,
          data,
        });
        break;
      }

      case "approve": {
        // For approve, we need the user to sign - can't sponsor this
        // Return error indicating user must approve
        return NextResponse.json(
          { error: "Token approval must be signed by user", requiresUserSignature: true },
          { status: 400 }
        );
      }

      case "createCommitment": {
        // For creating commitment, user must sign as they're the creator
        return NextResponse.json(
          { error: "Commitment creation must be signed by user", requiresUserSignature: true },
          { status: 400 }
        );
      }

      case "confirmCompletion": {
        // User must sign as they're confirming their own commitment
        return NextResponse.json(
          { error: "Confirmation must be signed by user", requiresUserSignature: true },
          { status: 400 }
        );
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // Wait for transaction
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      success: true,
      hash,
      receipt: {
        status: receipt.status,
        blockNumber: receipt.blockNumber.toString(),
      },
    });
  } catch (error: any) {
    console.error("Sponsor API error:", error);
    return NextResponse.json(
      { error: error.message || "Transaction failed" },
      { status: 500 }
    );
  }
}
