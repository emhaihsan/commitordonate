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
   Define what you’ll do, set a deadline, choose stake (ETH or mockUSDC), pick a validator and a charity.

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

- **Frontend**: Next.js
- **Wallet & Auth**: Privy (social login) + RainbowKit
- **Smart Contracts**: Solidity (single escrow contract)
- **Time Logic**: `block.timestamp`
- **Assets**:
  - Native ETH
  - mockUSDC (self-deployed with in-app faucet)

No oracles. No automation services. No AI.

---

## Supported Chains

- **Arbitrum Sepolia**
- **Mantle Testnet**

Same codebase, same UX, separate deployments.

---

## Demo Instructions (Hackathon-Friendly)

1. Connect using social login (email / wallet via Privy)
2. Claim mockUSDC from the in-app faucet (optional)
3. Create a commitment with a short deadline
4. Stake ETH or mockUSDC
5. Skip validator confirmation to trigger **auto-donation**
6. Observe on-chain transaction sending funds to the charity address

Designed so judges can test **without risking real assets**.

---

## What This Project Does NOT Implement

To stay focused and shippable within a hackathon window, the following are **intentionally excluded**:

- ❌ AI agents or AI decision-making
- ❌ Dispute resolution or appeals
- ❌ Validator incentives or slashing
- ❌ Reputation systems or social graphs
- ❌ DAO governance or admin controls
- ❌ Automated reminders or off-chain cron jobs

This is a **minimal, opinionated MVP** — not a productivity platform.

---

## Why This Matters

Web3 doesn’t need more yield mechanics.  
It needs tools that change **human behavior**.

**Commit or Donate** uses blockchain for what it does best:
irreversible rules, transparent outcomes, and zero excuses.
