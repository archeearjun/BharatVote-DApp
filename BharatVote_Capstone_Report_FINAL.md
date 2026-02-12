# COVER PAGE
Project Title: BharatVote - Decentralized Digital Voting Platform (Commit-Reveal + Merkle Eligibility)
Student Name(s) & Roll Number(s): <<MANUAL_NAME_01: Insert student name(s) and roll number(s)>>
Program: BSc Computer Science (Online Mode)
Institution Name: <<MANUAL_ORG_01: Insert institution name>>
Academic Year: <<MANUAL_DATE_01: Insert academic year (YYYY-YYYY)>>
Internal Supervisor Name: <<MANUAL_SUP_01: Insert supervisor name>>

# Declaration
I hereby declare that this capstone project titled "BharatVote - Decentralized Digital Voting Platform (Commit-Reveal + Merkle Eligibility)" is an original work carried out by me/us and has not been submitted to any other university or institution for the award of any degree.

Student Signature(s): <<MANUAL_SIG_01: Insert student signature(s)>>
Date: <<MANUAL_DATE_02: Insert declaration date>>

# Abstract (200–300 words)
BharatVote is a decentralized digital voting platform built as a web-based DApp to demonstrate secure, verifiable elections using Ethereum smart contracts. The system enforces election rules on-chain and keeps votes private during the commit phase using a commit-reveal scheme; votes are revealed and tallied only in the reveal phase, which prevents early disclosure. Voter eligibility is checked with Merkle proofs, where each eligible address is hashed into a tree and the contract stores only the root, reducing on-chain storage while still allowing verification. [1], [9]

The application provides an Admin interface for creating elections and managing candidates and phases, plus a Voter interface for committing and later revealing votes using the same secret salt. For main elections, a lightweight mock KYC flow verifies a voter ID against backend data before the voter can proceed. For the public demo election, a backend-assisted onboarding endpoint (`/api/join`) can add a new demo participant to the allowlist, rebuild the Merkle tree, and sync the new root on-chain. The frontend integrates MetaMask and ethers.js for transaction signing and read operations. [4], [7] The backend uses Express for API routing and merkle tree generation.

The final product is demonstrated on the Sepolia testnet, with the frontend hosted on Vercel and the backend hosted on Render. The demo also includes an "all-time" analytics view that scans on-chain events via a public RPC endpoint and aggregates counts for presentation. Overall, BharatVote delivers a complete end-to-end voting workflow that is reproducible locally and practical for capstone evaluation.

# Problem context (brief)
Traditional elections and centralized e-voting systems rely on a trusted authority to manage voter lists, preserve ballot secrecy, and publish accurate results. This creates a single point of failure and makes independent verification difficult. Logistics, transparency, and post-election auditing also become expensive and slow. BharatVote explores whether blockchain-based rules and cryptographic proofs can reduce the trust surface while still keeping ballots private during the voting period.

# Solution implemented
- Smart contracts (Solidity) implement election phases, candidate management, commit-reveal voting, tallying, and reset, with a factory that deploys minimal proxy elections.
- Merkle-based eligibility enforces allowlisted voting without storing the full list on-chain.
- A React + Vite frontend provides admin, voter, and results views with MetaMask-based signing and network checks.
- An Express backend supports demo onboarding, Merkle proof endpoints, and optional KYC/IPFS flows for local demos.
- A public demo is deployed on Sepolia with cloud hosting on Vercel (frontend) and Render (backend).

# Technologies used
- Programming languages: Solidity, TypeScript, JavaScript.
- Blockchain and tooling: Ethereum Sepolia testnet, Hardhat, OpenZeppelin Clones/Initializable.
- Web3 stack: MetaMask, ethers.js, TypeChain.
- Frontend: React 18, Vite, TailwindCSS, Material UI, lucide-react.
- Backend: Node.js, Express, merkletreejs.
- Testing: Hardhat + Chai, Jest + Supertest, Vitest + React Testing Library.

# Outcomes and results
- Implemented a complete decentralized voting workflow with privacy-preserving commit-reveal and Merkle eligibility.
- Delivered a working public testnet demo with admin and voter interfaces plus a public results view.
- Documented test coverage, manual testing evidence, and a repeatable deployment process.

# Table of Contents
<<MANUAL_TOC_01: Update the Table of Contents after final formatting in Word>>

# List of Figures
- Figure 2.1: System Architecture of BharatVote
- Figure 2.2: Data Flow Diagram (KYC -> proof -> commit -> reveal)
- Figure 2.3: Election Lifecycle and Phase Transitions
- Figure 2.4: Demo Onboarding Flow (/api/join + Merkle root sync)
- Figure 2.5: Public Results All-Time Scan (event analytics)
- Figure 2.6: Admin Page UI
- Figure 2.7: Voter Page UI
- Figure 2.8: Commit Vote Flow UI
- Figure 2.9: Reveal Vote Flow UI
- Figure 2.10: Results UI (Current + All-Time)
- Figure 3.1: Smart Contract Test Run (Terminal)
- Figure 3.2: Backend API Test Run (Terminal)
- Figure 3.3: Frontend UI Test Run (Terminal)
- Figure 3.4: Coverage Report Summary
- Figure 4.1: Cloud Deployment Dashboards (Vercel/Render)
- Figure 4.2: Deployed Transaction Evidence (Explorer)
- Figure 5.1: Git Commit History Screenshot

# List of Tables
- Table 2.1: Technology Stack Summary
- Table 2.2: Module List and Responsibilities
- Table 3.1: Expanded Test Cases
- Table 3.2: Known Issues and Mitigations
- Table 3.3: Performance and Reliability Metrics
- Table 4.1: Environment Variables
- Table 5.1: Weekly Progress Summary
- Table 5.2: Supervisor Interaction Summary

# List of Abbreviations (if any)
- ABI: Application Binary Interface
- CID: Content Identifier (IPFS)
- DApp: Decentralized Application
- DFD: Data Flow Diagram
- EVM: Ethereum Virtual Machine
- IPFS: InterPlanetary File System
- KYC: Know Your Customer
- OTP: One-Time Password
- RPC: Remote Procedure Call
- UI/UX: User Interface / User Experience

# CHAPTER 1: INTRODUCTION (Brief – 2 to 3 pages)
Note: Problem identification and system design were completed as part of the Study Project. Use from the previous submission and add if any changes to it.

## 1. Overview of the project
BharatVote is a decentralized voting platform designed to demonstrate how election rules can be enforced by smart contracts rather than by a single centralized authority. The project combines a web-based interface with Ethereum contracts to provide a full voting workflow: candidate setup, commit-phase voting, reveal-phase tallying, and final results publication. The core design goal is to preserve privacy during voting while guaranteeing public verifiability after the election ends.

Traditional elections-especially electronic ones-face persistent issues such as opaque tallying, administrative overreach, and weak audit trails. Even when systems are well-intentioned, voters must still trust that insiders did not alter the list of eligible voters or the final results. In BharatVote, the blockchain itself becomes the rule engine: it stores election state, enforces phase transitions, and validates each reveal against a previously committed hash. This shifts trust from individuals to code, which can be inspected and tested.

The platform is structured as a DApp with a factory contract that deploys election instances. Each election follows a strict lifecycle (Commit -> Reveal -> Finished), and only the admin wallet can move between phases or reset an election after it completes. Voters never send their choices in plain form during the commit phase; they submit a commitment hash that can only be opened later with a secret salt. This protects ballot secrecy until the reveal phase is active.

Voter eligibility is handled with a Merkle allowlist. Instead of storing a full list of allowed addresses on-chain, eligible addresses are hashed into a Merkle tree off-chain and only the root is stored in the contract. When a voter submits a commit, they include a Merkle proof showing their address is in the allowlist. This approach saves storage, reduces gas, and keeps the on-chain state compact.

