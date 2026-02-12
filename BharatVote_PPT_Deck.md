# BharatVote PPT Deck (Comprehensive - Deep Content)

Slide 1: Title
- Project Title: BharatVote - Decentralized Digital Voting Platform
- Student Name(s) and Roll Number(s): [Name - Roll No], [Name - Roll No]
- Program: BSc Computer Science (Online Mode)
- Institution: [Institution Name]
- Academic Year: [YYYY-YYYY]
- Internal Supervisor: [Supervisor Name]
- Tagline: Secure, verifiable voting with commit-reveal and Merkle eligibility
- Status: Capstone demo-ready on local + Sepolia testnet (report last updated 2026-02-04)

Slide 2: Agenda
- Problem and motivation
- Objectives and scope
- Solution overview
- Architecture and data flow
- Modules and core logic
- Tech stack and UI/UX
- IPFS extension
- Testing and validation
- Deployment and demo
- Achievements, evidence, and future work

Slide 3: Problem and Motivation
- Centralized e-voting requires full trust in administrators for voter lists, secrecy, and results
- Low auditability means citizens cannot independently verify outcomes
- High impact of tampering if a single database or admin is compromised
- Voting needs privacy during the election and transparency after the election
- Goal: build a verifiable, tamper-resistant, privacy-preserving system using blockchain and applied cryptography

Slide 4: Objectives and Scope
- Implement election smart contracts with phases, candidate management, and tallying
- Enforce eligibility with Merkle proof verification to avoid expensive on-chain allowlists
- Build a web DApp for admin and voter workflows with clear UI paths
- Provide public demo on Sepolia testnet with cloud hosting and live URLs
- Validate with automated tests plus manual verification
- Scope is academic demo, not production elections (explicit non-production limitations)

Slide 5: Solution Overview
- End-to-end DApp: smart contracts, frontend, backend, and analytics
- Commit-reveal voting keeps votes secret during Commit phase and verifiable during Reveal
- Merkle eligibility allows scalable allowlists without storing full lists on-chain
- Admin creates elections, manages candidates, and controls phases
- Voters join, commit, reveal, and view results
- Demo mode supports open enrollment and backend-assisted join for smooth presentations

Slide 6: System Architecture
- Actors: Admin, Voter, Public Viewer
- Frontend: React + Vite DApp, MetaMask wallet, ethers.js for blockchain calls
- Backend: Express APIs for mock KYC, Merkle proofs, demo join, analytics
- Blockchain: Hardhat local node for dev and Sepolia testnet for public demo
- Persistence: Upstash Redis REST for demo analytics (optional)
- Local ports: Frontend 5173, Backend 3001, Hardhat 8545 (typical setup)

Slide 7: Data Flow (End-to-End)
- Admin deploys election (factory or scripts) and uploads allowlist
- Backend builds Merkle tree and returns Merkle root
- Admin sets Merkle root on-chain
- Voter completes mock KYC (Voter ID, OTP 123456, face verification)
- Voter requests Merkle proof and commits hash(candidate + salt) on-chain
- Admin advances to Reveal phase
- Voter reveals candidate + salt; contract verifies hash and counts vote
- Tally is read from contract and shown in results UI

Slide 8: Smart Contract Design
- BharatVote.sol: main election contract with commit-reveal + Merkle eligibility
- ElectionFactory.sol: clone-based factory (EIP-1167) to create elections cheaply
- BharatVoteWithIPFS.sol: extension storing IPFS hashes for KYC, voter lists, results, audit trail
- State model: admin, election name, phase (uint8), candidates, merkleRoot, commits, tally
- Admin functions: setMerkleRoot, addCandidate, removeCandidate, startReveal, finishElection, resetElection, emergencyReset, clearAllCandidates
- Voter functions: commitVote, revealVote
- Design choices: custom errors for gas savings, uint8 for compact phase storage

Slide 9: Security and Integrity
- Commit-reveal protects ballot secrecy and prevents early influence
- Merkle proofs ensure only eligible addresses can vote without storing full lists
- Phase-based controls prevent out-of-order operations
- Mock KYC enforces a realistic identity flow without real data exposure
- Face recognition demo uses face-api.js with fallback detection for reliability
- Explicit non-production stance to avoid overstating security claims

