# BharatVote A-to-Z Master Notes

Last updated: 2026-02-04
Location: C:\Users\arche\Desktop\BharatVote

Purpose of this file
- This is the single, comprehensive memory file that explains what the project does, the tools used, why each major concept exists, and what every file in the repository is for.
- It is written so you can memorize the full story end-to-end without opening other docs, but it also points to the exact files for deeper reference.

How to read this document
1) Read Sections 1-7 to understand the full system story and the reasons behind design choices.
2) Use Sections 8-12 as operational references (scripts, env, testing, deployment).
3) Use Section 13 (File-by-file inventory) to memorize where everything lives and why it exists.

------------------------------------------------------------------------------
1) Project Intent and Scope
------------------------------------------------------------------------------
BharatVote is a decentralized voting platform that demonstrates secure digital elections using:
- A commit-reveal voting smart contract (privacy-preserving).
- Merkle-tree-based voter eligibility (compact, on-chain verification).
- A web frontend for admins and voters.
- A backend for mock KYC verification and Merkle proof generation.
- Optional IPFS integration for off-chain storage of large election data.

The project is designed for local demos and testnet demos, not production elections.

------------------------------------------------------------------------------
2) System Architecture (High-level)
------------------------------------------------------------------------------
Core components and their roles:
- Frontend (React + Vite) runs at localhost:5173 and provides the UI for admin and voters.
- Backend (Express) runs at localhost:3000 or 3001 depending on mode; it does mock KYC and Merkle proofs.
- Blockchain layer (Hardhat local node or Sepolia testnet) runs at localhost:8545 for local.
- Smart contracts live on-chain and enforce election rules.
- Optional IPFS storage via Pinata for KYC data, voter list, and results archives.

Data and control flow (simplified):
1) Admin deploys election (via scripts or factory) and sets Merkle root.
2) Voter completes KYC (mock) and gets Merkle proof from backend.
3) Voter commits vote (hash of candidate + salt) on-chain during commit phase.
4) Admin advances phase to reveal.
5) Voter reveals vote with same candidate + salt.
6) Contract verifies hash and counts vote.
7) Tally is read from contract and shown in UI.

------------------------------------------------------------------------------
3) Key Concepts and Why We Used Them
------------------------------------------------------------------------------
Commit-Reveal voting
- Why: Keeps votes private during the election, prevents early influence and coercion.
- How: Voter commits a hash (candidate + secret salt) in commit phase; later reveals candidate + salt.
- Contract enforces that reveal hash matches earlier commit.

Merkle Tree eligibility
- Why: On-chain allowlists are expensive; Merkle proofs allow compact on-chain verification.
- How: Backend builds tree from eligible addresses and gives each voter a proof.
- Contract verifies proof against the on-chain Merkle root.

Admin-controlled phases (Commit -> Reveal -> Finished)
- Why: Enforces the election lifecycle and prevents out-of-order actions.
- How: Admin-only functions change phase; contract reverts if actions occur in wrong phase.

Clones and factory (EIP-1167 pattern)
- Why: Deploy many elections cheaply without deploying the full implementation each time.
- How: ElectionFactory clones a BharatVote implementation and initializes it.

Custom errors and uint8 phase
- Why: Gas efficiency and clearer revert reasons.
- How: Solidity custom errors reduce revert cost; uint8 saves storage.

Mock KYC and OTP
- Why: Real KYC (like Aadhaar) is not feasible in a student project; mock KYC preserves flow.
- How: Backend checks a JSON file; frontend uses a mock OTP and mock face verification.

Face recognition (demo mode)
- Why: Demonstrates multi-factor identity checks without real biometric infrastructure.
- How: face-api.js is used with fallback demo detection when models are unavailable.

IPFS integration
- Why: Store large or sensitive election artifacts off-chain while keeping on-chain hashes.
- How: Backend pins JSON to IPFS via Pinata; contract stores the hashes.

Public results and analytics
- Why: Provide read-only results without wallet; support demo audiences.
- How: Frontend can scan on-chain events or read demo analytics from backend.

Multi-language UI (English, Hindi, Tamil)
- Why: Accessibility and inclusivity for regional audiences.
- How: i18n dictionary stored in frontend/src/i18n.tsx.

