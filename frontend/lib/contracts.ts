import { arbitrumSepolia } from "viem/chains";
import CommitmentVaultABI from "./abis/CommitmentVault.json";
import MockUSDCABI from "./abis/MockUSDC.json";

export const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS as `0x${string}`;
export const MOCKUSDC_ADDRESS = process.env.NEXT_PUBLIC_MOCKUSDC_ADDRESS as `0x${string}`;

export const commitmentVaultConfig = {
  address: VAULT_ADDRESS,
  abi: CommitmentVaultABI.abi,
} as const;

export const mockUsdcConfig = {
  address: MOCKUSDC_ADDRESS,
  abi: MockUSDCABI.abi,
} as const;

export const SUPPORTED_CHAIN = arbitrumSepolia;

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
    name: "UNICEF",
    address: "0x1111111111111111111111111111111111111111" as `0x${string}`,
    description: "Supporting children worldwide",
  },
  {
    name: "Red Cross",
    address: "0x2222222222222222222222222222222222222222" as `0x${string}`,
    description: "Humanitarian aid organization",
  },
  {
    name: "Doctors Without Borders",
    address: "0x3333333333333333333333333333333333333333" as `0x${string}`,
    description: "Medical humanitarian organization",
  },
  {
    name: "World Wildlife Fund",
    address: "0x4444444444444444444444444444444444444444" as `0x${string}`,
    description: "Conservation organization",
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
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function parseAmount(amount: string, decimals: number = 6): bigint {
  const value = parseFloat(amount) * Math.pow(10, decimals);
  return BigInt(Math.floor(value));
}
