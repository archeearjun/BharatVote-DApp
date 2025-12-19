## Testnet Deployment (Free: Uses Faucet Funds Only)

This guide pushes the full BharatVote stack to a public testnet using **free faucet ETH/MATIC**. No real money is required—just do **not** point to mainnet and only fund your test account with faucet tokens.

### 0) Prereqs
- Node + npm installed.
- MetaMask test account (no real funds).
- Hardhat & scripts already in repo.
- Pick a testnet: **Sepolia (ETH)** or **Mumbai (Polygon)**.

### 1) Get Free Testnet Funds
- Sepolia: use any free faucet (Alchemy, Infura, sepoliafaucet.com). Fund the MetaMask account you’ll deploy from.
- Mumbai: use Polygon faucet (MATIC, free).

### 2) Configure Environment (root `.env`)
Create `.env` at repo root using the template below:
```
# RPC endpoints
SEPOLIA_URL=https://sepolia.infura.io/v3/<PROJECT_ID>
MUMBAI_URL=https://polygon-mumbai.infura.io/v3/<PROJECT_ID>

# Deployer key (TEST ACCOUNT ONLY)
PRIVATE_KEY=<YOUR_TESTNET_PRIVATE_KEY>

# Optional: explorer verification
ETHERSCAN_API_KEY=<IF_VERIFY_ON_SEPOLIA>
POLYGONSCAN_API_KEY=<IF_VERIFY_ON_MUMBAI>

# Optional: IPFS (Pinata) for server-with-ipfs.js
PINATA_API_KEY=
PINATA_SECRET_KEY=
```
**Never use a mainnet-funded key.**

### 3) Deploy Contracts to Testnet
From repo root:
```
npx hardhat compile
npx hardhat run scripts/deploy.ts --network sepolia   # or --network mumbai
# Optional verify (needs explorer API key):
# npx hardhat verify --network sepolia <DEPLOYED_ADDRESS>
```
The deploy script will also write `frontend/src/contracts/BharatVote.json` with address + ABI.

### 4) Wire the Frontend(s) to Testnet
Set Vite env (for both `frontend/` and `BharatVote-Week8-Frontend/`):
```
VITE_CHAIN_ID=11155111         # Sepolia (or 80001 for Mumbai)
VITE_RPC_URL=https://sepolia.infura.io/v3/<PROJECT_ID>  # optional direct RPC
```
Copy the generated contract artifact to Week 8 demo:
```
copy frontend\\src\\contracts\\BharatVote.json BharatVote-Week8-Frontend\\src\\contracts\\BharatVote.json
```
Then run the dapp (example for main frontend):
```
cd frontend
npm install
npm run dev
```
(Repeat in `BharatVote-Week8-Frontend` if presenting the staged copy.)

### 5) Backend (API + Merkle proof)
```
cd backend
npm install
npm start   # serves /api/kyc, /api/merkle-proof, /api/merkle-root
```
If using IPFS features, export Pinata keys in `.env` and run `server-with-ipfs.js`.

### 6) Set Merkle Root On-Chain (if not done by deploy)
The deploy script already sets it. If you need to re-set:
```
npx hardhat run scripts/set-merkle-root.ts --network sepolia
```
It reads `eligibleVoters.json` and updates the contract.

### 7) Test Interactions
- MetaMask: switch network to Sepolia (11155111) or Mumbai (80001).
- Connect wallet, run commit/reveal flow using proofs from `/api/merkle-proof`.

### 8) Safety Checklist (no real money)
- Use only faucet-funded accounts.
- Ensure chainId is 11155111 or 80001, never 1.
- Do **not** add a mainnet RPC URL in `.env`.