------------------------------------------------------------------------------
4) Tooling and Tech Stack (What we used, and why)
------------------------------------------------------------------------------
Blockchain and contracts
- Solidity 0.8.20 (modern compiler, built-in overflow checks).
- Hardhat (local dev node, testing, deployment scripts).
- Ethers v6 (contract interactions in scripts, backend, frontend).
- OpenZeppelin (Initializable and Clones for proxy + factory patterns).
- TypeChain (typed contract bindings for TS code).

Backend
- Node.js + Express (simple REST microservice for KYC and Merkle proofs).
- merkletreejs + ethers (build Merkle trees in same hash format as contract).
- axios, cors, helmet, express-rate-limit (API calls and security hardening).
- Pinata + IPFS (optional, for decentralized storage).
- Upstash Redis REST (optional, for demo analytics persistence).

Frontend
- React 18 + Vite + TypeScript (fast dev and strong type safety).
- Tailwind CSS + Material UI (utility styling + component library).
- Lucide and MUI icons.
- face-api.js (face detection demo).
- Vitest + Testing Library (frontend tests).

Testing and CI
- Mocha + Chai via Hardhat for contract tests.
- Jest + Supertest for backend tests.
- Vitest for frontend tests.
- Playwright included in tests package for integration tests.
- GitHub Actions CI for install, compile, and tests.

Deployment/Hosting
- Vercel rewrites for SPA routing.
- Sepolia testnet support in Hardhat config and frontend env.
- Render is referenced as a hosted backend option in frontend/README.md.
- RPC providers are configurable; Alchemy/Infura/Ankr can be used via RPC URL env vars.

4.1) Full "Used In This Repo" Checklist (services + libraries)
Infrastructure / hosting / providers
- Vercel (SPA hosting + rewrites).
- Render (hosted backend option).
- Upstash Redis REST (optional demo analytics persistence).
- Pinata IPFS (pinning service).
- RPC providers: Alchemy, Infura, Ankr, and public Sepolia RPC (rpc.sepolia.org).
- Etherscan API key support in hardhat.config.ts.
- MetaMask (wallet connection and network switch).

Blockchain / smart contract toolchain
- Hardhat (+ hardhat-toolbox, hardhat-ethers, hardhat-chai-matchers, hardhat-network-helpers, hardhat-verify).
- Ethers v6 (scripts, backend, frontend).
- OpenZeppelin contracts (Initializable, Clones).
- TypeChain (+ @typechain/hardhat, @typechain/ethers-v6).
- Solidity coverage + hardhat-gas-reporter (dev tools).

Backend libraries
- Express 5, cors, helmet, express-rate-limit.
- axios, form-data (HTTP + Pinata).
- dotenv (env loading).
- merkletreejs + ethers (Merkle tree + hash compatibility).
- sha256 (utility hashing).
- Jest + Supertest for API tests.

Frontend libraries
- React 18, React DOM, React Router.
- Vite + @vitejs/plugin-react.
- Tailwind CSS + PostCSS + Autoprefixer.
- MUI + Emotion (@mui/material, @mui/icons-material, @emotion/react, @emotion/styled).
- lucide-react icons.
- face-api.js + @tensorflow/tfjs (face recognition demo).
- buffer + vite-plugin-node-polyfills (Node globals in browser).

Testing / tooling
- Mocha + Chai (contracts).
- Jest + Supertest (backend).
- Vitest + Testing Library + jsdom (frontend).
- Playwright (integration/e2e package).
- ESLint + @typescript-eslint (frontend linting).
- concurrently, rimraf, ts-node (dev scripts/utilities).
- TypeScript (root + frontend).
- GitHub Actions (CI + daily-push workflow).
- Dependency overrides for security/compat: glob, lru-cache, @sentry/node (package.json overrides).

------------------------------------------------------------------------------
5) End-to-End Workflows
------------------------------------------------------------------------------
A) Admin flow (create and manage election)
1) Create election via ElectionFactory (frontend CreateElection or scripts).
2) Upload allowlist to backend (admin UI) and sync Merkle root on-chain.
3) Add candidates during commit phase.
4) Advance to reveal phase.
5) Advance to finished phase; read results and optionally reset.

B) Voter flow (main election)
1) Connect wallet.
2) Complete KYC (Voter ID -> OTP -> Face verification).
3) Fetch Merkle proof from backend.
4) Commit vote (hash of candidate + salt).
5) Reveal vote in reveal phase using the same candidate + salt.
6) View tally.

