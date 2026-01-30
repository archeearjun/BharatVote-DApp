# BharatVote – Capstone Project Report (Final Product)

> Replace all fields in **[square brackets]** before exporting to PDF.  
> Formatting (Word/Docs): Times New Roman, 12 body, 14 headings, 1.5 spacing, 1-inch margins, page numbers bottom-center.

---

## COVER PAGE

**Project Title:** BharatVote – Decentralized Digital Voting Platform (Commit–Reveal + Merkle Eligibility)  
**Student Name(s) & Roll Number(s):** [Name 1 – Roll No], [Name 2 – Roll No]  
**Program:** BSc Computer Science (Online Mode)  
**Institution Name:** [Institution Name]  
**Academic Year:** [YYYY–YYYY]  
**Internal Supervisor Name:** [Supervisor Name]

---

## DECLARATION

I hereby declare that this capstone project titled **“BharatVote – Decentralized Digital Voting Platform (Commit–Reveal + Merkle Eligibility)”** is an original work carried out by me/us and has not been submitted to any other university or institution for the award of any degree.

**Student Signature(s):** ____________________  
**Date:** ____________________

---

## ABSTRACT (200–300 words)

BharatVote is a decentralized digital voting platform built as a web-based DApp to demonstrate secure, verifiable elections using blockchain and applied cryptography. The project addresses key issues found in traditional electronic voting systems such as centralized trust, weak auditability, and the risk of vote tampering, while also preserving voter privacy during the voting period. BharatVote implements an on-chain election lifecycle and vote counting using Ethereum smart contracts, with a commit–reveal voting scheme to keep votes hidden during the Commit phase and verifiable during the Reveal phase.  

Voter eligibility is enforced using Merkle proof verification: eligible wallet addresses are hashed into a Merkle tree off-chain and the Merkle root is stored on-chain, enabling trustless eligibility checks with minimal on-chain storage. The application provides an Admin interface for creating elections and managing candidates/phases, and a Voter interface for committing and later revealing votes using the same secret salt. A results module displays live and final tallies; for the public demo deployment it also supports “all-time” participation analytics by scanning on-chain events through a public RPC endpoint.  

The final product is deployed as a cloud demo on **Sepolia (testnet)** using an **Alchemy RPC** connection, with the **frontend hosted on Vercel** and the **backend hosted on Render**. The system includes a dedicated “Demo Election” contract and a backend-assisted onboarding flow (`/api/join`) that can (a) add new demo participants into the Merkle allowlist, (b) synchronize the updated Merkle root on-chain, and (c) optionally provide testnet gas funding for smooth demonstrations. Automated testing validates contract rules, backend behavior, and key UI components. Overall, BharatVote delivers a working end-to-end blockchain voting demo that is reproducible locally and accessible publicly via testnet deployments.

---

## PROBLEM CONTEXT (Brief)

Conventional voting systems are often centralized and require full trust in an authority to correctly manage voter lists, preserve ballot secrecy, and publish accurate results. Centralization creates single points of failure and increases the impact of insider threats or database tampering. BharatVote explores a decentralized architecture in which election rules are enforced by smart contracts and eligibility is verified cryptographically, improving transparency and auditability.

---

## SOLUTION IMPLEMENTED

- **Smart contracts (Solidity)** implement election creation (via Factory + Clones), candidate management, phase transitions, commit–reveal voting, tallying, and voter status tracking.
- **Merkle-based eligibility** prevents ineligible voting without storing large voter registries on-chain.
- **Web DApp (React + TypeScript)** provides:
  - Create Election (on Sepolia via factory)
  - Join Election (by address)
  - Public Demo election flow (one-click join)
  - Admin panel (candidates + phases)
  - Voter panel (commit/reveal)
  - Results (live + public all-time scan)
- **Backend (Express)** supports the demo onboarding and Merkle proof generation, plus optional KYC/IPFS backend mode for local demonstrations.
- **Cloud deployment** (final product): Vercel (frontend), Render (backend), Sepolia + Alchemy RPC (blockchain).

---

## TECHNOLOGIES USED

