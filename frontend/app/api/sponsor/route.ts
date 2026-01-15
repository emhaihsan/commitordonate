import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, encodeFunctionData } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import MockUSDCABI from "@/lib/abis/MockUSDC.json";
import { arbitrumSepoliaCustom, RPC_URL, MOCKUSDC_ADDRESS } from "@/lib/contracts";

const SPONSOR_PRIVATE_KEY = process.env.SPONSOR_PRIVATE_KEY;

const publicClient = createPublicClient({
  chain: arbitrumSepoliaCustom,
  transport: http(RPC_URL),
});

function getSponsorWalletClient() {
  if (!SPONSOR_PRIVATE_KEY) {
    throw new Error("SPONSOR_PRIVATE_KEY not configured");
  }
  const account = privateKeyToAccount(SPONSOR_PRIVATE_KEY as `0x${string}`);
  return createWalletClient({
    account,
    chain: arbitrumSepoliaCustom,
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

    // Only faucet is supported for gasless transactions
    // Other actions (confirmCompletion, approve, reject) require user signature
    // because contract enforces msg.sender to be creator/validator
    
    if (action !== "faucet") {
      return NextResponse.json(
        { error: `Action '${action}' is not supported. Only 'faucet' can be gasless.` },
        { status: 400 }
      );
    }

    // Faucet: Mint test USDC to user address
    const data = encodeFunctionData({
      abi: MockUSDCABI.abi,
      functionName: "mint",
      args: [userAddress, BigInt(1000) * BigInt(10 ** 6)], // 1000 USDC
    });

    const hash = await walletClient.sendTransaction({
      to: MOCKUSDC_ADDRESS,
      data,
    });

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
