# BharatVote

BharatVote is a blockchain voting app with commit-reveal privacy, Merkle-based voter eligibility, and public results tracking.

## Stack

- Smart contracts: Solidity + Hardhat
- Frontend: React + Vite
- Backend: Node.js + Express
- Wallet/network: MetaMask on Sepolia

## Live Deployment

- Frontend: `https://bharat-vote-d-app.vercel.app/`
- Backend: `https://bharatvote-backend.onrender.com`

## How To Use (Hosted)

### Demo Election Mode

1. Open `https://bharat-vote-d-app.vercel.app/`.
2. Click `Join Demo Election`.
3. Connect MetaMask and switch to Sepolia.
4. During Commit phase, submit your vote hash using candidate + secret salt.
5. During Reveal phase, reveal using the same candidate + same salt.
6. View live results in the Public Results section.

### Main Election Mode

1. Open `https://bharat-vote-d-app.vercel.app/`.
2. Connect MetaMask on Sepolia.
3. Admin sets candidates, voter allowlist (Merkle), and phase windows.
4. Voters commit in Commit phase and reveal in Reveal phase.
5. Admin finalizes and verifies final tally.

## Local Setup

### Prerequisites

- Node.js 18+
- npm
- MetaMask

### Install

```bash
npm run install:all
```

### Environment

Create root `.env`:

```bash
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/<key>
PRIVATE_KEY=<admin_private_key>
VITE_DEMO_ELECTION_ADDRESS=<demo_election_address>
```

Create `frontend/.env.local`:

```bash
VITE_BACKEND_URL=http://localhost:3000
VITE_CHAIN_ID=31337
VITE_ENV=local
VITE_PUBLIC_EVENTS_FROM_BLOCK=9000000
VITE_PUBLIC_EVENTS_MAX_REQUESTS_PER_POLL=12
VITE_PUBLIC_EVENTS_MAX_BLOCK_RANGE=1000
```

### Run Locally

Start in 4 terminals from project root:

1. `npm run node`
2. `npm run deploy`
3. `npm run backend:dev`
4. `npm run frontend:dev`

Local endpoints:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- Hardhat RPC: `http://127.0.0.1:8545`

## Test Commands

From project root:

```bash
npm run test:contracts
npm run test:backend
npm run test:frontend
npm run test:e2e
npm test
```

Coverage:

```bash
npm run test:coverage
```

## Core API Endpoints

Base URL: `https://bharatvote-backend.onrender.com`

- `GET /api/kyc?voter_id=<id>&electionAddress=<addr>&address=<wallet>`
- `GET /api/merkle-root?electionAddress=<addr>`
- `GET /api/merkle-proof/<wallet>?electionAddress=<addr>`
- `POST /api/admin/voter-list`
- `GET /api/admin/voter-list/<electionAddress>`
- `GET /api/demo/status`
- `GET /api/demo/analytics`
- `POST /api/demo/tick`
- `POST /api/join`