**Programming languages:** Solidity, TypeScript, JavaScript  
**Blockchain:** Ethereum (Sepolia testnet), Hardhat (local), OpenZeppelin (Clones/Initializable)  
**Web3:** MetaMask, ethers.js (v6), TypeChain  
**Frontend:** React 18, Vite, TailwindCSS, Material UI, lucide-react  
**Backend:** Node.js, Express, cors, merkletreejs  
**Optional decentralized storage:** IPFS/Pinata (alternative backend + contract variant)  
**Testing:** Hardhat + Chai (contracts), Jest + Supertest (backend), Vitest + RTL (frontend)

---

## OUTCOMES AND RESULTS

- Implemented a complete decentralized voting workflow with:
  - Privacy-preserving commit–reveal
  - On-chain eligibility verification (Merkle root/proofs)
  - Admin controls and real-time results visualization
- Delivered a working **public cloud demo** on Sepolia using **Vercel + Render + Alchemy RPC**.
- Automated tests validate smart-contract correctness and backend endpoints; performance benchmarks are documented in the Testing chapter.

---

# TABLE OF CONTENTS

1. List of Figures  
2. List of Tables  
3. List of Abbreviations  
4. CHAPTER 1: Introduction  
5. CHAPTER 2: Implementation Details  
6. CHAPTER 3: Testing, Validation & Results  
7. CHAPTER 4: Execution / Deployment Details  
8. CHAPTER 5: Project Execution Evidence  
9. CHAPTER 6: Conclusion & Future Work  
10. References  
11. Appendix

---

# LIST OF FIGURES (Add page numbers after final formatting)

- Figure 2.1 High-level architecture (Cloud: Vercel + Render + Sepolia)  
- Figure 2.2 Data flow (Create election, Join demo, Commit–reveal)  
- Figure 2.3 Election lifecycle (Commit → Reveal → Finished → Reset)  
- Figure 2.4 Demo onboarding flow (/api/join + Merkle root sync)  
- Figure 2.5 Public results “all-time” scan (event-based analytics)  
- Figure 4.1 Deployment screenshots (Vercel, Render env vars, Sepolia explorer)

---

# LIST OF TABLES (Add page numbers after final formatting)

- Table 2.1 Technology stack summary  
- Table 2.2 Module list and responsibilities  
- Table 3.1 Test cases  
- Table 3.2 Test results summary  
- Table 5.1 Weekly progress summary  
- Table 5.2 Supervisor interaction summary

---

# LIST OF ABBREVIATIONS

- **ABI**: Application Binary Interface  
- **CID**: Content Identifier (IPFS)  
- **DApp**: Decentralized Application  
- **EVM**: Ethereum Virtual Machine  
- **IPFS**: InterPlanetary File System  
- **KYC**: Know Your Customer  
- **OTP**: One-Time Password  
- **RPC**: Remote Procedure Call  
- **UI/UX**: User Interface / User Experience

---

# CHAPTER 1: INTRODUCTION (2–3 pages)

## 1. Overview of the Project

BharatVote is a decentralized voting platform implemented as a web DApp backed by Ethereum smart contracts. The system enables elections to be created via a factory contract on Sepolia, and also provides a pre-configured Demo Election for public access. The application is designed around election phases (Commit, Reveal, Finished), enabling privacy during voting and transparency after reveal. Voter eligibility is enforced via Merkle proof verification against an on-chain Merkle root.

## 2. Problem Statement & Motivation

**Problem Statement:** Centralized e-voting systems require trust in administrators to preserve vote secrecy, prevent tampering, and publish correct outcomes. Such systems can be vulnerable to manipulation and provide limited public verifiability.

**Motivation:** Blockchain provides a tamper-resistant ledger and programmable rules. BharatVote combines blockchain’s auditability with commit–reveal privacy and Merkle eligibility to demonstrate a secure and transparent election design suitable for a capstone-scale implementation and public demo.

## 3. Objectives of the Capstone

