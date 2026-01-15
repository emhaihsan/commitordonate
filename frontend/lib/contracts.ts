import { defineChain } from "viem";
import CommitmentVaultABI from "./abis/CommitmentVault.json";
import MockUSDCABI from "./abis/MockUSDC.json";

export const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;
export const MOCKUSDC_ADDRESS = process.env.NEXT_PUBLIC_MOCKUSDC_ADDRESS as `0x${string}`;

// CRITICAL: Always use Infura RPC, NEVER default public RPC
export const RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL || "https://arbitrum-sepolia.infura.io/v3/7e66544f0bb047c0aa8db93192af56e5";

// Custom Arbitrum Sepolia chain with OUR RPC URL - do NOT import from viem/chains
export const arbitrumSepoliaCustom = defineChain({
  id: 421614,
  name: "Arbitrum Sepolia",
  nativeCurrency: {
    name: "Arbitrum Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "Arbiscan",
      url: "https://sepolia.arbiscan.io",
    },
  },
  testnet: true,
});

export const commitmentVaultConfig = {
  address: VAULT_ADDRESS,
  abi: CommitmentVaultABI.abi,
} as const;

export const mockUsdcConfig = {
  address: MOCKUSDC_ADDRESS,
  abi: MockUSDCABI.abi,
} as const;

export const SUPPORTED_CHAIN = arbitrumSepoliaCustom;

// Helper to check if token is ETH (address(0))
export const isETH = (token: `0x${string}`): boolean => {
  return token === "0x0000000000000000000000000000000000000000";
};

export enum CommitmentStatus {
  Active = 0,
  PendingValidation = 1,
  Resolved = 2,
}

export enum CommitmentOutcome {
  None = 0,
  Success = 1,
  Failed = 2,
}

export interface Commitment {
  creator: `0x${string}`;
  validator: `0x${string}`;
  charity: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  deadline: bigint;
  confirmationTime: bigint;
  validatorDeadline: bigint;
  description: string;
  status: CommitmentStatus;
  outcome: CommitmentOutcome;
}

export const CHARITIES = [
  {
    name: "Developer",
    address: "0x694B4107ce4C7b14711E26C8bb7CB3795Cd8BD84" as `0x${string}`,
    description: "Supporting developers",
  },
  {
    name: "Custom Address",
    address: "0x0000000000000000000000000000000000000000" as `0x${string}`,
    description: "Enter your own charity address",
  },
];

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatAmount(amount: bigint, decimals: number = 6): string {
  const value = Number(amount) / Math.pow(10, decimals);
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: decimals > 6 ? 6 : 2 });
}

// Format amount based on token type (ETH = 18 decimals, USDC = 6 decimals)
export function formatAmountByToken(amount: bigint, token: `0x${string}`): string {
  const decimals = isETH(token) ? 18 : 6;
  const value = Number(amount) / Math.pow(10, decimals);
  if (isETH(token)) {
    return value.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 6 });
  }
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Get currency symbol based on token
export function getCurrencySymbol(token: `0x${string}`): string {
  return isETH(token) ? "Ξ" : "$";
}

export function parseAmount(amount: string, decimals: number = 6): bigint {
  const value = parseFloat(amount) * Math.pow(10, decimals);
  return BigInt(Math.floor(value));
}

// Explorer URL helpers for Arbitrum Sepolia
export const EXPLORER_URL = "https://sepolia.arbiscan.io";

export function getExplorerTxUrl(txHash: string): string {
  return `${EXPLORER_URL}/tx/${txHash}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${EXPLORER_URL}/address/${address}`;
}

export function formatTxHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}
