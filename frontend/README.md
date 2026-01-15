# Frontend (Next.js)

This folder contains the web app for **Commit or Donate**.

## Requirements

- Node.js 18+

## Environment

Create `frontend/.env.local` (see `frontend/.env.local.example`).

Minimum required:

- `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID`
- `NEXT_PUBLIC_VAULT_ADDRESS`
- `NEXT_PUBLIC_MOCKUSDC_ADDRESS`
- `NEXT_PUBLIC_CHAIN_ID=421614`
- `NEXT_PUBLIC_ARBITRUM_RPC_URL`

Deployed on Arbitrum Sepolia:

- `NEXT_PUBLIC_VAULT_ADDRESS=0x5e004185A592832B3FD3cdce364dA3bdf2B08A3d`
- `NEXT_PUBLIC_MOCKUSDC_ADDRESS=0x26bBaE72dab5EEa1f5d5178CF2d3d5E6Cf55D1e0`

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000