C) Demo flow (open enrollment)
1) User clicks Join Demo on landing page.
2) Backend auto-joins address into allowlist and optionally funds gas.
3) Merkle root is synced on-chain by backend if configured.
4) Voter commits and reveals without KYC.
5) Demo scheduler can auto-advance phases.

------------------------------------------------------------------------------
6) Smart Contracts (What each does and why)
------------------------------------------------------------------------------
contracts/BharatVote.sol
- Main election contract with commit-reveal and Merkle proof eligibility.
- Uses Initializable (OpenZeppelin) for clone-based initialization.
- Key state: admin, name, phase (0,1,2), candidates, merkleRoot, commits, tally.
- Key admin functions: setMerkleRoot, addCandidate, removeCandidate, startReveal, finishElection, resetElection, emergencyReset, clearAllCandidates.
- Key voter functions: commitVote, revealVote.
- Key design reasons: privacy (commit-reveal), eligibility (Merkle proof), reset for repeated demos.

contracts/BharatVoteWithIPFS.sol
- Extends BharatVote concept with IPFS references for KYC, voter list, results, audit trail.
- Adds ElectionData struct and archived elections list.
- Stores candidate metadata IPFS hashes.
- Reason: keep large or sensitive data off-chain, but verifiable via on-chain hashes.

contracts/ElectionFactory.sol
- Factory contract that clones BharatVote implementation using OpenZeppelin Clones.
- createElection(name) clones implementation and calls initialize.
- Reason: cheaper deployments and multiple elections without redeploying full logic.

contracts/Lock.sol
- Standard Hardhat sample contract (time-locked funds). Mostly for template/testing.

contracts/CommitVote.sol
- Stub placeholder header for commit-reveal (no implementation).

------------------------------------------------------------------------------
7) Backend (What it does and why)
------------------------------------------------------------------------------
backend/server.js (main backend)
- Express API that serves KYC, Merkle proof, allowlist management, and demo automation.
- Supports two modes:
  - Demo election (auto-join, auto-fund, auto-sync merkle root).
  - Main elections (admin uploads allowlist per election).
- Key endpoints:
  - GET /api/kyc: mock KYC lookup.
  - GET /api/merkle-root: returns merkle root for an election.
  - GET /api/merkle-proof/:address: returns Merkle proof for an address.
  - POST /api/admin/voter-list: admin uploads allowlist for a specific election.
  - GET /api/admin/voter-list/:electionAddress: allowlist summary.
  - POST /api/join: demo enrollment and gas funding.
  - GET /api/demo/status: demo timer status.
  - POST /api/demo/tick: manual trigger for demo scheduler.
  - GET /api/demo/analytics: demo analytics counts.
- Key features:
  - Merkle tree generation with correct hashing (solidityPackedKeccak256).
  - Demo auto-phasing with timers and transaction confirmations.
  - Analytics scanning using event topics and optional Upstash storage.
  - Allowlist persistence in backend/voter-lists.json (created at runtime).

backend/server-with-ipfs.js (IPFS-enabled backend)
- Similar API, but uses Pinata to store KYC data, voter list, results, and audit trail on IPFS.
- Adds IPFS references returned to clients and stored on-chain if needed.
- Rate limiting + helmet for security.

backend/ipfs-service.js
- Encapsulates Pinata API calls.
- Supports JSON pinning, file pinning, audit log creation, listing/unpinning.
- Uses axios and form-data.

backend/kyc-data.json
- Mock KYC database mapping voterId -> address.

backend/server.test.js
- Jest + Supertest tests for KYC, Merkle proof, security, performance.

------------------------------------------------------------------------------
8) Frontend (What it does and why)
------------------------------------------------------------------------------
Routing
- frontend/src/App.tsx defines routes:
  - /: Landing page (create or join election)
  - /election/:address: election UI (admin or voter)

Wallet handling
- frontend/src/useWallet.ts handles MetaMask connection, network switching, contract attachment.
- Enforces correct chain ID (defaults to Sepolia unless overridden).

KYC and identity flow
- frontend/src/KycPage.tsx handles Voter ID input, OTP, face verification, and persists success in localStorage.
- Mock OTP uses 123456.