1. Implement an Ethereum election contract with phases, admin controls, commit–reveal voting, tallying, and reset.
2. Enforce eligibility using Merkle proofs and a stored Merkle root.
3. Build a modern web UI for creating elections, joining elections, voting, and viewing results.
4. Provide a public testnet deployment for demonstrations using Sepolia ETH.
5. Provide a backend service to support demo onboarding and proof generation.
6. Validate system behavior with automated tests.

## 4. Scope of Implementation

**Included in final product**
- Sepolia testnet deployment via factory (create new elections)
- Demo election contract for public demos
- Render backend for demo onboarding + Merkle proof APIs
- Vercel-hosted frontend DApp
- Public RPC scanning for “all-time” demo participation

**Limitations**
- Demo election uses testnet ETH; no real-money assets are involved.
- Secrets (RPC keys/private keys) must be managed via environment variables and should not be committed.
- Optional KYC/IPFS mode exists for local demonstration; the public demo focuses on the demo election flow.

## 5. Organization of the Report

Chapter 2 describes architecture, modules, and key algorithms.  
Chapter 3 describes testing methodology and results.  
Chapter 4 explains both local execution and the deployed cloud demo (Vercel + Render + Sepolia/Alchemy).  
Chapter 5 provides evidence of project execution.  
Chapter 6 concludes the project and proposes future enhancements.

---

# CHAPTER 2: IMPLEMENTATION DETAILS

## 2.1 System Architecture & Design

### 2.1.1 High-Level Architecture Diagram (Insert as Figure 2.1)

```mermaid
flowchart LR
  U[User Browser] --> FE[Vercel-hosted Frontend (React+TS+Vite)]
  FE --> MM[MetaMask Wallet]
  FE -->|HTTP| BE[Render-hosted Backend (Express)]
  MM -->|Sign Tx| RPC[Sepolia RPC (Alchemy)]
  RPC --> SC1[Sepolia ElectionFactory]
  RPC --> SC2[Sepolia BharatVote Election(s)]
  BE -->|Merkle root sync, funding| SC2
  FE -->|Read-only results scan| RPC
```

### 2.1.2 Data Flow Diagram (DFD Level 0) (Insert as Figure 2.2)

```mermaid
flowchart TD
  A[Admin] --> FE[Frontend]
  FE -->|createElection(name)| F[Factory Contract]
  F -->|ElectionCreated(election)| FE
  FE -->|Admin actions| E[Election Contract]
  V[Voter] --> FE
  FE -->|Join Demo: /api/join| BE[Backend]
  BE -->|Update allowlist + merkleRoot| E
  FE -->|commitVote / revealVote| E
  FE -->|PublicResults event scan| RPC[Alchemy RPC]
```

### 2.1.3 Component Interaction (Main vs Demo election)

**Main elections (created via factory)**
- Created from the UI using the Sepolia factory contract.
- Admin = wallet that calls `createElection(name)`.
- Users join by address (`/election/:address`).

**Demo election (pre-deployed, public)**
- Configured via `VITE_DEMO_ELECTION_ADDRESS`.
- “Join Demo Election” calls backend `POST /api/join`.
- Backend may:
  - Add new participant address into allowlist and rebuild Merkle tree.
  - Sync the updated `merkleRoot` to the demo election contract (requires admin key).
  - Send small Sepolia ETH to new participants if they lack gas (testnet only).
  - Optionally run timed auto-phase + auto-reset loops for smooth demos.

## 2.2 Technology Stack

**Table 2.1: Technology Stack Summary**

| Layer | Tools |
|---|---|
| Frontend | React, TypeScript, Vite, TailwindCSS, Material UI |
| Wallet | MetaMask |
| Web3 | ethers.js v6, TypeChain |
| Smart Contracts | Solidity ^0.8.20, OpenZeppelin Clones/Initializable |
| Backend | Node.js, Express, merkletreejs |
| Cloud | Vercel (frontend), Render (backend), Alchemy (Sepolia RPC) |
| Testing | Hardhat+Chai, Jest+Supertest, Vitest |

## 2.3 System Modules

**Table 2.2: Module-wise Description**