The system also supports two practical modes. For "main elections," voters complete a lightweight mock KYC flow before committing a vote. For a public demo election, the backend can onboard new wallets via a `/api/join` endpoint that updates the allowlist and synchronizes the new Merkle root on-chain. This split allows for a realistic governance flow while still enabling easy public demos.
## 2. Problem Statement & Motivation
Problem Statement: Centralized e-voting systems require a high level of trust in administrators to protect voter privacy, prevent tampering, and publish correct results. This trust model creates single points of failure and makes independent auditing difficult. At scale, the logistics of verifying eligibility, handling disputes, and providing transparent results also become complex and costly.

Motivation: Blockchain provides a tamper-resistant ledger and programmable rules, making it a strong candidate for transparent election workflows. BharatVote uses commit-reveal to prevent early vote disclosure and Merkle proofs to enforce eligibility without exposing the entire voter list. The combination balances privacy, auditability, and feasibility for a capstone-sized implementation.

## 3. Objectives of the capstone
- Implement an Ethereum election contract with phases, admin controls, commit-reveal voting, tallying, and reset.
- Enforce eligibility using Merkle proofs with an on-chain Merkle root.
- Build a modern web UI for creating elections, joining elections, voting, and viewing results.
- Provide a public testnet deployment for demonstrations using Sepolia ETH.
- Provide a backend service to support demo onboarding and proof generation.
- Validate system behavior with automated tests and manual UI checks.

## 4. Scope of implementation
Included in scope:
- Factory-based creation of election contracts on Sepolia.
- Commit-reveal voting with on-chain tallying and phase enforcement.
- Merkle allowlist verification for voter eligibility.
- Admin and voter web interfaces with MetaMask integration.
- Backend API for demo onboarding, Merkle proofs, and optional KYC/IPFS workflows.
- Public demo deployment with cloud hosting and a testnet blockchain.

Excluded or out of scope:
- Real-world KYC verification with government identity systems.
- Coercion resistance and vote-buying prevention beyond commit-reveal.
- Secure hardware attestation of client devices.
- Legally binding elections with regulatory compliance guarantees.

## 5. Organization of the report
Chapter 2 explains the architecture, modules, and core algorithms used in BharatVote. Chapter 3 documents the testing strategy, test cases, and observed results. Chapter 4 provides execution and deployment steps for both local and cloud environments. Chapter 5 presents project execution evidence such as version control history and weekly progress. Chapter 6 summarizes achievements and outlines future enhancements.

# CHAPTER 2: IMPLEMENTATION DETAILS

## 2.1 System Architecture & Design

### 2.1.1 High-level architecture diagram
The system is composed of a React frontend, a MetaMask wallet for signing, a backend API for proof generation and demo onboarding, and Solidity smart contracts deployed on Sepolia. The frontend handles user actions and displays the state of the election. The backend acts as a helper service for building Merkle proofs and optionally managing demo-only automation, but all vote rules and tallies remain on-chain. The architecture separates trust boundaries: the backend can assist onboarding but cannot modify votes after commit. This separation is critical for transparency and auditability.

Figure 2.1: System Architecture of BharatVote
<<MANUAL_FIG_01: Insert architecture diagram image here (PNG/JPG). Caption: System components-Frontend, Backend, Smart Contracts, Blockchain, optional analytics store.>>

### 2.1.2 Data flow diagram
The core data flow starts when a voter connects a wallet and proves eligibility. For main elections, the voter completes mock KYC, then requests a Merkle proof for their address. The voter commits a hash of (candidateId, salt) during the commit phase. During the reveal phase, the voter reveals the same candidateId and salt so the contract can verify the commitment and update tallies. Admin actions, such as starting reveal or finishing the election, are performed by the admin wallet and are enforced by the contract's phase checks.

Figure 2.2: Data Flow Diagram (KYC -> proof -> commit -> reveal)
<<MANUAL_FIG_02: Insert data flow diagram image here (PNG/JPG). Caption: KYC -> Merkle proof -> commitVote -> revealVote -> tally.>>

### 2.1.3 Component interaction (main vs demo elections)
Main elections (created via factory):
- Created from the UI by calling `createElection(name)` on the factory contract.
- Admin uploads an allowlist; backend builds the Merkle root and proof endpoints.
- Voters complete mock KYC, then commit and reveal votes using MetaMask.
- Public tallies are displayed after reveal or once the election is finished.

Demo election (pre-deployed, public):
- Configured via `VITE_DEMO_ELECTION_ADDRESS` in the frontend.
- "Join Demo Election" calls backend `POST /api/join` to add an address to the allowlist.
- Backend can sync the new Merkle root on-chain and optionally fund testnet gas for demos.
- Demo phase scheduling can be automated for short commit/reveal rounds.

### 2.1.4 Election lifecycle
The election lifecycle is a strict three-phase flow: Commit -> Reveal -> Finished. Only the admin can advance phases, and reset is only allowed after the election is finished. This ensures votes are committed before any reveal can occur, and results are only finalized after reveal completes. Resetting clears previous commit/reveal state and reopens the commit phase for a new round.

Figure 2.3: Election Lifecycle and Phase Transitions
<<MANUAL_FIG_03: Insert election lifecycle diagram image here (PNG/JPG). Caption: Commit -> Reveal -> Finished -> Reset -> Commit.>>

### 2.1.5 Demo onboarding and analytics flow
The demo onboarding flow allows a new wallet to join without a pre-loaded allowlist. When `/api/join` is called, the backend adds the address to the demo list, rebuilds the Merkle tree, and updates the on-chain root using the demo admin key. A separate analytics component optionally scans on-chain events to display "all-time" participation counts in the public results view.

Figure 2.4: Demo Onboarding Flow (/api/join + Merkle root sync)
<<MANUAL_FIG_04: Insert demo onboarding flow diagram image here (PNG/JPG). Caption: Join request -> allowlist update -> merkleRoot sync -> optional funding.>>

Figure 2.5: Public Results All-Time Scan (event analytics)
<<MANUAL_FIG_05: Insert analytics flow diagram image here (PNG/JPG). Caption: RPC log scan -> aggregation -> UI display.>>
## 2.2 Technology Stack
Table 2.1: Technology Stack Summary

| Layer | Tools |
| --- | --- |
| Frontend | React, TypeScript, Vite, TailwindCSS, Material UI |
| Wallet | MetaMask |
| Web3 | ethers.js v6, TypeChain |
| Smart Contracts | Solidity ^0.8.20, OpenZeppelin Clones/Initializable |
| Backend | Node.js, Express, merkletreejs |
| Cloud | Vercel (frontend), Render (backend), Sepolia RPC |
| Testing | Hardhat + Chai, Jest + Supertest, Vitest |

## 2.3 System Modules
Table 2.2: Module List and Responsibilities

| Module | File(s) | Purpose |
| --- | --- | --- |
| Election contract (implementation) | `contracts/BharatVote.sol` | Phases, candidates, commit-reveal vote, Merkle eligibility, tally, reset |
| Factory | `contracts/ElectionFactory.sol` | Creates clone elections and initializes admin/name |
| Frontend routing | `frontend/src/App.tsx` | Routes for landing page and `/election/:address` |
| Create Election UI | `frontend/src/components/CreateElection.tsx` | Calls factory `createElection(name)` |
| Demo join UI | `frontend/src/components/LandingPage.tsx` | Calls backend `/api/join` and navigates to demo |
| Voter UI | `frontend/src/Voter.tsx` | Eligibility check + commit/reveal workflow |
| Admin UI | `frontend/src/Admin.tsx` | Candidate and phase management |
| KYC UI | `frontend/src/KycPage.tsx` | Mock KYC steps (voter ID + OTP + face) |
| Results UI | `frontend/src/components/PublicResults.tsx` | Current results and all-time scan |
| Demo backend | `backend/server.js` | `/api/join`, `/api/merkle-proof`, `/api/merkle-root`, analytics |
| Optional IPFS/KYC backend | `backend/server-with-ipfs.js` | KYC + IPFS endpoints for local demos |

