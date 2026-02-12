# Test Plan and Cases

## Scope
This plan covers smart contract logic, backend API behavior, and the primary user flows in the frontend DApp. The goal is to verify correctness of commit-reveal voting, Merkle eligibility checks, phase enforcement, and demo onboarding.

## Test Levels and Strategy
- Smart contract unit tests: focus on phase transitions, eligibility verification, commit/reveal correctness, and admin permissions.
- Backend API tests: validate Merkle proof endpoints, demo join behavior, and analytics endpoints.
- Manual UI tests: verify MetaMask flow, network checks, commit/reveal UX, and results display.

## Tools
- Contracts: Hardhat + Chai
- Backend: Jest + Supertest
- Frontend: Vitest + React Testing Library

## Test Environment
- Local: Hardhat network for contracts; Node.js for backend; Vite dev server for frontend.
- Testnet: Sepolia for deployed demo validation.

## Entry Criteria
- Contracts compiled and deployed (local or Sepolia).
- Backend configured with required environment variables.
- Frontend configured with contract addresses and backend URL.

## Exit Criteria
- All critical test cases executed with evidence captured.
- Blocking defects documented with reproduction steps.

## Evidence Collection
Capture terminal outputs, screenshots of UI states, and explorer links for deployments. Fill in the placeholders in the test case table.

## Expanded Test Case Table
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