Voting flow
- frontend/src/Voter.tsx handles commit and reveal actions.
- Uses backend Merkle proofs and on-chain commit verification.
- Includes demo auto-join and safety checks.

Admin flow
- frontend/src/Admin.tsx is the primary admin console in current app.
- Features: candidate management, phase transitions, allowlist upload, merkle root sync, reset and emergency reset.

Tally and results
- frontend/src/Tally.tsx reads candidates and votes from contract and renders results.
- frontend/src/components/PublicResults.tsx provides read-only results without wallet using public RPC and event scanning.

Design system
- Tailwind CSS utility classes in frontend/src/index.css define custom buttons, cards, badges, etc.
- Material UI used for some layouts and interactive elements.

Internationalization
- frontend/src/i18n.tsx provides dictionary-based translations (en, hi, ta).

Face recognition
- frontend/src/components/FaceRecognition.tsx uses face-api.js with fallback demo mode.

Demo support
- DemoTimerBanner displays demo phase countdown from backend.

------------------------------------------------------------------------------
9) Scripts and Operational Commands
------------------------------------------------------------------------------
Root package.json scripts
- compile: npx hardhat compile
- node: npx hardhat node
- deploy: deploys BharatVote + ElectionFactory and writes ABI/address to frontend
- test: runs contract + backend + frontend tests
- test:integration: runs contract + e2e tests
- dev:all: run node + backend + frontend concurrently

Deployment scripts (scripts/)
- deploy.ts: local deployment (clone-based) and ABI export to frontend.
- deploy-demo.ts: demo deployment with sample candidates.
- deploy-with-ipfs.ts: deploys BharatVoteWithIPFS and loads IPFS hashes.
- deploy_sepolia.js: deploys to Sepolia using env vars.
- quick-deploy.js: quick local deployment with test merkle root and basic checks.
- set-merkle-root.ts: fetches backend root and sets it on-chain.
- test-ipfs-integration.js: tests Pinata IPFS pipeline.
- utils/killPorts.ts: stops Vite if running; checks Hardhat port.
- daily-push.ps1 / update-weekly-progress.ps1: automation for git and reports.

------------------------------------------------------------------------------
10) Testing and QA
------------------------------------------------------------------------------
Contract tests
- test/BharatVote.ts: deploys implementation + factory and tests commit/reveal, phases, tallies, and resets.

Backend tests
- backend/server.test.js: tests KYC, Merkle proof, security, performance.

Frontend tests
- frontend/src/KycPage.test.tsx: tests KYC UI flow and error handling.
- frontend/src/components/PrimaryButton.test.tsx: component tests.
- frontend/src/utils/publicResultsEvents.test.ts: event decode tests.
- frontend/src/test/AdminRoot.test.tsx: ensures merkle root sync button works.
- frontend/src/test/setup.ts: test environment mocks.

Integration tests
- tests/integration.test.js: basic end-to-end checks against local backend and Hardhat node.
- tests/package.json includes Playwright deps for extended e2e.

Automated test runner
- test-runner.js orchestrates install, start node, deploy, start backend, run tests, and cleanup.

------------------------------------------------------------------------------
11) Configuration and Environment Variables
------------------------------------------------------------------------------
Root .env
- Stores PRIVATE_KEY, RPC URLs, and demo configuration (do not commit real secrets).

frontend/env.example
- Example VITE_* variables for chain, RPC, backend, and demo.
- RPC URLs can come from Alchemy, Infura, Ankr, or any compatible provider.
- Backend URL can point to local Express or hosted services like Render.

hardhat.config.ts
- Localhost and Sepolia networks, Etherscan config, TypeChain output.

------------------------------------------------------------------------------
12) Generated/Derived Artifacts (Not hand-edited)
------------------------------------------------------------------------------
These are produced by builds or tooling and are not manually edited:
- artifacts/ and cache/ (Hardhat build output)
- typechain-types/ (Hardhat TypeChain bindings for root TS)
- frontend/src/typechain-types/ (TypeChain bindings for frontend usage)
- node_modules/ (dependencies)
- package-lock.json / pnpm-lock.yaml (lock files)

------------------------------------------------------------------------------
13) File-by-File Inventory (Purpose of every file)
------------------------------------------------------------------------------
Note: Paths are relative to repo root. Generated outputs are marked as [generated].

