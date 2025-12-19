# BharatVote Week 3 – Mock KYC Server

This folder contains the mock KYC + Merkle proof microservice used for **Week 3** demos. Keeping it inside `BharatVote-Week3-Backend/` ensures the entire Week 3 stack lives under the Week 3 directory, per the project structure rules.

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

1. `npm run node` in `BharatVote-Week3-Backend/`
2. `npm run deploy` in `BharatVote-Week3-Backend/`
3. `npm start` in `BharatVote-Week3-Backend/mock-kyc-server/`
4. `npm run dev` in `BharatVote-Week3-Frontend/`

This keeps every moving piece for Week 3 under the Week 3 folders, exactly as required for demonstrations.