| Module | File(s) | Purpose |
|---|---|---|
| Election contract (implementation) | `contracts/BharatVote.sol` | Phases, candidates, commit–reveal vote, Merkle eligibility, tally, reset |
| Factory | `contracts/ElectionFactory.sol` | Creates clone elections and initializes admin/name |
| Frontend routing | `frontend/src/App.tsx` | `LandingPage` + `/election/:address`, demo KYC bypass for demo election |
| Create Election UI | `frontend/src/components/CreateElection.tsx` | Calls factory `createElection(name)` on Sepolia |
| Demo join UI | `frontend/src/components/LandingPage.tsx` | Calls backend `/api/join`, then navigates to demo election |
| Voter UI | `frontend/src/Voter.tsx` | Eligibility check + commit/reveal workflow |
| Admin UI | `frontend/src/Admin.tsx` | Candidate/phase management + diagnostics |
| Results UI (public) | `frontend/src/components/PublicResults.tsx` | Reads contract state + scans logs for all-time results |
| Demo backend | `backend/server.js` | `/api/join`, `/api/merkle-proof/:address`, `/api/merkle-root`, demo automation |
| Optional KYC/IPFS backend | `backend/server-with-ipfs.js` | `/api/kyc`, `/api/merkle-proof` (by voter_id), IPFS endpoints |

## 2.4 Key Algorithms / Logic

### A) Commit–Reveal Voting (Contract)

**Commit (phase 0):**
- Voter computes commitment hash: `keccak256(encodePacked(candidateId, saltBytes32))`
- Calls `commitVote(commitHash, merkleProof)`

**Reveal (phase 1):**
- Voter calls `revealVote(candidateId, saltBytes32)`
- Contract recomputes hash and matches stored commitment; updates tally

**Pseudocode**
```
commitVote(commit, proof):
  require phase == COMMIT
  require verifyMerkle(proof, msg.sender)
_toggle hasCommitted, store commit

revealVote(choice, salt):
  require phase == REVEAL
  expected = keccak256(choice, salt)
  require expected == storedCommit
  tally[choice]++
```

### B) Merkle Proof Eligibility (Contract)

**Idea:** Store only Merkle root on-chain; verify proofs at vote time.

**Pseudocode**
```
verify(proof[], addr):
  h = keccak256(addr)
  for p in proof:
    h = keccak256(sort(h, p))
  return h == merkleRoot
```

### C) Demo Onboarding & Merkle Root Sync (Backend)

**Idea:** For the public demo election, the backend can expand the allowlist and keep the on-chain Merkle root consistent so new users can vote.

**Flow**
1. Frontend reads user address from MetaMask.
2. Frontend calls `POST /api/join { address }`.
3. Backend adds the address (if not present), rebuilds Merkle tree, and sets demo contract `merkleRoot` (admin-only).
4. Backend may send a small Sepolia ETH top-up (demo convenience).

### D) Public Results – All-Time Scan (Frontend)

For the demo election, the frontend supports an “all-time” participation mode that scans Sepolia logs using a public RPC provider. This produces cumulative metrics even across election resets.

Configured via:
- `VITE_PUBLIC_RPC_URL`
- `VITE_PUBLIC_EVENTS_FROM_BLOCK`
- `VITE_PUBLIC_EVENTS_MAX_REQUESTS_PER_POLL`
- `VITE_PUBLIC_EVENTS_MAX_BLOCK_RANGE`

## 2.5 Screenshots / Code Snippets (Insert in final PDF)

Add screenshots of:
- Vercel deployment dashboard (project + env vars)
- Render service dashboard (deploy logs + env vars)
- Sepolia Etherscan pages for:
  - Factory contract
  - Demo election contract
  - A createElection transaction
- App UI screens:
  - Landing page (Create election + Join demo)
  - Admin panel (candidates/phases)
  - Voter commit/reveal screens
  - Public results “all-time” view

---

# CHAPTER 3: TESTING, VALIDATION & RESULTS

## 3.1 Test Plan

**Testing strategy**
- Smart contract unit tests validate permissions, phases, commit–reveal correctness, and eligibility checks.
- Backend tests validate API correctness, error handling, and performance.
- Frontend tests validate key components and user flow behavior (mocking-dependent).