ROOT CONFIG AND META
- .env: environment secrets and runtime config (keep private).
- .gitignore: ignores build and secret files.
- .npmrc: npm settings.
- package.json: root scripts and dependencies for Hardhat and tooling.
- package-lock.json: npm lock file [generated].
- pnpm-lock.yaml: pnpm lock file [generated].
- tsconfig.json: TS config for scripts/tests/typechain.
- hardhat.config.ts: Hardhat compiler/network config.
- vercel.json: SPA rewrite rules for hosting.
- npx: empty placeholder file.
- taskkill: empty placeholder file.

ROOT DOCUMENTATION FILES
- README.md: project quick start and overview.
- COMPLETE_PACKAGE_CREATED.md: detailed Week 1 package and presentation guide summary.
- FINAL_COMPLETION_REPORT.md: week completion report for backend setup.
- PROGRESS_ANALYSIS.md: progress analysis report.
- DOCUMENTATION_SUMMARY.md: UI/UX doc delivery summary.
- UI_UX_Design_Documentation.md: full UI/UX design documentation.
- Usability_Test_Report_Realistic.md: usability test results.
- CLICKABILITY_TEST_CHECKLIST.md: checklist for UI test flows.
- PREMIUM_UI_UPGRADE.md: UI polish and improvements summary.
- FIXES_SUMMARY.md: frontend fixes summary.
- FIX_BLOCK_TAG_ERROR.md: troubleshooting for invalid block tag error.
- FIX_CONTRACT_ERROR.md: troubleshooting contract call failure.
- TROUBLESHOOT_CONTRACT_ERROR.md: troubleshooting contract errors.
- DEPLOYMENT_CHANGES_SUMMARY.md: notes on deployment adjustments.
- START_LOCAL_DEMO.md: quick-start local demo guide.
- LOCAL_DEPLOYMENT_CHECKLIST.md: checklist for local deployment readiness.
- VERIFICATION_SUMMARY.md: local deployment verification summary.
- ARCHITECTURE_LOCAL_DEPLOYMENT.md: local deployment architecture and flows.
- DEMO_SETUP_GUIDE.md: demo setup steps for showing the system.
- METAMASK_SETUP_GUIDE.md: MetaMask setup for local Hardhat network.
- HARDHAT_TEST_ACCOUNTS.md: list of Hardhat test accounts and keys.
- TESTING.md: overall testing suite guide.
- TEST_EXECUTION_SUMMARY.md: summary of test runs.
- TEST_RESULTS_COMPREHENSIVE.md: detailed test results report.
- TESTNET_DEPLOY_CHECKLIST.md: checklist for testnet deployment.
- BACKEND_8WEEK_ROADMAP.md: backend and Solidity 8-week plan.
- FRONTEND_8WEEK_ROADMAP.md: frontend 8-week plan.
- ROADMAP_VERIFICATION_REPORT.md: verification of roadmap completeness.
- API_Integration_Planning_Documentation.md: API integration planning details.
- API_Integration_Planning_Deliverables.md: API integration deliverables.
- API_Integration_Planning_Corrected.md: corrected API plan.
- API_Integration_Planning_Final.md: final API integration plan.
- CONTRACT_COMPARISON.md: comparison of contract versions.
- BLOCKCHAIN_DATA_STORAGE_ANALYSIS.md: analysis of storage choices.
- IPFS_INDEX.md: index of IPFS docs.
- IPFS_INTEGRATION_GUIDE.md: IPFS integration guide.
- IPFS_IMPLEMENTATION_SUMMARY.md: IPFS implementation summary.
- IPFS_QUICK_SETUP.md: quick IPFS setup steps.
- README_IPFS_IMPLEMENTATION.md: IPFS implementation readme.
- GITHUB_AUTOMATION_SETUP.md: GitHub automation setup.
- CAPSTONE_REPORT_FINAL.md: final capstone report.
- Updated_Resume_Archee_Arjun.md: resume document.
- BharatVote_Sequence_Diagrams.puml: PlantUML sequence diagrams for KYC, voting, admin, and audit flows.

ROOT DATA FILES
- eligibleVoters.json: list of eligible voter addresses (used for Merkle tree).