The factory leverages OpenZeppelin's Clones library to deploy minimal proxy elections efficiently. [2]

## 2.4 Key Algorithms / Logic

### A) Commit-reveal voting (contract)
Commit phase (phase = 0):
- Voter computes commitment: `commit = keccak256(abi.encodePacked(candidateId, salt))`.
- Voter submits `commitVote(commit, merkleProof)`.
- Contract verifies Merkle proof and stores the commitment.

Reveal phase (phase = 1):
- Voter submits `revealVote(candidateId, salt)`.
- Contract recomputes the hash and compares it to the stored commit.
- If the hash matches, the tally increments for the chosen candidate.

Why the salt matters: the salt makes the commitment non-guessable, preventing anyone from deriving the vote before reveal even if candidate IDs are known.

Pseudocode:
```text
commitVote(commit, proof):
  require phase == COMMIT
  require verifyMerkle(proof, msg.sender)
  require commit != 0x0
  store commit

revealVote(choice, salt):
  require phase == REVEAL
  require hasCommitted
  expected = keccak256(abi.encodePacked(choice, salt))
  require expected == storedCommit
  tally[choice]++
```

### B) Merkle proof eligibility (contract)
Leaf hashing uses packed encoding of the voter address to match Solidity's `abi.encodePacked` behavior: `leaf = keccak256(abi.encodePacked(voterAddress))`. [1] For each proof element, the contract hashes the ordered pair (sorted) and compares the final hash to the stored Merkle root.

Pseudocode:
```text
verify(proof[], voterAddress):
  hash = keccak256(abi.encodePacked(voterAddress))
  for p in proof:
    hash = keccak256(abi.encodePacked(min(hash, p), max(hash, p)))
  return hash == merkleRoot
```

### C) Demo onboarding and Merkle root sync (backend)
- Frontend reads the user address from MetaMask.
- Frontend calls `POST /api/join { address }`.
- Backend adds the address to the demo allowlist and rebuilds the Merkle tree.
- Backend submits `setMerkleRoot(newRoot)` using the demo admin key.
- Optional: backend sends a small testnet gas top-up to the user.

### D) Public results - all-time scan (frontend/backend)
The demo election supports a public "all-time" participation view. A background job scans `VoteCommitted` and `VoteRevealed` events from a configured RPC endpoint and aggregates totals. The frontend reads both current contract state and the aggregated analytics data for display.

### E) Security & threat model (basic)
Threats addressed:
- Early vote disclosure is mitigated by commit-reveal and salted hashes.
- Unauthorized voting is blocked by Merkle proof verification against the root.
- Phase misuse (e.g., reveal during commit) is enforced by contract checks.

Threats not addressed:
- Real-world KYC fraud or coercion outside the DApp.
- Compromised user devices or stolen private keys.
- Network-level censorship or malicious RPC providers.

## 2.5 Screenshots / Code Snippets
Insert the following UI evidence in the final report:

Figure 2.6: Admin Page UI
<<MANUAL_FIG_06: Insert Admin page screenshot (PNG/JPG). Caption: Candidate and phase management.>>

Figure 2.7: Voter Page UI
<<MANUAL_FIG_07: Insert Voter page screenshot (PNG/JPG). Caption: Eligibility check and voting panel.>>

Figure 2.8: Commit Vote Flow UI
<<MANUAL_FIG_08: Insert Commit flow screenshot (PNG/JPG). Caption: Commit input and submission.>>

Figure 2.9: Reveal Vote Flow UI
<<MANUAL_FIG_09: Insert Reveal flow screenshot (PNG/JPG). Caption: Reveal input and submission.>>

Figure 2.10: Results UI (Current + All-Time)
<<MANUAL_FIG_10: Insert Results page screenshot (PNG/JPG). Caption: Current tally and all-time view.>>
# CHAPTER 3: TESTING, VALIDATION & RESULTS

## 3.1 Test Plan
Testing strategy includes three layers:
- Smart contract unit tests (Hardhat) validate permissions, phases, commit-reveal correctness, and eligibility checks. [3]
- Backend API tests (Jest + Supertest) validate endpoint correctness, error handling, and demo join behavior.
- Manual UI tests validate MetaMask flow, network checks, commit/reveal UX, and public results behavior.

Tools used:
- Contracts: Hardhat + Chai.
- Backend: Jest + Supertest.
- Frontend: Vitest + React Testing Library.

## 3.2 Test Cases
The table below lists the full test suite. Fill Actual Result, Status, and Evidence after execution.