**Tools used**
- Contracts: Hardhat + Chai
- Backend: Jest + Supertest
- Frontend: Vitest + React Testing Library

## 3.2 Test Cases

| Test Case ID | Description | Input | Expected Output | Status |
|---|---|---|---|---|
| TC-SC-01 | Admin is correct | createElection | admin == creator | Pass |
| TC-SC-02 | Eligible voter commits | commitVote + proof | stored commit | Pass |
| TC-SC-03 | Ineligible blocked | commitVote + bad proof | revert NotEligible | Pass |
| TC-SC-04 | Reveal increments tally | revealVote | tally++ | Pass |
| TC-API-01 | Demo join works | POST /api/join | allowlist synced | Pass |
| TC-API-02 | Merkle proof by address | GET /api/merkle-proof/:address | proof returned | Pass |

## 3.3 Results & Analysis

[Insert your latest test summary screenshot/output here. If you ran the earlier comprehensive suite, summarize: contracts pass, backend pass, frontend partial due to mocks.]

---

# CHAPTER 4: EXECUTION / DEPLOYMENT DETAILS (Final Product)

## 4.1 Execution Environment

- **Blockchain:** Ethereum Sepolia testnet (Chain ID `11155111`)
- **RPC provider:** Alchemy (Sepolia RPC)
- **Frontend hosting:** Vercel
- **Backend hosting:** Render (Express API)
- **Wallet:** MetaMask

## 4.2 Deployment Steps (Cloud)

### A) Frontend Deployment (Vercel)

1. Create a Vercel project from the Git repository.
2. Set Vercel project root to `frontend/` (recommended).
3. Build settings:
   - Install: `npm install`
   - Build: `npm run build`
   - Output: `dist`
4. Configure environment variables in Vercel (do not commit secrets):
   - `VITE_FACTORY_ADDRESS` = `[Sepolia factory address]`
   - `VITE_DEMO_ELECTION_ADDRESS` = `[Sepolia demo election address]`
   - `VITE_BACKEND_URL` = `https://[your-render-service].onrender.com`
   - `VITE_SEPOLIA_RPC_URL` = `https://eth-sepolia.g.alchemy.com/v2/[key]`
   - `VITE_PUBLIC_RPC_URL` = `https://eth-sepolia.g.alchemy.com/v2/[key]`
   - `VITE_CHAIN_ID` = `11155111`
   - Public scan tuning (optional): `VITE_PUBLIC_EVENTS_FROM_BLOCK`, `VITE_PUBLIC_EVENTS_MAX_REQUESTS_PER_POLL`, `VITE_PUBLIC_EVENTS_MAX_BLOCK_RANGE`
5. Ensure SPA routing works (already supported via `vercel.json` rewrite).

### B) Backend Deployment (Render)

1. Create a Render Web Service from the repository.
2. Set root directory to `backend/`.
3. Start command:
   - `node server.js`
4. Configure Render environment variables (required for demo join + on-chain sync):
   - `VITE_SEPOLIA_RPC_URL` or `RPC_URL` = `https://eth-sepolia.g.alchemy.com/v2/[key]`
   - `PRIVATE_KEY` = `[admin key for demo election; keep secret]`
   - `VITE_DEMO_ELECTION_ADDRESS` = `[Sepolia demo election address]`
   - `PORT` = `3000` (or Render default)
   - Optional: `DEMO_AUTOPHASE_ENABLED`, `DEMO_COMMIT_SECONDS`, `DEMO_REVEAL_SECONDS`, `DEMO_AUTORESET_ENABLED`

**Note:** The backend must use a wallet that is the **admin** of the demo election contract to set `merkleRoot` and optionally manage phases/funding.

### C) Sepolia Contracts (Factory + Elections)

- **Factory contract** is deployed on Sepolia and configured in the frontend via `VITE_FACTORY_ADDRESS`.
- **Main elections** are created by calling `createElection(name)` from the UI; the deployed election address is taken from the `ElectionCreated` event and used in the route `/election/:address`.
- **Demo election** is pre-deployed and referenced via `VITE_DEMO_ELECTION_ADDRESS`.