BACKEND (backend/)
- backend/package.json: backend dependencies and scripts.
- backend/package-lock.json: backend npm lock file [generated].
- backend/pnpm-lock.yaml: backend pnpm lock file [generated].
- backend/server.js: main backend API with demo features.
- backend/server-with-ipfs.js: IPFS-enabled backend API.
- backend/ipfs-service.js: Pinata/IPFS helper class.
- backend/kyc-data.json: mock KYC data.
- backend/server.test.js: backend API tests.
- backend/node_modules/: backend dependencies [generated].

CONTRACTS (contracts/)
- contracts/BharatVote.sol: core commit-reveal election contract.
- contracts/BharatVoteWithIPFS.sol: IPFS-enhanced election contract.
- contracts/ElectionFactory.sol: clone factory for elections.
- contracts/Lock.sol: sample Hardhat contract.
- contracts/CommitVote.sol: placeholder for commit-reveal logic header.

SCRIPTS (scripts/)
- scripts/README.md: scripts overview and usage.
- scripts/deploy.ts: local deployment script for BharatVote + factory + ABI export.
- scripts/deploy-demo.ts: demo deployment with sample candidates.
- scripts/deploy-with-ipfs.ts: deployment for IPFS variant.
- scripts/deploy_sepolia.js: Sepolia deployment script.
- scripts/quick-deploy.js: quick local deployment for testing.
- scripts/set-merkle-root.ts: updates on-chain merkle root from backend.
- scripts/test-ipfs-integration.js: tests IPFS/Pinata integration.
- scripts/daily-push.ps1: git commit and push automation.
- scripts/update-weekly-progress.ps1: creates weekly progress report templates.
- scripts/utils/killPorts.ts: checks Hardhat port and stops Vite if running.

TESTS (test/ and tests/)
- test/BharatVote.ts: Hardhat contract tests.
- tests/package.json: integration test package.
- tests/package-lock.json: lock file [generated].
- tests/integration.test.js: integration and health checks.
- test-runner.js: automated test orchestration.

FRONTEND ROOT (frontend/)
- frontend/package.json: frontend dependencies and scripts.
- frontend/package-lock.json: frontend npm lock [generated].
- frontend/pnpm-lock.yaml: frontend pnpm lock [generated].
- frontend/README.md: Vite + React template notes and local dev steps.
- frontend/index.html: HTML entry for Vite app.
- frontend/vite.config.ts: Vite config with polyfills and test setup.
- frontend/tailwind.config.js: Tailwind config and custom palette.
- frontend/postcss.config.js: PostCSS config.
- frontend/postcss.config.cjs: alternate PostCSS config.
- frontend/eslint.config.js: ESLint config.
- frontend/env.example: example VITE_* environment variables.
- frontend/vercel.json: SPA rewrites for hosting.
- frontend/cs notes.txt: study notes and KYC reasoning.
- frontend/del: empty placeholder file.
- frontend/npm: empty placeholder file.
- frontend/rmdir: empty placeholder file.

FRONTEND PUBLIC (frontend/public/)
- frontend/public/vite.svg: default Vite asset.
- frontend/public/models/tiny_face_detector_model-weights_manifest.json: face-api model manifest.
- frontend/public/models/tiny_face_detector_model-shard1: face-api model weights.

FRONTEND SRC (frontend/src/)
- frontend/src/main.tsx: app bootstrap, providers, and router.
- frontend/src/App.tsx: routing and main election UI.
- frontend/src/App.css: legacy global styles (not imported in App.tsx).
- frontend/src/index.css: Tailwind base + component utilities + animations.
- frontend/src/index.css.backup: backup of earlier Tailwind styling.
- frontend/src/Admin.tsx: current admin UI with allowlist, merkle sync, phases.
- frontend/src/Admin.css: legacy admin styles.
- frontend/src/Voter.tsx: voter UI for commit and reveal.
- frontend/src/Voter.css: empty placeholder.
- frontend/src/Tally.tsx: tally UI using MUI.
- frontend/src/KycPage.tsx: KYC flow with OTP and face verification.
- frontend/src/KycPage.test.tsx: KYC flow tests.
- frontend/src/SimpleApp.tsx: simplified debug app.
- frontend/src/DiagnosticApp.tsx: diagnostic app for debugging UI.
- frontend/src/abi.ts: exports ABI and contract address from JSON.
- frontend/src/bharatVoteContract.ts: helper to create contract instance.
- frontend/src/constants.ts: constants and error messages.
- frontend/src/crypto.ts: commit hash generation and verification.
- frontend/src/polyfills.ts: Buffer/process polyfills for browser.
- frontend/src/useWallet.ts: MetaMask connection and contract attach logic.
- frontend/src/i18n.tsx: language dictionaries and i18n provider.
- frontend/src/vite-env.d.ts: Vite type reference.