| TC ID | Module | Preconditions | Steps | Expected Result | Actual Result | Status | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| TC-SC-01 | Smart Contract (BharatVote) | Election deployed; admin wallet connected; phase=Commit | Call addCandidate('A') | Candidate added and CandidateAdded event emitted | <<MANUAL_TESTRES_01: Paste actual result>> | <<MANUAL_TESTSTATUS_01: PASS/FAIL>> | <<MANUAL_EVID_01: Insert screenshot or log reference>> |
| TC-SC-02 | Smart Contract (BharatVote) | Election deployed; non-admin wallet connected; phase=Commit | Call addCandidate('A') | Revert with NotAdmin | <<MANUAL_TESTRES_02: Paste actual result>> | <<MANUAL_TESTSTATUS_02: PASS/FAIL>> | <<MANUAL_EVID_02: Insert screenshot or log reference>> |
| TC-SC-03 | Smart Contract (BharatVote) | Election deployed; admin wallet connected; phase=Reveal | Call addCandidate('A') | Revert with WrongPhase | <<MANUAL_TESTRES_03: Paste actual result>> | <<MANUAL_TESTSTATUS_03: PASS/FAIL>> | <<MANUAL_EVID_03: Insert screenshot or log reference>> |
| TC-SC-04 | Smart Contract (BharatVote) | Allowlisted voter with valid proof; phase=Commit | Call commitVote(commitHash, proof) | Commit stored; VoteCommitted event emitted | <<MANUAL_TESTRES_04: Paste actual result>> | <<MANUAL_TESTSTATUS_04: PASS/FAIL>> | <<MANUAL_EVID_04: Insert screenshot or log reference>> |
| TC-SC-05 | Smart Contract (BharatVote) | Allowlisted voter; phase=Reveal | Call commitVote(commitHash, proof) | Revert with WrongPhase | <<MANUAL_TESTRES_05: Paste actual result>> | <<MANUAL_TESTSTATUS_05: PASS/FAIL>> | <<MANUAL_EVID_05: Insert screenshot or log reference>> |
| TC-SC-06 | Smart Contract (BharatVote) | Allowlisted voter; phase=Commit | Call commitVote(bytes32(0), proof) | Revert with EmptyHash | <<MANUAL_TESTRES_06: Paste actual result>> | <<MANUAL_TESTSTATUS_06: PASS/FAIL>> | <<MANUAL_EVID_06: Insert screenshot or log reference>> |
| TC-SC-07 | Smart Contract (BharatVote) | Non-allowlisted voter; phase=Commit | Call commitVote(commitHash, invalidProof) | Revert with NotEligible | <<MANUAL_TESTRES_07: Paste actual result>> | <<MANUAL_TESTSTATUS_07: PASS/FAIL>> | <<MANUAL_EVID_07: Insert screenshot or log reference>> |
| TC-SC-08 | Smart Contract (BharatVote) | Allowlisted voter already committed; phase=Commit | Call commitVote(newCommit, proof) again | Revert with AlreadyCommitted | <<MANUAL_TESTRES_08: Paste actual result>> | <<MANUAL_TESTSTATUS_08: PASS/FAIL>> | <<MANUAL_EVID_08: Insert screenshot or log reference>> |
| TC-SC-09 | Smart Contract (BharatVote) | Allowlisted voter committed; phase=Reveal | Call revealVote(candidateId, correctSalt) | Tally increments; VoteRevealed event emitted | <<MANUAL_TESTRES_09: Paste actual result>> | <<MANUAL_TESTSTATUS_09: PASS/FAIL>> | <<MANUAL_EVID_09: Insert screenshot or log reference>> |
| TC-SC-10 | Smart Contract (BharatVote) | Allowlisted voter has not committed; phase=Reveal | Call revealVote(candidateId, salt) | Revert with NoCommit | <<MANUAL_TESTRES_10: Paste actual result>> | <<MANUAL_TESTSTATUS_10: PASS/FAIL>> | <<MANUAL_EVID_10: Insert screenshot or log reference>> |
| TC-SC-11 | Smart Contract (BharatVote) | Allowlisted voter committed; phase=Reveal | Call revealVote(candidateId, wrongSalt) | Revert with HashMismatch | <<MANUAL_TESTRES_11: Paste actual result>> | <<MANUAL_TESTSTATUS_11: PASS/FAIL>> | <<MANUAL_EVID_11: Insert screenshot or log reference>> |
| TC-SC-12 | Smart Contract (BharatVote) | Allowlisted voter already revealed; phase=Reveal | Call revealVote(candidateId, correctSalt) again | Revert with AlreadyRevealed | <<MANUAL_TESTRES_12: Paste actual result>> | <<MANUAL_TESTSTATUS_12: PASS/FAIL>> | <<MANUAL_EVID_12: Insert screenshot or log reference>> |
| TC-SC-13 | Smart Contract (BharatVote) | Candidate removed (inactive); phase=Reveal | Call revealVote(removedCandidateId, salt) | Revert with InactiveCandidate | <<MANUAL_TESTRES_13: Paste actual result>> | <<MANUAL_TESTSTATUS_13: PASS/FAIL>> | <<MANUAL_EVID_13: Insert screenshot or log reference>> |
| TC-SC-14 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call finishElection() | Revert with WrongPhase | <<MANUAL_TESTRES_14: Paste actual result>> | <<MANUAL_TESTSTATUS_14: PASS/FAIL>> | <<MANUAL_EVID_14: Insert screenshot or log reference>> |
| TC-SC-15 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call resetElection() | Revert with CanOnlyResetAfterFinish | <<MANUAL_TESTRES_15: Paste actual result>> | <<MANUAL_TESTSTATUS_15: PASS/FAIL>> | <<MANUAL_EVID_15: Insert screenshot or log reference>> |
| TC-API-01 | Backend API | Allowlisted address exists in voter list | GET /api/merkle-proof/:address | Returns proof and merkleRoot | <<MANUAL_TESTRES_16: Paste actual result>> | <<MANUAL_TESTSTATUS_16: PASS/FAIL>> | <<MANUAL_EVID_16: Insert screenshot or log reference>> |
| TC-API-02 | Backend API | Address not in voter list | GET /api/merkle-proof/:address | Returns error or empty proof with NotEligible indication | <<MANUAL_TESTRES_17: Paste actual result>> | <<MANUAL_TESTSTATUS_17: PASS/FAIL>> | <<MANUAL_EVID_17: Insert screenshot or log reference>> |
| TC-API-03 | Backend API | Backend running with allowlist loaded | GET /api/merkle-root | Returns current merkleRoot | <<MANUAL_TESTRES_18: Paste actual result>> | <<MANUAL_TESTSTATUS_18: PASS/FAIL>> | <<MANUAL_EVID_18: Insert screenshot or log reference>> |
| TC-API-04 | Backend API | Backend configured with admin key; demo election set | POST /api/join { address } | Address added (if new) and updated merkleRoot returned | <<MANUAL_TESTRES_19: Paste actual result>> | <<MANUAL_TESTSTATUS_19: PASS/FAIL>> | <<MANUAL_EVID_19: Insert screenshot or log reference>> |
| TC-API-05 | Backend API | Backend missing admin key or not demo admin | POST /api/join { address } | Returns error indicating demo join is unavailable | <<MANUAL_TESTRES_20: Paste actual result>> | <<MANUAL_TESTSTATUS_20: PASS/FAIL>> | <<MANUAL_EVID_20: Insert screenshot or log reference>> |
| TC-API-06 | Backend API | Demo analytics enabled | GET /api/demo/analytics | Returns aggregated demo counts or empty state | <<MANUAL_TESTRES_21: Paste actual result>> | <<MANUAL_TESTSTATUS_21: PASS/FAIL>> | <<MANUAL_EVID_21: Insert screenshot or log reference>> |
| TC-UI-01 | Frontend UI | MetaMask connected to wrong network | Open app and attempt action | User prompted to switch network; actions blocked | <<MANUAL_TESTRES_22: Paste actual result>> | <<MANUAL_TESTSTATUS_22: PASS/FAIL>> | <<MANUAL_EVID_22: Insert screenshot or log reference>> |
| TC-UI-02 | Frontend UI | Allowlisted address; phase=Commit | Enter candidate + salt and submit commit | Commit transaction submitted and UI shows pending/confirmed | <<MANUAL_TESTRES_23: Paste actual result>> | <<MANUAL_TESTSTATUS_23: PASS/FAIL>> | <<MANUAL_EVID_23: Insert screenshot or log reference>> |
| TC-UI-03 | Frontend UI | Address committed; phase=Reveal | Reveal with wrong salt | UI shows error; reveal rejected | <<MANUAL_TESTRES_24: Paste actual result>> | <<MANUAL_TESTSTATUS_24: PASS/FAIL>> | <<MANUAL_EVID_24: Insert screenshot or log reference>> |
| TC-UI-04 | Frontend UI | Main election flow and demo election flow available | Open main election and attempt vote without KYC; open demo election | Main election blocks until KYC; demo election skips KYC | <<MANUAL_TESTRES_25: Paste actual result>> | <<MANUAL_TESTSTATUS_25: PASS/FAIL>> | <<MANUAL_EVID_25: Insert screenshot or log reference>> |
| TC-UI-05 | Frontend UI | Public results page opened | Load current tally and all-time scan | Results shown or graceful retry message on RPC limits | <<MANUAL_TESTRES_26: Paste actual result>> | <<MANUAL_TESTSTATUS_26: PASS/FAIL>> | <<MANUAL_EVID_26: Insert screenshot or log reference>> |
| TC-UI-06 | Frontend UI | Non-admin wallet connected | Open Admin panel and try phase change | Admin actions disabled or rejected with error | <<MANUAL_TESTRES_27: Paste actual result>> | <<MANUAL_TESTSTATUS_27: PASS/FAIL>> | <<MANUAL_EVID_27: Insert screenshot or log reference>> |
| TC-SC-16 | Smart Contract (BharatVote) | Phase=Reveal; admin wallet connected | Call startReveal() | Revert with WrongPhase | <<MANUAL_TESTRES_28: Paste actual result>> | <<MANUAL_TESTSTATUS_28: PASS/FAIL>> | <<MANUAL_EVID_28: Insert screenshot or log reference>> |
| TC-SC-17 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call startReveal() | Phase changes to Reveal; PhaseChanged emitted | <<MANUAL_TESTRES_29: Paste actual result>> | <<MANUAL_TESTSTATUS_29: PASS/FAIL>> | <<MANUAL_EVID_29: Insert screenshot or log reference>> |
| TC-SC-18 | Smart Contract (BharatVote) | Phase=Reveal; admin wallet connected | Call finishElection() | Phase changes to Finished; TallyFinalized emitted | <<MANUAL_TESTRES_30: Paste actual result>> | <<MANUAL_TESTSTATUS_30: PASS/FAIL>> | <<MANUAL_EVID_30: Insert screenshot or log reference>> |
| TC-SC-19 | Smart Contract (BharatVote) | Phase=Finished; admin wallet connected | Call resetElection() | Commits/tallies reset; phase returns to Commit | <<MANUAL_TESTRES_31: Paste actual result>> | <<MANUAL_TESTSTATUS_31: PASS/FAIL>> | <<MANUAL_EVID_31: Insert screenshot or log reference>> |
| TC-SC-20 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call setMerkleRoot(newRoot) | merkleRoot updated on-chain | <<MANUAL_TESTRES_32: Paste actual result>> | <<MANUAL_TESTSTATUS_32: PASS/FAIL>> | <<MANUAL_EVID_32: Insert screenshot or log reference>> |