## 4.3 Deployment Steps (Local, for supervisor demo)

Local mode is useful for offline demonstrations and faster iteration:

1. Install dependencies: `npm run install:all`
2. Start Hardhat: `npm run node`
3. Deploy local election: `npm run deploy`
4. Start backend: `npm run backend:dev`
5. Start frontend: `npm run frontend:dev`

## 4.4 Demo Screenshots / Demo Video Link

- Demo screenshots: [Insert screenshots]  
- Demo video link: [Insert link]

---

# CHAPTER 5: PROJECT EXECUTION EVIDENCE

## 5.1 Version Control Evidence

- GitHub repository link: [link]
- Commit history screenshot: [insert screenshot]

## 5.2 Weekly Progress Summary

| Week | Task Planned | Task Completed | Supervisor Remark |
|---|---|---|---|
| 1 | Project setup | Repo + tooling + initial structure | |
| 2 | Contract admin controls | Candidates + phases | |
| 3 | Commit–reveal voting | Commit + reveal + tally | |
| 4 | Merkle eligibility | Merkle root + proof verification | |
| 5 | Web UI | Admin + voter + results screens | |
| 6 | Public demo hardening | Demo election + join flow + cloud env | |
| 7 | Testing | Contract/API/UI tests | |
| 8 | Deployment | Vercel + Render + Sepolia demo | |

## 5.3 Supervisor Interaction Summary

- Review dates: [list]
- Key feedback received: [bullet points]

---

# CHAPTER 6: CONCLUSION & FUTURE WORK

## Summary of Implementation

BharatVote delivers a complete blockchain voting demo with privacy-preserving commit–reveal voting, Merkle-based eligibility, role-based election management, and public testnet deployment for demonstrations. The final product integrates Vercel, Render, and Sepolia via Alchemy RPC.

## Achievements

- Publicly accessible demo election on Sepolia.
- Factory-based election creation for “main elections”.
- Backend-supported demo onboarding with on-chain Merkle root synchronization.
- Event-scanned “all-time” analytics for public demo participation.

## Limitations

- Demo uses Sepolia testnet; no real-world KYC integration.
- Private key custody is required for automated demo sync; must be secured in hosting environment.
- Public RPC log scanning can be rate-limited by providers.

## Future Enhancements

- Add secure encryption for any off-chain identity data and integrate real KYC providers.
- Add CI pipelines for frontend mocking and stable E2E tests.
- Add on-chain governance for admin rotation and election configuration.
- Add optional L2 deployment (e.g., Base/Arbitrum) for cost/performance.

---

# REFERENCES (IEEE / APA)

1. Ethereum Foundation, “Ethereum Documentation,” https://ethereum.org/  
2. Hardhat, “Hardhat Documentation,” https://hardhat.org/docs  
3. OpenZeppelin, “OpenZeppelin Contracts,” https://docs.openzeppelin.com/contracts/  
4. MetaMask, “MetaMask Documentation,” https://docs.metamask.io/  
5. Ethers.js, “Ethers.js Documentation,” https://docs.ethers.org/  
6. Alchemy, “Alchemy Docs,” https://docs.alchemy.com/  
7. Vercel, “Vercel Docs,” https://vercel.com/docs  
8. Render, “Render Docs,” https://render.com/docs  

---

# APPENDIX

## A. User Manual (Final Demo)

1. Open the hosted frontend URL: [Vercel URL]
2. Click **Join Demo Election**.
3. Connect MetaMask on **Sepolia**.
4. The backend onboards the wallet (allowlist + optional gas).
5. Commit vote → wait for reveal → reveal vote.
6. View results (current) and “all-time” participation on the public results panel.

## B. Installation Guide (Local)

1. `npm run install:all`
2. `npm run node`
3. `npm run deploy`
4. `npm run backend:dev`
5. `npm run frontend:dev`

## C. Source Code Link (GitHub)

[Paste link]

## D. Demo Video Link

[Paste link]

