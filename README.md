# Commit or Donate

**A personal commitment app where failure has consequences: you either keep your promise, or your money goes to a good cause.**

---

## The Problem (in human terms)

Most people don’t fail their goals because they’re lazy — they fail because there is **no real consequence**.  
New Year resolutions, workout plans, learning goals… all abandoned quietly, with zero cost.

Discipline without consequence is just intention theater.

---

## The Solution

**Commit or Donate** introduces *skin in the game*.

You make a personal commitment, stake real value, and assign a human validator.  
If you succeed, you get your money back.  
If you fail — intentionally or by neglect — your stake is **automatically donated**.

No excuses. No retries. No mercy.

---

## How It Works (Simple 5-Step Flow)

1. **Create a commitment**  
   Define what you’ll do, set a deadline, choose stake (MNT or mockUSDC), pick a validator and a charity.

2. **Stake funds**  
   Your funds are locked in a smart contract escrow.

3. **User confirmation**  
   Before the deadline, you confirm that you’ve completed the commitment.

4. **Validator confirmation (24h window)**  
   The validator either confirms or ignores the request.

5. **Outcome**
   - Validator confirms → **Funds refunded**
   - Validator rejects or stays silent → **Funds auto-donated**

Validator always wins. Silence counts as failure.

---

## Tech Stack

- **Frontend**: Next.js (App Router) + TypeScript + Tailwind
- **Wallet & Auth**: Web3Auth (social login) + wagmi + viem
- **Smart Contracts**: Solidity (CommitmentVault + MockUSDC)
- **Time Logic**: `block.timestamp`
- **Assets**:
  - Native MNT (Mantle Token)
  - mockUSDC (self-deployed with in-app faucet)

No oracles. No automation services. No AI.

---

## Supported Chains

- **Mantle Sepolia (Chain ID: 5003)**

## Deployed Contracts (Mantle Sepolia)

| Contract | Address | Explorer |
|---|---|---|
| CommitmentVault | `0x5e004185A592832B3FD3cdce364dA3bdf2B08A3d` | https://sepolia.mantlescan.xyz/address/0x5e004185A592832B3FD3cdce364dA3bdf2B08A3d |
| MockUSDC | `0x26bBaE72dab5EEa1f5d5178CF2d3d5E6Cf55D1e0` | https://sepolia.mantlescan.xyz/address/0x26bBaE72dab5EEa1f5d5178CF2d3d5E6Cf55D1e0 |


## Why This Matters

Web3 doesn’t need more yield mechanics.  
It needs tools that change **human behavior**.

**Commit or Donate** uses blockchain for what it does best:
irreversible rules, transparent outcomes, and zero excuses.