## 3.3 Results & Analysis
Observations:
- Commit-reveal prevents vote disclosure before the reveal phase, improving privacy during voting.
- Reveal failures are most often caused by incorrect salts or attempts to reveal too early.
- Merkle proof failures typically indicate a mismatched allowlist or an outdated Merkle root.
- MetaMask network mismatch is a common user error; the UI prompts a network switch.
- Demo onboarding depends on backend admin configuration; when not configured, join is disabled.
- Public RPC log scanning can be rate-limited, so results are eventually consistent.
- Phase transitions enforce a clear election lifecycle, reducing admin mistakes.
- Resetting an election clears prior state, enabling repeatable demos.
- UI validation reduces accidental commits with empty or invalid input.
- Manual UI tests are essential for wallet-dependent flows that cannot be fully mocked.

Table 3.2: Known Issues and Mitigations

| Issue | Cause | Mitigation |
| --- | --- | --- |
| RPC rate limits during event scan | Public RPC throttling | Reduce scan batch size and retry on backoff |
| Users forget or lose salt | Salt stored only by user | Provide UI reminders and allow manual re-entry |
| Demo join unavailable | Backend missing admin key | Validate env vars before demo session |
| Wrong network in MetaMask | User connected to another chain | UI prompts network switch |
Coverage:
- Test command: `npm run test:coverage`
- Coverage summary: <<MANUAL_COV_01: Paste coverage summary %>>
- Coverage report screenshot: <<MANUAL_COV_02: Insert screenshot of coverage report>>

Testing evidence figures:
Figure 3.1: Smart Contract Test Run (Terminal)
<<MANUAL_FIG_11: Insert terminal screenshot for smart contract tests.>>

Figure 3.2: Backend API Test Run (Terminal)
<<MANUAL_FIG_12: Insert terminal screenshot for backend tests.>>

Figure 3.3: Frontend UI Test Run (Terminal)
<<MANUAL_FIG_13: Insert terminal screenshot for frontend tests.>>

Figure 3.4: Coverage Report Summary
<<MANUAL_FIG_14: Insert coverage report screenshot.>>

Performance & Reliability Metrics (measurement plan):
Table 3.3: Performance and Reliability Metrics

| Metric | Measurement Method | Recorded Value |
| --- | --- | --- |
| Avg Sepolia confirmation time for commit tx | Record timestamps of 5 commit transactions and compute average | <<MANUAL_METRIC_01: Insert avg commit confirmation time>> |
| Avg Sepolia confirmation time for reveal tx | Record timestamps of 5 reveal transactions and compute average | <<MANUAL_METRIC_02: Insert avg reveal confirmation time>> |
| Backend `/api/join` average latency | Send 10 requests and average response time | <<MANUAL_METRIC_03: Insert avg /api/join latency>> |
| RPC rate-limit / event-scan reliability notes | Observe scanning behavior under load | <<MANUAL_METRIC_04: Describe observed RPC issues, if any>> |
# CHAPTER 4: EXECUTION / DEPLOYMENT DETAILS

## 4.1 Execution environment
- Blockchain network: Ethereum Sepolia testnet (Chain ID 11155111). [8]
- Wallet: MetaMask.
- Frontend hosting: Vercel.
- Backend hosting: Render.
- Local development: Node.js + Hardhat.

## 4.2 Deployment steps (local and cloud)

### 4.2.1 Contract deployment (local)
1. Install dependencies: `npm run install:all`
2. Start local Hardhat node: `npm run node`
3. Deploy contracts locally: `npm run deploy`

### 4.2.2 Contract deployment (Sepolia)
1. Ensure `VITE_SEPOLIA_RPC_URL` and `PRIVATE_KEY` are set.
2. Run: `npx hardhat run scripts/deploy.ts --network sepolia`
3. Capture the factory and demo election addresses for environment variables.

### 4.2.3 Backend start (local)
1. From the repo root, run: `npm run backend:dev`
2. Confirm the backend is listening on the configured `PORT`.

### 4.2.4 Frontend start (local)
1. From the repo root, run: `npm run frontend:dev`
2. Open the local Vite URL shown in the terminal.

### 4.2.5 Cloud deployment summary
- Frontend: create a Vercel project pointing to `frontend/` and set required environment variables.
- Backend: create a Render Web Service pointing to `backend/` and set required environment variables.

Table 4.1: Environment Variables

| Variable | Purpose | Value |
| --- | --- | --- |
| `VITE_FACTORY_ADDRESS` | Sepolia factory contract address | <<MANUAL_ENV_01: VITE_FACTORY_ADDRESS=...>> |
| `VITE_DEMO_ELECTION_ADDRESS` | Demo election contract address | <<MANUAL_ENV_02: VITE_DEMO_ELECTION_ADDRESS=...>> |
| `VITE_BACKEND_URL` | Backend base URL | <<MANUAL_ENV_03: VITE_BACKEND_URL=...>> |
| `VITE_SEPOLIA_RPC_URL` | RPC URL for Sepolia | <<MANUAL_ENV_04: VITE_SEPOLIA_RPC_URL=...>> |
| `VITE_PUBLIC_RPC_URL` | Public read-only RPC URL | <<MANUAL_ENV_05: VITE_PUBLIC_RPC_URL=...>> |
| `PRIVATE_KEY` | Demo admin private key (backend) | <<MANUAL_ENV_06: PRIVATE_KEY=...>> |
| `RPC_URL` | Backend RPC URL (if different) | <<MANUAL_ENV_07: RPC_URL=...>> |
| `ADMIN_ADDRESS` | Optional admin address override | <<MANUAL_ENV_08: ADMIN_ADDRESS=...>> |
| `DEMO_ANALYTICS_RPC_URL` | RPC for analytics scan | <<MANUAL_ENV_09: DEMO_ANALYTICS_RPC_URL=...>> |
| `UPSTASH_REDIS_REST_URL` | Analytics persistence URL | <<MANUAL_ENV_10: UPSTASH_REDIS_REST_URL=...>> |
| `UPSTASH_REDIS_REST_TOKEN` | Analytics persistence token | <<MANUAL_ENV_11: UPSTASH_REDIS_REST_TOKEN=...>> |
| `VITE_PUBLIC_EVENTS_FROM_BLOCK` | Start block for event scan | <<MANUAL_ENV_12: VITE_PUBLIC_EVENTS_FROM_BLOCK=...>> |
| `VITE_PUBLIC_EVENTS_MAX_REQUESTS_PER_POLL` | Event scan requests per poll | <<MANUAL_ENV_13: VITE_PUBLIC_EVENTS_MAX_REQUESTS_PER_POLL=...>> |
| `VITE_PUBLIC_EVENTS_MAX_BLOCK_RANGE` | Max block span per scan | <<MANUAL_ENV_14: VITE_PUBLIC_EVENTS_MAX_BLOCK_RANGE=...>> |

