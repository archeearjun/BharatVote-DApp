# Week 3 Presentation Script: Verified Commit-Reveal Voting

**Duration:** ~12 minutes code walkthrough + 3-4 minutes demo  
**Structure:** Backend → Frontend → Live Demo

---

## 🎯 Opening (30 seconds)

"Welcome to **Week 3** of BharatVote. This week we layered multi-factor KYC (EPIC + OTP + face recognition) in front of our commit-reveal ballot. I'll walk through how the backend, frontend, and mock services deliver a verified-yet-private voting flow."

---

## 🛠 PART 1: BACKEND (5 minutes)

### 1.1 Contract Overview & Phases (1 minute)

**Open:** `BharatVote-Week3-Backend/contracts/BharatVote.sol`

**Say:**
- "Week 3 keeps the Week 2 admin controls and adds commit-reveal voting."
- "Everything hinges on the three election phases and per-voter state."

**Point to:**
- **Lines 30-32:** `PHASE_COMMIT`, `PHASE_REVEAL`, `PHASE_FINISHED`
- **Lines 52-55:** `commits`, `hasCommitted`, `hasRevealed`, `tally`
- **Lines 133-144:** `startReveal()` and `finishElection()` admin-only transitions

### 1.2 Commit Function (1 minute)

**Scroll to:** **Line 156** (`function commitVote(bytes32 _commit, bytes32[] calldata _proof)`)

**Say:**
- "Commitments are hashes of (choice + salt). We block duplicates and enforce eligibility."

**Point to:**
- **Line 161:** Double-commit guard
- **Line 164:** Empty-hash check
- **Line 168:** Eligibility hook
- **Lines 171-173:** Persisting commitment and voter list

### 1.3 Reveal Function (1 minute)

**Scroll to:** **Line 184** (`function revealVote(uint256 _choice, bytes32 _salt)`)

**Say:**
- "Reveal recomputes the hash and updates tallies."

**Point to:**
- **Line 190:** Require prior commit
- **Line 193:** Prevent double reveal
- **Lines 196-197:** Hash recompute + equality check
- **Line 201:** Increment tally

### 1.4 Eligibility Placeholder (30 seconds)

**Scroll to:** **Lines 217-233** (`verifyEligibility`)

**Say:**
- "Week 3 keeps eligibility open while we wire up the Merkle proof."

**Point to:**
- **Lines 226-228:** Testing bypass when `merkleRoot == 0`
- **Line 233:** Temporary proof-or-address guard (will be replaced in Week 4)

### 1.5 Deployment Automation (45 seconds)

**Open:** `BharatVote-Week3-Backend/scripts/deploy.ts`

**Say:**
- "Deployment now seeds the entire local stack."

**Point to:**
- **Lines 17-44:** Network probe + contract deployment
- **Lines 55-98:** Optional Merkle root generation from `eligibleVoters.json`
- **Lines 120-128:** Auto-adding four sample candidates
- **Lines 132-167:** Writing ABI/address to `Week3-Frontend/src/contracts/BharatVote.json`

### 1.6 Mock KYC & Merkle Proof API (1 minute)

**Open:** `BharatVote-Week3-Backend/mock-kyc-server/server.js`

**Say:**
- "Our mock microservice mirrors the contract hashing so proofs align."

**Point to:**
- **Lines 15-28:** `keccak256Hasher` helper (same packed hash as Solidity)
- **Lines 52-69:** Loading KYC data, eligible voters, Merkle tree preparation
- **Lines 75-91:** `/api/kyc` returning `{ eligible, address }`
- **Lines 97-119:** `/api/merkle-proof` issuing proofs for verified voters

---

## 💻 PART 2: FRONTEND (6 minutes)

### 2.1 App Shell & Health Checks (1 minute)

**Open:** `BharatVote-Week3-Frontend/src/App.tsx`

**Say:**
- "App.tsx manages wallet connection, contract probing, and the KYC gate."

**Point to:**
- **Lines 23-44:** Persisted `isKycVerified` state
- **Lines 57-88:** Bytecode probe (`contractHealthy`)
- **Lines 279-294:** Non-admins hit `<KycPage>` until verification
- **Lines 299-372:** Lazy-loaded `Admin` vs `Voter` dashboards

### 2.2 Environment Constants (30 seconds)

**Open:** `src/constants.ts`

**Point to:**
- **Lines 4-12:** `BACKEND_URL`, `RPC_URL`, `EXPECTED_CHAIN_ID` defaults for localhost stack

### 2.3 KYC Flow (2 minutes)

**Open:** `src/components/KycPage.tsx`

**Say:** "Three steps before voting."

- **Step 1 – EPIC validation (Lines 35-90):** `handleSendOtp` hits `/api/kyc`, checks EPIC format, and enforces wallet-address match.
- **Step 2 – OTP challenge (Lines 114-150 & 295-355):** `handleOtpSubmit` validates against demo OTPs and opens the face modal.
- **Step 3 – Face verification (Lines 153-161 & 358-382):** `handleFaceVerified` completes MFA and invokes `onVerified(voterId)`.

### 2.4 Face Recognition Component (1 minute)