Slide 10: Backend Services
- Core API: Express microservice for KYC checks and Merkle proofs
- Key endpoints: /api/kyc, /api/merkle-root, /api/merkle-proof/:address
- Admin endpoints: /api/admin/voter-list, /api/admin/voter-list/:electionAddress
- Demo endpoints: /api/join, /api/demo/status, /api/demo/tick, /api/demo/analytics
- Merkle tree generation uses solidityPackedKeccak256-compatible hashing
- Demo features: auto-join, optional gas funding, auto-phase scheduler
- Security: helmet and rate limiting in IPFS-enabled backend

Slide 11: Frontend Experience
- Routes: landing page for create/join, election page by address
- Admin panel: candidate management, phase controls, allowlist upload, merkle sync, reset
- Voter panel: KYC flow, commit and reveal, safety warnings for salt
- Results: Tally page + PublicResults for read-only view using public RPC
- Wallet handling: useWallet hook for MetaMask, chain switching, contract attachment
- Multi-language support: English, Hindi, Tamil via i18n dictionary
- Demo UX: timer banner, auto-join flow, and streamlined onboarding

Slide 12: UI/UX and Usability
- Documented wireframes and high-fidelity design system
- Clickability checklist for KYC, Voter Dashboard, Admin Panel, Results, Navigation
- Usability test report: participants n=6 (4 team, 2 external CS students)
- Test environment: local Hardhat, Chrome primary, Firefox secondary
- Quick fixes applied based on findings (commit confirmation, reveal button, OTP flow)
- Premium UI polish: clear typography hierarchy, cards, button states, micro-interactions

Slide 13: IPFS Integration (Extension)
- Problem: centralized off-chain data creates integrity risk for KYC lists and results archives
- Solution: store large artifacts on IPFS and keep hashes on-chain
- BharatVoteWithIPFS.sol adds IPFS references for KYC, voter list, results, audit trail
- backend/ipfs-service.js handles Pinata pinning and retrieval
- backend/server-with-ipfs.js exposes IPFS-backed flows
- Benefit: tamper-evident data with minimal on-chain storage

Slide 14: Testing and Validation
- Smart contract tests: Hardhat + Chai
- Backend tests: Jest + Supertest
- Frontend tests: Vitest + React Testing Library
- Integration tests: tests/integration.test.js and Playwright in tests package
- Automated runner: test-runner.js orchestrates node, deploy, backend, tests, cleanup
- Comprehensive report (Oct 23, 2025): contracts 25/25 pass, backend 17/17 pass
- Frontend report: 12/21 pass (57%) with partial coverage noted
- Overall execution summary: 95% pass and system operational status

Slide 15: Deployment and Demo
- Local demo: npm run node, npm run deploy, backend on 3001, frontend on 5173
- Testnet demo: Sepolia deployment using RPC and deployer key
- Hosting: Vercel for frontend, Render for backend
- Demo flow: Join -> Commit -> Reveal -> Results
- URLs and addresses: [Vercel URL], [Render URL], [Factory 0x...], [Demo 0x...]
- Public RPC support: Alchemy/Infura/Ankr or public Sepolia RPC

Slide 16: Operations and Automation
- Daily push script: auto-commit and push with timestamps
- Weekly progress update script: generates week-based progress summaries
- Roadmap verification report: 8-week plans aligned with actual code (strong match)
- Progress analysis report: ~88% complete as of 2024-12-19
- Clear separation of generated artifacts vs hand-edited source

Slide 17: Achievements and Evidence
- Capstone report draft fully structured in CAPSTONE_REPORT_FINAL.md
- Architecture and deployment documents present and detailed
- Testing evidence: TEST_RESULTS_COMPREHENSIVE.md and TEST_EXECUTION_SUMMARY.md
- Local demo checklist and setup guides provided
- Security and troubleshooting playbooks documented
- Verification summary confirms all required components operational locally

Slide 18: Conclusion and Future Work
- Delivered a complete decentralized voting demo with verifiability and privacy
- Key strengths: commit-reveal secrecy, Merkle eligibility, clear admin and voter workflows
- Limitations: mock KYC, testnet-only deployment, RPC rate limits, no formal audit
- Future scope: production KYC, scalability improvements, formal audit, zk-proofs, stronger UX

Slide 19: Demo and Q and A
- Live walkthrough: connect wallet, join election, commit vote, reveal, show results
- Highlight privacy: vote hidden in Commit and counted only after Reveal
- Show admin phase control and candidate management
- Showcase public results view without wallet
- Open Q and A