Deployed links:
- Frontend URL: <<MANUAL_LINK_01: Deployed frontend URL>>
- Backend URL: <<MANUAL_LINK_02: Backend URL>>
- Explorer contract link: <<MANUAL_LINK_03: Etherscan contract link>>

Demo steps (click-by-click):
1. Open the frontend URL and click "Join Demo Election."
2. Connect MetaMask and switch to Sepolia when prompted.
3. Wait for backend onboarding confirmation.
4. Commit a vote by selecting a candidate and entering a salt.
5. After the reveal phase starts, reveal using the same salt.
6. View current results and the all-time participation panel.

Demo evidence:
Figure 4.1: Cloud Deployment Dashboards (Vercel/Render)
<<MANUAL_FIG_15: Insert Vercel/Render dashboard screenshots.>>

Figure 4.2: Deployed Transaction Evidence (Explorer)
<<MANUAL_FIG_16: Insert deployment/transaction screenshot from explorer.>>

Demo video link: <<MANUAL_LINK_05: Demo video URL>>
# CHAPTER 5: PROJECT EXECUTION EVIDENCE

## 5.1 Version control evidence
GitHub repository link: <<MANUAL_LINK_04: GitHub repository URL>>

Figure 5.1: Git Commit History Screenshot
<<MANUAL_FIG_18: Insert screenshot of commit history.>>

## 5.2 Weekly progress summary
Table 5.1: Weekly Progress Summary

| Week | Dates | Work done | Output/Link | Remarks |
| --- | --- | --- | --- | --- |
| 1 | <<MANUAL_DATE_03: Week 1 dates>> | Project setup, repo structure, basic Hardhat config | <<MANUAL_LINK_06: Week 1 output/link>> | <<MANUAL_NOTE_01: Week 1 remarks>> |
| 2 | <<MANUAL_DATE_04: Week 2 dates>> | Election contract scaffolding, admin controls | <<MANUAL_LINK_07: Week 2 output/link>> | <<MANUAL_NOTE_02: Week 2 remarks>> |
| 3 | <<MANUAL_DATE_05: Week 3 dates>> | Commit-reveal voting logic and tests | <<MANUAL_LINK_08: Week 3 output/link>> | <<MANUAL_NOTE_03: Week 3 remarks>> |
| 4 | <<MANUAL_DATE_06: Week 4 dates>> | Merkle allowlist integration and proof endpoints | <<MANUAL_LINK_09: Week 4 output/link>> | <<MANUAL_NOTE_04: Week 4 remarks>> |
| 5 | <<MANUAL_DATE_07: Week 5 dates>> | Frontend admin/voter UI and result panels | <<MANUAL_LINK_10: Week 5 output/link>> | <<MANUAL_NOTE_05: Week 5 remarks>> |
| 6 | <<MANUAL_DATE_08: Week 6 dates>> | Demo onboarding flow and backend automation | <<MANUAL_LINK_11: Week 6 output/link>> | <<MANUAL_NOTE_06: Week 6 remarks>> |
| 7 | <<MANUAL_DATE_09: Week 7 dates>> | Testing and bug fixes | <<MANUAL_LINK_12: Week 7 output/link>> | <<MANUAL_NOTE_07: Week 7 remarks>> |
| 8 | <<MANUAL_DATE_10: Week 8 dates>> | Cloud deployment and documentation polish | <<MANUAL_LINK_13: Week 8 output/link>> | <<MANUAL_NOTE_08: Week 8 remarks>> |

## 5.3 Supervisor interaction summary
Supervisor name: <<MANUAL_SUP_02: Insert supervisor name>>

Table 5.2: Supervisor Interaction Summary

| Meeting | Date | Key feedback received |
| --- | --- | --- |
| 1 | <<MANUAL_DATE_11: Meeting 1 date>> | <<MANUAL_FEEDBACK_01: Feedback summary>> |
| 2 | <<MANUAL_DATE_12: Meeting 2 date>> | <<MANUAL_FEEDBACK_02: Feedback summary>> |
| 3 | <<MANUAL_DATE_13: Meeting 3 date>> | <<MANUAL_FEEDBACK_03: Feedback summary>> |

# CHAPTER 6: CONCLUSION & FUTURE WORK

## Summary of implementation
BharatVote delivers a complete blockchain voting demo with privacy-preserving commit-reveal, Merkle-based eligibility, admin-controlled phases, and a public testnet deployment. The architecture cleanly separates frontend UX, backend onboarding, and on-chain enforcement, making the system easy to reason about and test.

## Achievements
- Public demo election on Sepolia with deployable factory-based elections.
- End-to-end commit-reveal flow with Merkle proof verification.
- Admin and voter interfaces supported by a backend onboarding API.
- Evidence-driven testing and deployment documentation.

## Limitations
- The KYC flow is a mock and not suitable for real-world identity verification.
- Coercion resistance and device security are not fully addressed.
- Public RPC rate limits can delay event-scan analytics.

## Future enhancements
- Integrate real KYC providers with encrypted data storage.
- Add continuous integration for contract, backend, and UI test suites.
- Explore L2 deployments to reduce transaction cost and latency.
- Add formal governance for admin rotation and election policy.

# REFERENCES
[1] "Solidity Documentation," Solidity Foundation, <<MANUAL_YEAR_01: Publication year>>. (Accessed: <<MANUAL_REFDATE_01: Access date>>). Available: <<MANUAL_REF_LINK_01: Solidity docs URL>>.
[2] "OpenZeppelin Contracts Documentation," OpenZeppelin, <<MANUAL_YEAR_02: Publication year>>. (Accessed: <<MANUAL_REFDATE_02: Access date>>). Available: <<MANUAL_REF_LINK_02: OpenZeppelin docs URL>>.
[3] "Hardhat Documentation," Nomic Foundation, <<MANUAL_YEAR_03: Publication year>>. (Accessed: <<MANUAL_REFDATE_03: Access date>>). Available: <<MANUAL_REF_LINK_03: Hardhat docs URL>>.
[4] "ethers.js Documentation," ethers.org, <<MANUAL_YEAR_04: Publication year>>. (Accessed: <<MANUAL_REFDATE_04: Access date>>). Available: <<MANUAL_REF_LINK_04: ethers.js docs URL>>.
[5] "React Documentation," Meta, <<MANUAL_YEAR_05: Publication year>>. (Accessed: <<MANUAL_REFDATE_05: Access date>>). Available: <<MANUAL_REF_LINK_05: React docs URL>>.
[6] "Vite Documentation," Vite, <<MANUAL_YEAR_06: Publication year>>. (Accessed: <<MANUAL_REFDATE_06: Access date>>). Available: <<MANUAL_REF_LINK_06: Vite docs URL>>.
[7] "MetaMask Documentation," ConsenSys, <<MANUAL_YEAR_07: Publication year>>. (Accessed: <<MANUAL_REFDATE_07: Access date>>). Available: <<MANUAL_REF_LINK_07: MetaMask docs URL>>.
[8] "Ethereum Sepolia Testnet Documentation," Ethereum Foundation, <<MANUAL_YEAR_08: Publication year>>. (Accessed: <<MANUAL_REFDATE_08: Access date>>). Available: <<MANUAL_REF_LINK_08: Sepolia docs URL>>.
[9] "merkletreejs Documentation," merkletreejs, <<MANUAL_YEAR_09: Publication year>>. (Accessed: <<MANUAL_REFDATE_09: Access date>>). Available: <<MANUAL_REF_LINK_09: merkletreejs docs URL>>.
[10] "Express Documentation," OpenJS Foundation, <<MANUAL_YEAR_10: Publication year>>. (Accessed: <<MANUAL_REFDATE_10: Access date>>). Available: <<MANUAL_REF_LINK_10: Express docs URL>>.
[11] "Vercel Documentation," Vercel, <<MANUAL_YEAR_11: Publication year>>. (Accessed: <<MANUAL_REFDATE_11: Access date>>). Available: <<MANUAL_REF_LINK_11: Vercel docs URL>>.
[12] "Render Documentation," Render, <<MANUAL_YEAR_12: Publication year>>. (Accessed: <<MANUAL_REFDATE_12: Access date>>). Available: <<MANUAL_REF_LINK_12: Render docs URL>>.

