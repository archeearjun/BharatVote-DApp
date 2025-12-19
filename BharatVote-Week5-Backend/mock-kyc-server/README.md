# BharatVote Week 5 – Express Backend Server

This folder contains the **Express.js backend server** that provides KYC validation and Merkle proof generation APIs. This is the **Week 5 focus** - a production-ready backend microservice that bridges the KYC system with blockchain voting.

## 📦 What’s inside?

- `server.js` – Express server that exposes `/api/kyc` and `/api/merkle-proof`
- `kyc-data.json` – Mock voter → wallet mappings
- `package.json` – Local dependencies (Express, Merkle tree helpers, etc.)

## 🚀 How to run

Open a new terminal **inside this folder** and start the server:

```bash
cd BharatVote-Week3-Backend/mock-kyc-server
npm install      # first time only
npm start        # launches server.js on http://localhost:3001
```

Keep this terminal running while you demo the Week 3 frontend.

## 🔗 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/kyc?voter_id=VOTER1` | Returns `{ eligible, address }` for the given voter ID |
| `GET /api/merkle-proof?voter_id=VOTER1` | Returns `{ proof, merkleRoot }` for the voter’s address |

Both endpoints use data from `kyc-data.json` and the shared `eligibleVoters.json` file located in the repository root.

## ✅ Demo checklist

1. `npm run node` in `BharatVote-Week5-Backend/`
2. `npm run deploy` in `BharatVote-Week5-Backend/`
3. `npm start` in `BharatVote-Week5-Backend/mock-kyc-server/` (this is the Week 5 focus!)
4. `npm run dev` in `BharatVote-Week5-Frontend/`

This keeps every moving piece for Week 5 under the Week 5 folders, exactly as required for demonstrations.