**Open:** `src/components/FaceRecognition.tsx`

**Say:**
- "We provide a demo-friendly detector with graceful fallbacks."

**Point to:**
- **Lines 24-77:** Model loading strategy (simulate → local → CDN)
- **Lines 82-108:** Camera setup and permission handling
- **Lines 127-170:** 500 ms detection loop requiring three consecutive hits

### 2.5 Commit/Reveal UI (1.5 minutes)

**Open:** `src/Voter.tsx`

**Commit phase:**
- **Lines 419-555:** Candidate selection, salt entry, and commit button
- **Lines 197-227:** Hash + Merkle proof generation before calling `commitVote`

**Reveal phase:**
- **Lines 558-694:** Reveal form and reminders
- **Lines 285-292:** Hash recomputation and equality check before `revealVote`

**Explain:** "The same hashing primitives as Solidity (`ethers.solidityPackedKeccak256`) keep off-chain/on-chain commitments identical."

### 2.6 Infrastructure Upgrades (30 seconds)

**Point to:**
- **`src/polyfills.ts` lines 13-22:** Single Buffer/process/global shim
- **`src/i18n.tsx` lines 8-210:** Restored translation dictionary
- **Contract health check** already covered in App.tsx

---

## 🎬 PART 3: LIVE DEMO (3-4 minutes)

### Setup (keep four terminals ready)

1. `npx hardhat node`
2. `cd mock-kyc-server && npm start`
3. `npx hardhat run scripts/deploy.ts --network localhost`
4. `cd BharatVote-Week3-Frontend && npm run dev`
5. MetaMask → Localhost 8545 (Chain ID 31337), two funded accounts
6. Browser console open for probe + KYC logs

### Demo Flow

1. **Health check (30s):** Connect as admin, highlight console probe (App.tsx lines 57-88) and pre-seeded candidates (deploy.ts lines 120-128).
2. **KYC (1.5 min):** Switch to voter account. Complete EPIC (`VOTER1`), OTP (`123456`), and face verification (KycPage + FaceRecognition references). Note the success toast and auto redirect.
3. **Commit vote (1 min):** Pick “Archee Arjun”, enter salt, click commit. Show console hash logs (Voter.tsx lines 197-227) and explain only the commitment hash is on-chain (BharatVote.sol line 156).
4. **Advance phase (30s):** Return to admin, trigger `startReveal()` (BharatVote.sol lines 133-137), confirm phase badge updates.
5. **Reveal vote (1 min):** Back on voter account, re-enter details, show hash equality check (Voter.tsx lines 285-288) before revealing. Confirm tally bump (BharatVote.sol line 201).
6. **Results (30s):** Run `await contract.getTally()` in console to show live counts.

---

## ✅ Closing (45 seconds)

"Week 3 now delivers a verified yet private ballot:

- ✅ Multi-factor KYC (EPIC + OTP + face) before voting  
- ✅ Commit-reveal smart contract with phase enforcement  
- ✅ Automated deployment, seeded data, and contract health probes  
- ✅ Frontend resilience (polyfills, translations, eligibility status)  
- ✅ Mock KYC/Merkle API aligned with on-chain hashing

Next up in Week 4: move the Merkle proof from the mock API into the Solidity `verifyEligibility` check."

---

## 📝 Quick Reference

**Talking Points**
- Multi-factor identity check → only verified voters reach the ballot.
- Commit-reveal → privacy during commit, transparency during reveal.
- Operational guardrails → health probes, seeded data, centralized polyfills.

**If Something Breaks**
- **Contract:** verify deployment (`scripts/verify-deployment.ts`), confirm `BharatVote.json`, watch probe logs.
- **Frontend:** refresh, ensure `BACKEND_URL`/polyfills/i18n loaded.
- **Wallet/Network:** confirm Hardhat node + MetaMask chain ID 31337.
- **Mock KYC:** restart server, inspect `/api/kyc` responses, confirm voter entry in `kyc-data.json`.
- **Face recognition:** allow camera; fallback logging in `FaceRecognition.tsx` lines 127-170 shows detection status.
- **Voting flow:** check `contract.commits(account)` before reveal and ensure correct phase.

**Common Q&A**
- *Why commit-reveal?* Prevents coercion and vote buying.
- *What if OTP fails?* Demo OTPs are VOTER1→123456 etc.; production would call SMS/email.
- *Can admin see votes early?* No — hashes only until reveal verifies the salt.
- *Why face check in demo?* Simulates biometric KYC while remaining developer-friendly.

---

## ✅ Pre-Presentation Checklist

- [ ] Hardhat node running  
- [ ] Mock KYC server running  
- [ ] Contract deployed & ABI exported  
- [ ] Frontend dev server running  
- [ ] MetaMask on Localhost 31337 (admin + voter funded)  
- [ ] Key files open (`BharatVote.sol`, `deploy.ts`, `App.tsx`, `KycPage.tsx`, `Voter.tsx`)  
- [ ] Contract health check green, admin dashboard shows 4 candidates  
- [ ] KYC gate appears for voter account  
- [ ] This script ready for reference

---

**Good luck with your presentation! 🚀**