# APPENDIX

## A. User Manual
1. Open the hosted frontend URL: <<MANUAL_LINK_01: Deployed frontend URL>>
2. Click "Join Demo Election."
3. Connect MetaMask and switch to Sepolia when prompted.
4. Wait for backend onboarding confirmation.
5. Commit a vote by selecting a candidate and entering a salt.
6. After the reveal phase starts, reveal using the same salt.
7. View current results and the all-time participation panel.

## B. Installation Guide
1. `npm run install:all`
2. `npm run node`
3. `npm run deploy`
4. `npm run backend:dev`
5. `npm run frontend:dev`

## C. Source Code Link (GitHub)
<<MANUAL_LINK_04: GitHub repository URL>>

## D. Demo Video Link
<<MANUAL_LINK_05: Demo video URL>>

## E. Placeholder Key
- MANUAL_NAME_01: Insert student name(s) and roll number(s)
- MANUAL_ORG_01: Insert institution name
- MANUAL_DATE_01: Insert academic year (YYYY-YYYY)
- MANUAL_SUP_01: Insert supervisor name
- MANUAL_SIG_01: Insert student signature(s)
- MANUAL_DATE_02: Insert declaration date
- MANUAL_TOC_01: Update the Table of Contents after final formatting in Word
- MANUAL_FIG_01: Insert architecture diagram image here (PNG/JPG). Caption: System components-Frontend, Backend, Smart Contracts, Blockchain, optional analytics store.
- MANUAL_FIG_02: Insert data flow diagram image here (PNG/JPG). Caption: KYC -> Merkle proof -> commitVote -> revealVote -> tally.
- MANUAL_FIG_03: Insert election lifecycle diagram image here (PNG/JPG). Caption: Commit -> Reveal -> Finished -> Reset -> Commit.
- MANUAL_FIG_04: Insert demo onboarding flow diagram image here (PNG/JPG). Caption: Join request -> allowlist update -> merkleRoot sync -> optional funding.
- MANUAL_FIG_05: Insert analytics flow diagram image here (PNG/JPG). Caption: RPC log scan -> aggregation -> UI display.
- MANUAL_FIG_06: Insert Admin page screenshot (PNG/JPG). Caption: Candidate and phase management.
- MANUAL_FIG_07: Insert Voter page screenshot (PNG/JPG). Caption: Eligibility check and voting panel.
- MANUAL_FIG_08: Insert Commit flow screenshot (PNG/JPG). Caption: Commit input and submission.
- MANUAL_FIG_09: Insert Reveal flow screenshot (PNG/JPG). Caption: Reveal input and submission.
- MANUAL_FIG_10: Insert Results page screenshot (PNG/JPG). Caption: Current tally and all-time view.
- MANUAL_TESTRES_01: Paste actual result
- MANUAL_TESTSTATUS_01: PASS/FAIL
- MANUAL_EVID_01: Insert screenshot or log reference
- MANUAL_TESTRES_02: Paste actual result
- MANUAL_TESTSTATUS_02: PASS/FAIL
- MANUAL_EVID_02: Insert screenshot or log reference
- MANUAL_TESTRES_03: Paste actual result
- MANUAL_TESTSTATUS_03: PASS/FAIL
- MANUAL_EVID_03: Insert screenshot or log reference
- MANUAL_TESTRES_04: Paste actual result
- MANUAL_TESTSTATUS_04: PASS/FAIL
- MANUAL_EVID_04: Insert screenshot or log reference
- MANUAL_TESTRES_05: Paste actual result
- MANUAL_TESTSTATUS_05: PASS/FAIL
- MANUAL_EVID_05: Insert screenshot or log reference
- MANUAL_TESTRES_06: Paste actual result
- MANUAL_TESTSTATUS_06: PASS/FAIL
- MANUAL_EVID_06: Insert screenshot or log reference
- MANUAL_TESTRES_07: Paste actual result
- MANUAL_TESTSTATUS_07: PASS/FAIL
- MANUAL_EVID_07: Insert screenshot or log reference
- MANUAL_TESTRES_08: Paste actual result
- MANUAL_TESTSTATUS_08: PASS/FAIL
- MANUAL_EVID_08: Insert screenshot or log reference
- MANUAL_TESTRES_09: Paste actual result
- MANUAL_TESTSTATUS_09: PASS/FAIL
- MANUAL_EVID_09: Insert screenshot or log reference
- MANUAL_TESTRES_10: Paste actual result
- MANUAL_TESTSTATUS_10: PASS/FAIL
- MANUAL_EVID_10: Insert screenshot or log reference
- MANUAL_TESTRES_11: Paste actual result
- MANUAL_TESTSTATUS_11: PASS/FAIL
- MANUAL_EVID_11: Insert screenshot or log reference
- MANUAL_TESTRES_12: Paste actual result
- MANUAL_TESTSTATUS_12: PASS/FAIL
- MANUAL_EVID_12: Insert screenshot or log reference
- MANUAL_TESTRES_13: Paste actual result
- MANUAL_TESTSTATUS_13: PASS/FAIL
- MANUAL_EVID_13: Insert screenshot or log reference
- MANUAL_TESTRES_14: Paste actual result
- MANUAL_TESTSTATUS_14: PASS/FAIL
- MANUAL_EVID_14: Insert screenshot or log reference
- MANUAL_TESTRES_15: Paste actual result
- MANUAL_TESTSTATUS_15: PASS/FAIL
- MANUAL_EVID_15: Insert screenshot or log reference
- MANUAL_TESTRES_16: Paste actual result
- MANUAL_TESTSTATUS_16: PASS/FAIL
- MANUAL_EVID_16: Insert screenshot or log reference
- MANUAL_TESTRES_17: Paste actual result
- MANUAL_TESTSTATUS_17: PASS/FAIL
- MANUAL_EVID_17: Insert screenshot or log reference
- MANUAL_TESTRES_18: Paste actual result
- MANUAL_TESTSTATUS_18: PASS/FAIL
- MANUAL_EVID_18: Insert screenshot or log reference
- MANUAL_TESTRES_19: Paste actual result
- MANUAL_TESTSTATUS_19: PASS/FAIL
- MANUAL_EVID_19: Insert screenshot or log reference
- MANUAL_TESTRES_20: Paste actual result
- MANUAL_TESTSTATUS_20: PASS/FAIL
- MANUAL_EVID_20: Insert screenshot or log reference
- MANUAL_TESTRES_21: Paste actual result
- MANUAL_TESTSTATUS_21: PASS/FAIL
- MANUAL_EVID_21: Insert screenshot or log reference
- MANUAL_TESTRES_22: Paste actual result
- MANUAL_TESTSTATUS_22: PASS/FAIL
- MANUAL_EVID_22: Insert screenshot or log reference
- MANUAL_TESTRES_23: Paste actual result
- MANUAL_TESTSTATUS_23: PASS/FAIL
- MANUAL_EVID_23: Insert screenshot or log reference
- MANUAL_TESTRES_24: Paste actual result
- MANUAL_TESTSTATUS_24: PASS/FAIL
- MANUAL_EVID_24: Insert screenshot or log reference
- MANUAL_TESTRES_25: Paste actual result
- MANUAL_TESTSTATUS_25: PASS/FAIL
- MANUAL_EVID_25: Insert screenshot or log reference
- MANUAL_TESTRES_26: Paste actual result
- MANUAL_TESTSTATUS_26: PASS/FAIL
- MANUAL_EVID_26: Insert screenshot or log reference
- MANUAL_TESTRES_27: Paste actual result
- MANUAL_TESTSTATUS_27: PASS/FAIL
- MANUAL_EVID_27: Insert screenshot or log reference
- MANUAL_TESTRES_28: Paste actual result
- MANUAL_TESTSTATUS_28: PASS/FAIL
- MANUAL_EVID_28: Insert screenshot or log reference
- MANUAL_TESTRES_29: Paste actual result
- MANUAL_TESTSTATUS_29: PASS/FAIL
- MANUAL_EVID_29: Insert screenshot or log reference
- MANUAL_TESTRES_30: Paste actual result
- MANUAL_TESTSTATUS_30: PASS/FAIL
- MANUAL_EVID_30: Insert screenshot or log reference
- MANUAL_TESTRES_31: Paste actual result
- MANUAL_TESTSTATUS_31: PASS/FAIL
- MANUAL_EVID_31: Insert screenshot or log reference
- MANUAL_TESTRES_32: Paste actual result
- MANUAL_TESTSTATUS_32: PASS/FAIL
- MANUAL_EVID_32: Insert screenshot or log reference
- MANUAL_COV_01: Paste coverage summary %
- MANUAL_COV_02: Insert screenshot of coverage report
- MANUAL_FIG_11: Insert terminal screenshot for smart contract tests.
- MANUAL_FIG_12: Insert terminal screenshot for backend tests.
- MANUAL_FIG_13: Insert terminal screenshot for frontend tests.
- MANUAL_FIG_14: Insert coverage report screenshot.
- MANUAL_METRIC_01: Insert avg commit confirmation time
- MANUAL_METRIC_02: Insert avg reveal confirmation time
- MANUAL_METRIC_03: Insert avg /api/join latency
- MANUAL_METRIC_04: Describe observed RPC issues, if any
- MANUAL_ENV_01: VITE_FACTORY_ADDRESS=...
- MANUAL_ENV_02: VITE_DEMO_ELECTION_ADDRESS=...
- MANUAL_ENV_03: VITE_BACKEND_URL=...
- MANUAL_ENV_04: VITE_SEPOLIA_RPC_URL=...
- MANUAL_ENV_05: VITE_PUBLIC_RPC_URL=...
- MANUAL_ENV_06: PRIVATE_KEY=...
- MANUAL_ENV_07: RPC_URL=...
- MANUAL_ENV_08: ADMIN_ADDRESS=...
- MANUAL_ENV_09: DEMO_ANALYTICS_RPC_URL=...
- MANUAL_ENV_10: UPSTASH_REDIS_REST_URL=...
- MANUAL_ENV_11: UPSTASH_REDIS_REST_TOKEN=...
- MANUAL_ENV_12: VITE_PUBLIC_EVENTS_FROM_BLOCK=...
- MANUAL_ENV_13: VITE_PUBLIC_EVENTS_MAX_REQUESTS_PER_POLL=...
- MANUAL_ENV_14: VITE_PUBLIC_EVENTS_MAX_BLOCK_RANGE=...
- MANUAL_LINK_01: Deployed frontend URL
- MANUAL_LINK_02: Backend URL
- MANUAL_LINK_03: Etherscan contract link
- MANUAL_FIG_15: Insert Vercel/Render dashboard screenshots.
- MANUAL_FIG_16: Insert deployment/transaction screenshot from explorer.
- MANUAL_LINK_05: Demo video URL
- MANUAL_LINK_04: GitHub repository URL
- MANUAL_FIG_18: Insert screenshot of commit history.
- MANUAL_DATE_03: Week 1 dates
- MANUAL_LINK_06: Week 1 output/link
- MANUAL_NOTE_01: Week 1 remarks
- MANUAL_DATE_04: Week 2 dates
- MANUAL_LINK_07: Week 2 output/link
- MANUAL_NOTE_02: Week 2 remarks
- MANUAL_DATE_05: Week 3 dates
- MANUAL_LINK_08: Week 3 output/link
- MANUAL_NOTE_03: Week 3 remarks
- MANUAL_DATE_06: Week 4 dates
- MANUAL_LINK_09: Week 4 output/link
- MANUAL_NOTE_04: Week 4 remarks
- MANUAL_DATE_07: Week 5 dates
- MANUAL_LINK_10: Week 5 output/link
- MANUAL_NOTE_05: Week 5 remarks
- MANUAL_DATE_08: Week 6 dates
- MANUAL_LINK_11: Week 6 output/link
- MANUAL_NOTE_06: Week 6 remarks
- MANUAL_DATE_09: Week 7 dates
- MANUAL_LINK_12: Week 7 output/link
- MANUAL_NOTE_07: Week 7 remarks
- MANUAL_DATE_10: Week 8 dates
- MANUAL_LINK_13: Week 8 output/link
- MANUAL_NOTE_08: Week 8 remarks
- MANUAL_SUP_02: Insert supervisor name
- MANUAL_DATE_11: Meeting 1 date
- MANUAL_FEEDBACK_01: Feedback summary
- MANUAL_DATE_12: Meeting 2 date
- MANUAL_FEEDBACK_02: Feedback summary
- MANUAL_DATE_13: Meeting 3 date
- MANUAL_FEEDBACK_03: Feedback summary
- MANUAL_YEAR_01: Publication year
- MANUAL_REFDATE_01: Access date
- MANUAL_REF_LINK_01: Solidity docs URL
- MANUAL_YEAR_02: Publication year
- MANUAL_REFDATE_02: Access date
- MANUAL_REF_LINK_02: OpenZeppelin docs URL
- MANUAL_YEAR_03: Publication year
- MANUAL_REFDATE_03: Access date
- MANUAL_REF_LINK_03: Hardhat docs URL
- MANUAL_YEAR_04: Publication year
- MANUAL_REFDATE_04: Access date
- MANUAL_REF_LINK_04: ethers.js docs URL
- MANUAL_YEAR_05: Publication year
- MANUAL_REFDATE_05: Access date
- MANUAL_REF_LINK_05: React docs URL
- MANUAL_YEAR_06: Publication year
- MANUAL_REFDATE_06: Access date
- MANUAL_REF_LINK_06: Vite docs URL
- MANUAL_YEAR_07: Publication year
- MANUAL_REFDATE_07: Access date
- MANUAL_REF_LINK_07: MetaMask docs URL
- MANUAL_YEAR_08: Publication year
- MANUAL_REFDATE_08: Access date
- MANUAL_REF_LINK_08: Sepolia docs URL
- MANUAL_YEAR_09: Publication year
- MANUAL_REFDATE_09: Access date
- MANUAL_REF_LINK_09: merkletreejs docs URL
- MANUAL_YEAR_10: Publication year
- MANUAL_REFDATE_10: Access date
- MANUAL_REF_LINK_10: Express docs URL
- MANUAL_YEAR_11: Publication year
- MANUAL_REFDATE_11: Access date
- MANUAL_REF_LINK_11: Vercel docs URL
- MANUAL_YEAR_12: Publication year
- MANUAL_REFDATE_12: Access date
- MANUAL_REF_LINK_12: Render docs URL

# FORMATTING GUIDELINES
- Font: Times New Roman
- Size: 12 (Text), 14 (Headings)
- Line Spacing: 1.5
- Margin: 1 inch (all sides)
- Page Numbers: Bottom-center
- File Format: PDF