FRONTEND SRC COMPONENTS (frontend/src/components/)
- AdminPanel.tsx: alternate admin UI (MUI-based) with translation tools.
- Alert.tsx: simple alert banner.
- Breadcrumb.tsx: breadcrumb UI.
- CreateElection.tsx: UI for creating elections via factory.
- DemoTimerBanner.tsx: demo phase timer status.
- FaceRecognition.tsx: face detection module.
- Header.tsx: app header with phase, network, language.
- KYCForm.tsx: legacy KYC form component.
- LandingPage.tsx: landing page for create/join/demo.
- Layout.tsx: basic layout wrapper.
- MainContainer.tsx: max-width content wrapper.
- Modal.tsx: reusable modal.
- NetworkStrip.tsx: network/account/contract info strip.
- NetworkSwitcher.tsx: network switch UI (local).
- OTPModal.tsx: OTP dialog.
- PhaseBadge.tsx: phase label badge.
- PrimaryButton.tsx: reusable button.
- PrimaryButton.test.tsx: button tests.
- PublicResults.tsx: read-only public results component.
- ServiceDashboard.tsx: service tiles layout.
- ServiceTile.tsx: tile for a service.
- Stepper.tsx: simple stepper.
- StepWizard.tsx: MUI step wizard for phases.
- Toast.tsx: toast notifications.

FRONTEND SRC UTILS (frontend/src/utils/)
- candidateLabels.ts: store candidate name translations in localStorage.
- chain.ts: chain ID parsing and MetaMask add/switch config.
- contract.ts: factory and election contract helpers.
- publicResultsEvents.ts: decodes VoteRevealed event data.
- publicResultsEvents.test.ts: tests for event decode.

FRONTEND SRC TYPES (frontend/src/types/)
- admin.ts: Admin prop and state types.
- app.ts: app-level state types.
- candidates.ts: candidate types.
- contracts.ts: typed BharatVote contract interface.
- crypto.ts: commit/reveal types.
- events.ts: contract event types.
- tally.ts: tally types.
- vote-form.ts: voting form types.
- voting.ts: voting panel types.
- wallet.ts: wallet state types.

FRONTEND SRC TESTS (frontend/src/test/)
- frontend/src/test/setup.ts: vitest setup and mocks.
- frontend/src/test/AdminRoot.test.tsx: admin merkle sync test.

FRONTEND CONTRACT ARTIFACTS
- frontend/src/contracts/BharatVote.json: ABI + deployed address (written by deploy scripts).
- frontend/src/assets/react.svg: Vite starter asset.

TYPECHAIN (root typechain-types/ and frontend/src/typechain-types/) [generated]
- These directories contain TypeScript bindings for smart contracts and OpenZeppelin libs.
- They are generated by Hardhat + TypeChain and should not be hand-edited.

------------------------------------------------------------------------------
14) Quick Command Cheat Sheet
------------------------------------------------------------------------------
Local dev
- npx hardhat node
- npm run deploy
- cd backend && npm start
- cd frontend && npm run dev

Tests
- npm run test
- npm run test:contracts
- npm run test:backend
- npm run test:frontend
- npm run test:e2e (from root)

------------------------------------------------------------------------------
15) Notes on Legacy/Alternate Files
------------------------------------------------------------------------------
- frontend/src/components/AdminPanel.tsx is an alternate admin UI; App.tsx currently uses frontend/src/Admin.tsx.
- frontend/src/App.css and Admin.css appear legacy and are not used in the current UI (App.tsx removed App.css import).
- frontend/src/SimpleApp.tsx and DiagnosticApp.tsx are debug-only helpers.
- Empty files (npx, taskkill, frontend/del, frontend/npm, frontend/rmdir) look like placeholders.

------------------------------------------------------------------------------
End of document.
