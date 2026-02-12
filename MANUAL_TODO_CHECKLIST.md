# BharatVote Manual Completion Checklist (One Sitting Order)

## Evidence Policy (Max 14 Images Total)
REQUIRED (13):
- Fig 2.1 Architecture (export from diagrams/figure-2-1-architecture.mmd)
- Fig 2.2 Data Flow (export from diagrams/figure-2-2-data-flow.mmd)
- Fig 2.6 Admin UI (hosted Vercel URL visible + MetaMask Sepolia)
- Fig 2.7 Voter UI (eligibility + voting panel)
- Fig 2.8 Commit state
- Fig 2.9 Reveal state
- Fig 2.10 Results/tally
- Fig 3.1 Contract tests passing (single terminal screenshot)
- Fig 3.2 Backend tests passing OR API curl/Postman proof (single screenshot)
- Fig 4.1 Vercel deployment page (prod deployment visible)
- Fig 4.2 Render service page (service URL/status visible)
- Fig 4.3 Sepolia explorer page for ONE successful tx (deployment or vote)
- Fig 5.1 GitHub commit history screenshot

OPTIONAL (choose ONE to keep max 14):
- Fig 2.3 Lifecycle diagram (export from diagrams/figure-2-3-lifecycle.mmd)
OR
- Fig 3.3 Coverage summary screenshot (ONLY if coverage exists)

## 0) Identity + Cover Page (fast fields)
- [ ] ID: MANUAL_NAME_01
  Location: COVER PAGE (Snippet: "Student Name(s) & Roll Number(s): <<MANUAL_NAME_01: Insert student name(s) and roll number(s)>>")
  What to insert: Insert your full name(s) and roll number(s) exactly as per enrollment records.
  Steps: Open your official enrollment/ID record, copy the exact name(s) and roll number(s), and paste into the cover page fields.
  Evidence file: evidence/notes/identity.txt (optional)
  Screenshot must show: Not required (text-only field).
- [ ] ID: MANUAL_ORG_01
  Location: COVER PAGE (Snippet: "Institution Name: <<MANUAL_ORG_01: Insert institution name>>")
  What to insert: Insert the official institution name as used by your program.
  Steps: Check your university/college letterhead or portal, copy the official institution name, and paste here.
  Evidence file: evidence/notes/identity.txt (optional)
  Screenshot must show: Not required (text-only field).
- [ ] ID: MANUAL_DATE_01
  Location: COVER PAGE (Snippet: "Academic Year: <<MANUAL_DATE_01: Insert academic year (YYYY-YYYY)>>")
  What to insert: Insert the academic year in YYYY-YYYY format.
  Steps: Confirm the academic year from your program schedule or portal and paste it in the requested format.
  Evidence file: evidence/notes/identity.txt (optional)
  Screenshot must show: Not required (text-only field).
- [ ] ID: MANUAL_SUP_01
  Location: COVER PAGE (Snippet: "Internal Supervisor Name: <<MANUAL_SUP_01: Insert supervisor name>>")
  What to insert: Insert the internal supervisor name shown on your capstone records.
  Steps: Check your allocation email or capstone portal and copy the supervisor name.
  Evidence file: evidence/notes/identity.txt (optional)
  Screenshot must show: Not required (text-only field).
- [ ] ID: MANUAL_SIG_01
  Location: Declaration (Snippet: "Student Signature(s): <<MANUAL_SIG_01: Insert student signature(s)>>")
  What to insert: Insert your signature(s) for the declaration.
  Steps: If using a typed signature, type your name(s). If using an image, insert a scanned signature image in Word at this location.
  Evidence file: evidence/notes/identity.txt (optional)
  Screenshot must show: Not required (text-only field).
- [ ] ID: MANUAL_DATE_02
  Location: Declaration (Snippet: "Date: <<MANUAL_DATE_02: Insert declaration date>>")
  What to insert: Insert the declaration date (the date you sign).
  Steps: Use the actual date you finalize the report and enter it in the date field.
  Evidence file: evidence/notes/identity.txt (optional)
  Screenshot must show: Not required (text-only field).

## 1) Links Pack (collect once, reuse everywhere)
- [ ] ID: MANUAL_LINK_01
  Location: 4.2.5 Cloud deployment summary (Snippet: "- Frontend URL: <<MANUAL_LINK_01: Deployed frontend URL>>")
  What to insert: Insert the deployed frontend URL (Vercel production URL).
  Steps: Open the Vercel dashboard, open the BharatVote project, and copy the production URL from the project overview.
  Evidence file: evidence/links/vercel-frontend-url.txt
  Screenshot must show: Vercel project page with production URL visible.
- [ ] ID: MANUAL_LINK_02
  Location: 4.2.5 Cloud deployment summary (Snippet: "- Backend URL: <<MANUAL_LINK_02: Backend URL>>")
  What to insert: Insert the deployed backend URL (Render service URL).
  Steps: Open the Render dashboard, open the backend service, and copy the service URL from the top of the page.
  Evidence file: evidence/links/render-backend-url.txt
  Screenshot must show: Render service page with URL and service name visible.
- [ ] ID: MANUAL_LINK_03
  Location: 4.2.5 Cloud deployment summary (Snippet: "- Explorer contract link: <<MANUAL_LINK_03: Etherscan contract link>>")
  What to insert: Insert the Sepolia explorer link for the deployed contract address.
  Steps: Take the contract address from `frontend/.env` (VITE_DEMO_ELECTION_ADDRESS) or your deployment output, search it on a Sepolia explorer, and copy the contract address page URL.
  Evidence file: evidence/links/explorer-contract-url.txt
  Screenshot must show: Explorer contract page with address and network visible (Sepolia).
- [ ] ID: MANUAL_LINK_04
  Location: 5.1 Version control evidence (Snippet: "GitHub repository link: <<MANUAL_LINK_04: GitHub repository URL>>")
  What to insert: Insert the GitHub repository URL for this project.
  Steps: Open the GitHub repo in a browser and copy the URL from the address bar.
  Evidence file: evidence/links/github-repo-url.txt
  Screenshot must show: Repo homepage with repo name and URL visible.
- [ ] ID: MANUAL_LINK_05
  Location: 4.2.5 Cloud deployment summary (Snippet: "Demo video link: <<MANUAL_LINK_05: Demo video URL>>")
  What to insert: Insert the demo video URL.
  Steps: Upload the demo video to your preferred platform and copy the shareable link.
  Evidence file: evidence/links/demo-video-url.txt
  Screenshot must show: Video page with title and URL visible.

- [ ] ID: Etherscan-TX-PROOFS
  Location: (links pack - supporting evidence for Figure 4.3)
  What to insert: Collect ONE Sepolia transaction URL (deployment or vote) for Figure 4.3.
  Steps: Open the successful tx hash in a Sepolia explorer and copy the URL into `evidence/links/etherscan-tx-proof.txt`.
  Evidence file: evidence/links/etherscan-tx-proof.txt
  Screenshot must show: Explorer page with tx hash, success status, Sepolia network, and URL bar visible.
## 1) Links Pack (collect once, reuse everywhere) - Environment Variables
- [ ] ID: MANUAL_ENV_01
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `VITE_FACTORY_ADDRESS` | Sepolia factory contract address | <<MANUAL_ENV_01: VITE_FACTORY_ADDRESS=...>> |")
  What to insert: Insert the Sepolia factory contract address.
  Steps: Use the factory address from your deployment output or `frontend/.env` (VITE_FACTORY_ADDRESS).
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).
- [ ] ID: MANUAL_ENV_02
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `VITE_DEMO_ELECTION_ADDRESS` | Demo election contract address | <<MANUAL_ENV_02: VITE_DEMO_ELECTION_ADDRESS=...>> |")
  What to insert: Insert the demo election contract address.
  Steps: Use `VITE_DEMO_ELECTION_ADDRESS` from `frontend/.env` or your deployment output.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).
- [ ] ID: MANUAL_ENV_03
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `VITE_BACKEND_URL` | Backend base URL | <<MANUAL_ENV_03: VITE_BACKEND_URL=...>> |")
  What to insert: Insert the backend base URL used by the frontend.
  Steps: Use the Render service URL you copied for MANUAL_LINK_02 and paste here.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).
- [ ] ID: MANUAL_ENV_04
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `VITE_SEPOLIA_RPC_URL` | RPC URL for Sepolia | <<MANUAL_ENV_04: VITE_SEPOLIA_RPC_URL=...>> |")
  What to insert: Insert the Sepolia RPC URL used by frontend/backend.
  Steps: Use the RPC URL configured in `.env` (VITE_SEPOLIA_RPC_URL). Avoid exposing API keys in screenshots.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).
- [ ] ID: MANUAL_ENV_05
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `VITE_PUBLIC_RPC_URL` | Public read-only RPC URL | <<MANUAL_ENV_05: VITE_PUBLIC_RPC_URL=...>> |")
  What to insert: Insert the public read-only RPC URL used for analytics.
  Steps: Use `VITE_PUBLIC_RPC_URL` from `frontend/.env` (may be same as VITE_SEPOLIA_RPC_URL).
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).
- [ ] ID: MANUAL_ENV_06
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `PRIVATE_KEY` | Demo admin private key (backend) | <<MANUAL_ENV_06: PRIVATE_KEY=...>> |")
  What to insert: Insert "(secret; not shown)".
  Steps: Store the value in Vercel/Render secrets. Do not paste the secret into the report or screenshots.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (secret; do not capture).
- [ ] ID: MANUAL_ENV_07
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `RPC_URL` | Backend RPC URL (if different) | <<MANUAL_ENV_07: RPC_URL=...>> |")
  What to insert: Insert the backend RPC_URL if different from VITE_SEPOLIA_RPC_URL (optional).
  Steps: If you set RPC_URL separately in Render, paste it; otherwise leave blank or repeat VITE_SEPOLIA_RPC_URL and mark optional.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).
- [ ] ID: MANUAL_ENV_08
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `ADMIN_ADDRESS` | Optional admin address override | <<MANUAL_ENV_08: ADMIN_ADDRESS=...>> |")
  What to insert: Insert ADMIN_ADDRESS if used (optional override).
  Steps: If you explicitly set ADMIN_ADDRESS in backend env, paste it; otherwise mark as not used.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).
- [ ] ID: MANUAL_ENV_09
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `DEMO_ANALYTICS_RPC_URL` | RPC for analytics scan | <<MANUAL_ENV_09: DEMO_ANALYTICS_RPC_URL=...>> |")
  What to insert: Insert DEMO_ANALYTICS_RPC_URL if configured (optional).
  Steps: If set in backend env, paste it; otherwise mark as not used.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).
- [ ] ID: MANUAL_ENV_10
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `UPSTASH_REDIS_REST_URL` | Analytics persistence URL | <<MANUAL_ENV_10: UPSTASH_REDIS_REST_URL=...>> |")
  What to insert: Insert UPSTASH_REDIS_REST_URL if analytics persistence is enabled (optional).
  Steps: Copy from Upstash dashboard if used; otherwise mark as not used.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).
- [ ] ID: MANUAL_ENV_11
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `UPSTASH_REDIS_REST_TOKEN` | Analytics persistence token | <<MANUAL_ENV_11: UPSTASH_REDIS_REST_TOKEN=...>> |")
  What to insert: Insert "(secret; not shown)".
  Steps: Store the value in Vercel/Render secrets. Do not paste the secret into the report or screenshots.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (secret; do not capture).
- [ ] ID: MANUAL_ENV_12
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `VITE_PUBLIC_EVENTS_FROM_BLOCK` | Start block for event scan | <<MANUAL_ENV_12: VITE_PUBLIC_EVENTS_FROM_BLOCK=...>> |")
  What to insert: Insert VITE_PUBLIC_EVENTS_FROM_BLOCK (start block for event scan).
  Steps: Use the value from `frontend/.env` or the block number before the demo contract deployment.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).
- [ ] ID: MANUAL_ENV_13
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `VITE_PUBLIC_EVENTS_MAX_REQUESTS_PER_POLL` | Event scan requests per poll | <<MANUAL_ENV_13: VITE_PUBLIC_EVENTS_MAX_REQUESTS_PER_POLL=....")
  What to insert: Insert VITE_PUBLIC_EVENTS_MAX_REQUESTS_PER_POLL (scan tuning).
  Steps: Use the value from `frontend/.env`.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).
- [ ] ID: MANUAL_ENV_14
  Location: 4.2.5 Cloud deployment summary (Snippet: "| `VITE_PUBLIC_EVENTS_MAX_BLOCK_RANGE` | Max block span per scan | <<MANUAL_ENV_14: VITE_PUBLIC_EVENTS_MAX_BLOCK_RANGE=...>> |")
  What to insert: Insert VITE_PUBLIC_EVENTS_MAX_BLOCK_RANGE (scan tuning).
  Steps: Use the value from `frontend/.env`.
  Evidence file: evidence/env/env-values.txt (redact secrets)
  Screenshot must show: Not required (do not screenshot env pages; secrets stay in deployment settings).

## 2) Evidence Screenshots Pack (UI + Deployment + Explorer)
Use the Evidence Policy above. Total images must be <= 14.
- [ ] ID: MANUAL_FIG_06
  Location: 2.5 Screenshots / Code Snippets (Snippet: "<<MANUAL_FIG_06: Insert Admin page screenshot (PNG/JPG). Caption: Candidate and phase management.>>")
  What to insert: Figure 2.6 Admin UI (REQUIRED).
  Steps: Open the deployed Vercel app, switch MetaMask to Sepolia, open Admin panel, and capture the screen.
  Evidence file: evidence/ui/fig-2-6-admin.png
  Screenshot must show: URL bar with Vercel URL, MetaMask connected (address partially visible), Sepolia network indicator, admin controls visible.
- [ ] ID: MANUAL_FIG_07
  Location: 2.5 Screenshots / Code Snippets (Snippet: "<<MANUAL_FIG_07: Insert Voter page screenshot (PNG/JPG). Caption: Eligibility check and voting panel.>>")
  What to insert: Figure 2.7 Voter UI (REQUIRED).
  Steps: Open the deployed Vercel app, open the voter page with eligibility panel and voting section visible, then capture.
  Evidence file: evidence/ui/fig-2-7-voter.png
  Screenshot must show: URL bar with Vercel URL, MetaMask address partially visible, Sepolia network indicator, eligibility + voting panel visible.
- [ ] ID: MANUAL_FIG_08
  Location: 2.5 Screenshots / Code Snippets (Snippet: "<<MANUAL_FIG_08: Insert Commit flow screenshot (PNG/JPG). Caption: Commit input and submission.>>")
  What to insert: Figure 2.8 Commit state (REQUIRED).
  Steps: On Vercel app, enter candidate + salt and show the commit UI state before submitting; capture screen.
  Evidence file: evidence/ui/fig-2-8-commit.png
  Screenshot must show: URL bar with Vercel URL, MetaMask address partially visible, Sepolia network indicator, commit inputs + submit button.
- [ ] ID: MANUAL_FIG_09
  Location: 2.5 Screenshots / Code Snippets (Snippet: "<<MANUAL_FIG_09: Insert Reveal flow screenshot (PNG/JPG). Caption: Reveal input and submission.>>")
  What to insert: Figure 2.9 Reveal state (REQUIRED).
  Steps: After reveal phase starts, show reveal inputs (candidate + salt) and capture screen.
  Evidence file: evidence/ui/fig-2-9-reveal.png
  Screenshot must show: URL bar with Vercel URL, MetaMask address partially visible, Sepolia network indicator, reveal inputs + submit button.
- [ ] ID: MANUAL_FIG_10
  Location: 2.5 Screenshots / Code Snippets (Snippet: "<<MANUAL_FIG_10: Insert Results page screenshot (PNG/JPG). Caption: Current tally and all-time view.>>")
  What to insert: Figure 2.10 Results/tally (REQUIRED).
  Steps: Open results page showing current tally and all-time panel; capture screen.
  Evidence file: evidence/ui/fig-2-10-results.png
  Screenshot must show: URL bar with Vercel URL, MetaMask address partially visible, Sepolia network indicator, tally panels visible.
- [ ] ID: MANUAL_FIG_11
  Location: 3.3 Results & Analysis (Snippet: "<<MANUAL_FIG_11: Insert terminal screenshot for smart contract tests.>>")
  What to insert: Figure 3.1 Contract tests passing (REQUIRED).
  Steps: Run `npm run test:contracts` and capture the terminal with the command + passing summary.
  Evidence file: evidence/tests/fig-3-1-contract-tests.png
  Screenshot must show: Command line + pass summary in one screen.
- [ ] ID: MANUAL_FIG_12
  Location: 3.3 Results & Analysis (Snippet: "<<MANUAL_FIG_12: Insert terminal screenshot for backend tests.>>")
  What to insert: Figure 3.2 Backend tests passing OR API curl/Postman proof (REQUIRED).
  Steps: Either run `npm run test:backend` and capture pass summary, OR run 1-2 API calls in Postman/curl and capture success response.
  Evidence file: evidence/tests/fig-3-2-backend-tests.png
  Screenshot must show: Command/Request + success response or pass summary.
- [ ] ID: MANUAL_FIG_13
  Location: 3.3 Results & Analysis (Snippet: "<<MANUAL_FIG_13: Insert terminal screenshot for frontend tests.>>")
  What to insert: DEPRECATED. Do not capture per-policy. Remove or replace this placeholder in the report to keep max 14 images.
  Steps: Delete the Figure 3.3 Frontend UI Test Run block from the report or mark as omitted.
  Evidence file: Not required.
  Screenshot must show: Not applicable.
- [ ] ID: MANUAL_FIG_14
  Location: 3.3 Results & Analysis (Snippet: "<<MANUAL_FIG_14: Insert coverage report screenshot.>>")
  What to insert: OPTIONAL. Use as Fig 3.3 ONLY if coverage exists. If chosen, do not include Fig 2.3 Lifecycle.
  Steps: Run coverage command (`npm run test:coverage`) and capture summary. Rename caption in report to Figure 3.3 if used.
  Evidence file: evidence/tests/fig-3-3-coverage.png
  Screenshot must show: Coverage summary lines (statements/branches/functions/lines).
- [ ] ID: MANUAL_FIG_15
  Location: 4.2.5 Cloud deployment summary (Snippet: "<<MANUAL_FIG_15: Insert Vercel/Render dashboard screenshots.>>")
  What to insert: Figure 4.1 Vercel deployment page (REQUIRED).
  Steps: Open Vercel project > Deployments page, show latest Production deployment, then capture.
  Evidence file: evidence/deploy/fig-4-1-vercel.png
  Screenshot must show: Vercel project name, production deployment status, and URL visible.
- [ ] ID: MANUAL_FIG_17
  Location: 4.2.5 Cloud deployment summary (Add a new Figure 4.2 block in the report)
  What to insert: Figure 4.2 Render service page (REQUIRED).
  Steps: In the report, add a new figure entry after Fig 4.1 with placeholder <<MANUAL_FIG_17: Insert Render service page screenshot.>>. Then capture the Render service page.
  Evidence file: evidence/deploy/fig-4-2-render.png
  Screenshot must show: Render service name, service URL, and status visible.
- [ ] ID: MANUAL_FIG_16
  Location: 4.2.5 Cloud deployment summary (Snippet: "<<MANUAL_FIG_16: Insert deployment/transaction screenshot from explorer.>>")
  What to insert: Figure 4.3 Sepolia explorer page for ONE successful tx (REQUIRED).
  Steps: Open a Sepolia explorer page for a successful deployment or vote tx and capture.
  Evidence file: evidence/deploy/fig-4-3-explorer-tx.png
  Screenshot must show: Sepolia network label, tx hash, success status, and URL bar visible.
- [ ] ID: MANUAL_FIG_18
  Location: 5.1 Version control evidence (Snippet: "<<MANUAL_FIG_18: Insert screenshot of commit history.>>")
  What to insert: Figure 5.1 GitHub commit history screenshot (REQUIRED).
  Steps: Open GitHub repo commit history page and capture.
  Evidence file: evidence/git/fig-5-1-commit-history.png
  Screenshot must show: Repo name, commit list with dates, and URL bar visible.
## 3) Diagrams Pack (non-screenshot figures)
Only export the diagrams required by the Evidence Policy (max 14 images total).
- [ ] ID: MANUAL_FIG_01
  Location: 2.1.1 High-level architecture diagram (Snippet: "<<MANUAL_FIG_01: Insert architecture diagram image here (PNG/JPG). Caption: System components-Frontend, Backend, Smart Contracts, Blockchain, optional analytics store.>>")
  What to insert: Figure 2.1 Architecture (REQUIRED).
  Steps: Open `diagrams/figure-2-1-architecture.mmd` in VS Code. Use Mermaid preview -> Export PNG -> save as `evidence/figures/fig-2-1-architecture.png`.
  Evidence file: evidence/figures/fig-2-1-architecture.png
  Screenshot must show: Diagram with frontend, backend, contracts, RPC, and data stores.
- [ ] ID: MANUAL_FIG_02
  Location: 2.1.2 Data Flow Diagram (Snippet: "<<MANUAL_FIG_02: Insert data flow diagram image here (PNG/JPG). Caption: KYC -> Merkle proof -> commitVote -> revealVote -> tally.>>")
  What to insert: Figure 2.2 Data Flow (REQUIRED).
  Steps: Open `diagrams/figure-2-2-data-flow.mmd` -> Mermaid preview -> Export PNG -> save as `evidence/figures/fig-2-2-data-flow.png`.
  Evidence file: evidence/figures/fig-2-2-data-flow.png
  Screenshot must show: KYC, proof, commit, reveal, tally flow with arrows.
- [ ] ID: MANUAL_FIG_03
  Location: 2.1.3 Election lifecycle (Snippet: "<<MANUAL_FIG_03: Insert election lifecycle diagram image here (PNG/JPG). Caption: Commit -> Reveal -> Finished -> Reset -> Commit.>>")
  What to insert: OPTIONAL. Use as Fig 2.3 only if you are not using coverage screenshot (Fig 3.3).
  Steps: If chosen, export `diagrams/figure-2-3-lifecycle.mmd` -> save as `evidence/figures/fig-2-3-lifecycle.png`. Otherwise delete this placeholder from the report.
  Evidence file: evidence/figures/fig-2-3-lifecycle.png
  Screenshot must show: Phase transitions commit -> reveal -> finished -> reset -> commit.
- [ ] ID: MANUAL_FIG_04
  Location: 2.1.4 Demo onboarding flow (Snippet: "<<MANUAL_FIG_04: Insert demo onboarding flow diagram image here (PNG/JPG). Caption: Join request -> allowlist update -> merkleRoot sync -> optional funding.>>")
  What to insert: DEPRECATED. Do not include to keep max 14 images.
  Steps: Remove this figure placeholder from the report or mark it as omitted.
  Evidence file: Not required.
  Screenshot must show: Not applicable.
- [ ] ID: MANUAL_FIG_05
  Location: 2.1.5 Analytics flow (Snippet: "<<MANUAL_FIG_05: Insert analytics flow diagram image here (PNG/JPG). Caption: RPC log scan -> aggregation -> UI display.>>")
  What to insert: DEPRECATED. Do not include to keep max 14 images.
  Steps: Remove this figure placeholder from the report or mark it as omitted.
  Evidence file: Not required.
  Screenshot must show: Not applicable.
## 4) Tests + Coverage Pack (terminal evidence)
Detected test scripts (use only what you actually run):
- Root: `npm run test:contracts` (Fig 3.1), `npm run test:backend` (Fig 3.2)
- Root (optional): `npm run test:frontend` (no figure), `npm run test:coverage` (Fig 3.3 only if coverage exists)
- Backend: `cd backend && npm test` (Fig 3.2), `cd backend && npm run test:coverage` (optional)
- Frontend: `cd frontend && npm test` (optional; no figure in evidence pack)
Evidence mapping (no per-test screenshots):
- Smart contract TCs -> Evidence field = "Fig 3.1".
- API/backend TCs -> Evidence field = "Fig 3.2".
- UI flow TCs -> Evidence field = "Fig 2.6–2.10" (as applicable).
Replace all <<MANUAL_EVID_*>> in the report/test tables with the appropriate figure reference above. Do not capture per-test-case screenshots.
- [ ] ID: MANUAL_TESTRES_01
  Location: 3.2 Test Cases (Snippet: "| TC-SC-01 | Smart Contract (BharatVote) | Election deployed; admin wallet connected; phase=Commit | Call addCandidate('A') | Candidate a..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-01.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-01 outcome (steps: Call addCandidate('A')). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-01-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_02
  Location: 3.2 Test Cases (Snippet: "| TC-SC-02 | Smart Contract (BharatVote) | Election deployed; non-admin wallet connected; phase=Commit | Call addCandidate('A') | Revert ..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-02.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-02 outcome (steps: Call addCandidate('A')). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-02-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_03
  Location: 3.2 Test Cases (Snippet: "| TC-SC-03 | Smart Contract (BharatVote) | Election deployed; admin wallet connected; phase=Reveal | Call addCandidate('A') | Revert with..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-03.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-03 outcome (steps: Call addCandidate('A')). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-03-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_04
  Location: 3.2 Test Cases (Snippet: "| TC-SC-04 | Smart Contract (BharatVote) | Allowlisted voter with valid proof; phase=Commit | Call commitVote(commitHash, proof) | Commit..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-04.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-04 outcome (steps: Call commitVote(commitHash, proof)). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-04-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_05
  Location: 3.2 Test Cases (Snippet: "| TC-SC-05 | Smart Contract (BharatVote) | Allowlisted voter; phase=Reveal | Call commitVote(commitHash, proof) | Revert with WrongPhase ..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-05.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-05 outcome (steps: Call commitVote(commitHash, proof)). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-05-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_06
  Location: 3.2 Test Cases (Snippet: "| TC-SC-06 | Smart Contract (BharatVote) | Allowlisted voter; phase=Commit | Call commitVote(bytes32(0), proof) | Revert with EmptyHash |..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-06.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-06 outcome (steps: Call commitVote(bytes32(0), proof)). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-06-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_07
  Location: 3.2 Test Cases (Snippet: "| TC-SC-07 | Smart Contract (BharatVote) | Non-allowlisted voter; phase=Commit | Call commitVote(commitHash, invalidProof) | Revert with ..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-07.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-07 outcome (steps: Call commitVote(commitHash, invalidProof)). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-07-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_08
  Location: 3.2 Test Cases (Snippet: "| TC-SC-08 | Smart Contract (BharatVote) | Allowlisted voter already committed; phase=Commit | Call commitVote(newCommit, proof) again | ..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-08.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-08 outcome (steps: Call commitVote(newCommit, proof) again). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-08-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_09
  Location: 3.2 Test Cases (Snippet: "| TC-SC-09 | Smart Contract (BharatVote) | Allowlisted voter committed; phase=Reveal | Call revealVote(candidateId, correctSalt) | Tally ..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-09.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-09 outcome (steps: Call revealVote(candidateId, correctSalt)). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-09-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_10
  Location: 3.2 Test Cases (Snippet: "| TC-SC-10 | Smart Contract (BharatVote) | Allowlisted voter has not committed; phase=Reveal | Call revealVote(candidateId, salt) | Rever..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-10.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-10 outcome (steps: Call revealVote(candidateId, salt)). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-10-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_11
  Location: 3.2 Test Cases (Snippet: "| TC-SC-11 | Smart Contract (BharatVote) | Allowlisted voter committed; phase=Reveal | Call revealVote(candidateId, wrongSalt) | Revert w..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-11.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-11 outcome (steps: Call revealVote(candidateId, wrongSalt)). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-11-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_12
  Location: 3.2 Test Cases (Snippet: "| TC-SC-12 | Smart Contract (BharatVote) | Allowlisted voter already revealed; phase=Reveal | Call revealVote(candidateId, correctSalt) a..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-12.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-12 outcome (steps: Call revealVote(candidateId, correctSalt) again). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-12-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_13
  Location: 3.2 Test Cases (Snippet: "| TC-SC-13 | Smart Contract (BharatVote) | Candidate removed (inactive); phase=Reveal | Call revealVote(removedCandidateId, salt) | Rever..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-13.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-13 outcome (steps: Call revealVote(removedCandidateId, salt)). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-13-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_14
  Location: 3.2 Test Cases (Snippet: "| TC-SC-14 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call finishElection() | Revert with WrongPhase | <<MANU..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-14.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-14 outcome (steps: Call finishElection()). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-14-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_15
  Location: 3.2 Test Cases (Snippet: "| TC-SC-15 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call resetElection() | Revert with CanOnlyResetAfterFin..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-15.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-15 outcome (steps: Call resetElection()). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-15-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_16
  Location: 3.2 Test Cases (Snippet: "| TC-API-01 | Backend API | Allowlisted address exists in voter list | GET /api/merkle-proof/:address | Returns proof and merkleRoot | <<..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-API-01.
  Steps: 1) Run `npm run test:backend` (or start backend and call the endpoint). 2) Verify TC-API-01 (steps: GET /api/merkle-proof/:address). 3) Paste observed result.
  Evidence file: evidence/tests/TC-API-01-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_17
  Location: 3.2 Test Cases (Snippet: "| TC-API-02 | Backend API | Address not in voter list | GET /api/merkle-proof/:address | Returns error or empty proof with NotEligible in..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-API-02.
  Steps: 1) Run `npm run test:backend` (or start backend and call the endpoint). 2) Verify TC-API-02 (steps: GET /api/merkle-proof/:address). 3) Paste observed result.
  Evidence file: evidence/tests/TC-API-02-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_18
  Location: 3.2 Test Cases (Snippet: "| TC-API-03 | Backend API | Backend running with allowlist loaded | GET /api/merkle-root | Returns current merkleRoot | <<MANUAL_TESTRES_..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-API-03.
  Steps: 1) Run `npm run test:backend` (or start backend and call the endpoint). 2) Verify TC-API-03 (steps: GET /api/merkle-root). 3) Paste observed result.
  Evidence file: evidence/tests/TC-API-03-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_19
  Location: 3.2 Test Cases (Snippet: "| TC-API-04 | Backend API | Backend configured with admin key; demo election set | POST /api/join { address } | Address added (if new) an..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-API-04.
  Steps: 1) Run `npm run test:backend` (or start backend and call the endpoint). 2) Verify TC-API-04 (steps: POST /api/join { address }). 3) Paste observed result.
  Evidence file: evidence/tests/TC-API-04-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_20
  Location: 3.2 Test Cases (Snippet: "| TC-API-05 | Backend API | Backend missing admin key or not demo admin | POST /api/join { address } | Returns error indicating demo join..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-API-05.
  Steps: 1) Run `npm run test:backend` (or start backend and call the endpoint). 2) Verify TC-API-05 (steps: POST /api/join { address }). 3) Paste observed result.
  Evidence file: evidence/tests/TC-API-05-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_21
  Location: 3.2 Test Cases (Snippet: "| TC-API-06 | Backend API | Demo analytics enabled | GET /api/demo/analytics | Returns aggregated demo counts or empty state | <<MANUAL_T..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-API-06.
  Steps: 1) Run `npm run test:backend` (or start backend and call the endpoint). 2) Verify TC-API-06 (steps: GET /api/demo/analytics). 3) Paste observed result.
  Evidence file: evidence/tests/TC-API-06-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_22
  Location: 3.2 Test Cases (Snippet: "| TC-UI-01 | Frontend UI | MetaMask connected to wrong network | Open app and attempt action | User prompted to switch network; actions b..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-UI-01.
  Steps: 1) Run `npm run frontend:dev`. 2) Perform UI steps: Open app and attempt action. 3) Paste observed result.
  Evidence file: evidence/tests/TC-UI-01-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_23
  Location: 3.2 Test Cases (Snippet: "| TC-UI-02 | Frontend UI | Allowlisted address; phase=Commit | Enter candidate + salt and submit commit | Commit transaction submitted an..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-UI-02.
  Steps: 1) Run `npm run frontend:dev`. 2) Perform UI steps: Enter candidate + salt and submit commit. 3) Paste observed result.
  Evidence file: evidence/tests/TC-UI-02-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_24
  Location: 3.2 Test Cases (Snippet: "| TC-UI-03 | Frontend UI | Address committed; phase=Reveal | Reveal with wrong salt | UI shows error; reveal rejected | <<MANUAL_TESTRES_..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-UI-03.
  Steps: 1) Run `npm run frontend:dev`. 2) Perform UI steps: Reveal with wrong salt. 3) Paste observed result.
  Evidence file: evidence/tests/TC-UI-03-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_25
  Location: 3.2 Test Cases (Snippet: "| TC-UI-04 | Frontend UI | Main election flow and demo election flow available | Open main election and attempt vote without KYC; open de..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-UI-04.
  Steps: 1) Run `npm run frontend:dev`. 2) Perform UI steps: Open main election and attempt vote without KYC; open demo election. 3) Paste observed result.
  Evidence file: evidence/tests/TC-UI-04-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_26
  Location: 3.2 Test Cases (Snippet: "| TC-UI-05 | Frontend UI | Public results page opened | Load current tally and all-time scan | Results shown or graceful retry message on..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-UI-05.
  Steps: 1) Run `npm run frontend:dev`. 2) Perform UI steps: Load current tally and all-time scan. 3) Paste observed result.
  Evidence file: evidence/tests/TC-UI-05-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_27
  Location: 3.2 Test Cases (Snippet: "| TC-UI-06 | Frontend UI | Non-admin wallet connected | Open Admin panel and try phase change | Admin actions disabled or rejected with e..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-UI-06.
  Steps: 1) Run `npm run frontend:dev`. 2) Perform UI steps: Open Admin panel and try phase change. 3) Paste observed result.
  Evidence file: evidence/tests/TC-UI-06-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_28
  Location: 3.2 Test Cases (Snippet: "| TC-SC-16 | Smart Contract (BharatVote) | Phase=Reveal; admin wallet connected | Call startReveal() | Revert with WrongPhase | <<MANUAL_..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-16.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-16 outcome (steps: Call startReveal()). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-16-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_29
  Location: 3.2 Test Cases (Snippet: "| TC-SC-17 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call startReveal() | Phase changes to Reveal; PhaseChan..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-17.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-17 outcome (steps: Call startReveal()). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-17-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_30
  Location: 3.2 Test Cases (Snippet: "| TC-SC-18 | Smart Contract (BharatVote) | Phase=Reveal; admin wallet connected | Call finishElection() | Phase changes to Finished; Tall..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-18.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-18 outcome (steps: Call finishElection()). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-18-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_31
  Location: 3.2 Test Cases (Snippet: "| TC-SC-19 | Smart Contract (BharatVote) | Phase=Finished; admin wallet connected | Call resetElection() | Commits/tallies reset; phase r..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-19.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-19 outcome (steps: Call resetElection()). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-19-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTRES_32
  Location: 3.2 Test Cases (Snippet: "| TC-SC-20 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call setMerkleRoot(newRoot) | merkleRoot updated on-cha..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Insert the observed actual result for TC-SC-20.
  Steps: 1) Run `npm run test:contracts`. 2) Confirm TC-SC-20 outcome (steps: Call setMerkleRoot(newRoot)). 3) Paste the observed result text.
  Evidence file: evidence/tests/TC-SC-20-actual.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_01
  Location: 3.2 Test Cases (Snippet: "| TC-SC-01 | Smart Contract (BharatVote) | Election deployed; admin wallet connected; phase=Commit | Call addCandidate('A') | Candidate a..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-01 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-01, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-01-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_02
  Location: 3.2 Test Cases (Snippet: "| TC-SC-02 | Smart Contract (BharatVote) | Election deployed; non-admin wallet connected; phase=Commit | Call addCandidate('A') | Revert ..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-02 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-02, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-02-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_03
  Location: 3.2 Test Cases (Snippet: "| TC-SC-03 | Smart Contract (BharatVote) | Election deployed; admin wallet connected; phase=Reveal | Call addCandidate('A') | Revert with..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-03 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-03, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-03-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_04
  Location: 3.2 Test Cases (Snippet: "| TC-SC-04 | Smart Contract (BharatVote) | Allowlisted voter with valid proof; phase=Commit | Call commitVote(commitHash, proof) | Commit..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-04 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-04, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-04-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_05
  Location: 3.2 Test Cases (Snippet: "| TC-SC-05 | Smart Contract (BharatVote) | Allowlisted voter; phase=Reveal | Call commitVote(commitHash, proof) | Revert with WrongPhase ..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-05 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-05, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-05-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_06
  Location: 3.2 Test Cases (Snippet: "| TC-SC-06 | Smart Contract (BharatVote) | Allowlisted voter; phase=Commit | Call commitVote(bytes32(0), proof) | Revert with EmptyHash |..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-06 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-06, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-06-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_07
  Location: 3.2 Test Cases (Snippet: "| TC-SC-07 | Smart Contract (BharatVote) | Non-allowlisted voter; phase=Commit | Call commitVote(commitHash, invalidProof) | Revert with ..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-07 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-07, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-07-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_08
  Location: 3.2 Test Cases (Snippet: "| TC-SC-08 | Smart Contract (BharatVote) | Allowlisted voter already committed; phase=Commit | Call commitVote(newCommit, proof) again | ..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-08 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-08, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-08-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_09
  Location: 3.2 Test Cases (Snippet: "| TC-SC-09 | Smart Contract (BharatVote) | Allowlisted voter committed; phase=Reveal | Call revealVote(candidateId, correctSalt) | Tally ..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-09 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-09, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-09-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_10
  Location: 3.2 Test Cases (Snippet: "| TC-SC-10 | Smart Contract (BharatVote) | Allowlisted voter has not committed; phase=Reveal | Call revealVote(candidateId, salt) | Rever..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-10 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-10, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-10-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_11
  Location: 3.2 Test Cases (Snippet: "| TC-SC-11 | Smart Contract (BharatVote) | Allowlisted voter committed; phase=Reveal | Call revealVote(candidateId, wrongSalt) | Revert w..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-11 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-11, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-11-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_12
  Location: 3.2 Test Cases (Snippet: "| TC-SC-12 | Smart Contract (BharatVote) | Allowlisted voter already revealed; phase=Reveal | Call revealVote(candidateId, correctSalt) a..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-12 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-12, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-12-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_13
  Location: 3.2 Test Cases (Snippet: "| TC-SC-13 | Smart Contract (BharatVote) | Candidate removed (inactive); phase=Reveal | Call revealVote(removedCandidateId, salt) | Rever..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-13 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-13, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-13-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_14
  Location: 3.2 Test Cases (Snippet: "| TC-SC-14 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call finishElection() | Revert with WrongPhase | <<MANU..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-14 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-14, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-14-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_15
  Location: 3.2 Test Cases (Snippet: "| TC-SC-15 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call resetElection() | Revert with CanOnlyResetAfterFin..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-15 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-15, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-15-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_16
  Location: 3.2 Test Cases (Snippet: "| TC-API-01 | Backend API | Allowlisted address exists in voter list | GET /api/merkle-proof/:address | Returns proof and merkleRoot | <<..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-API-01 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-API-01, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-API-01-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_17
  Location: 3.2 Test Cases (Snippet: "| TC-API-02 | Backend API | Address not in voter list | GET /api/merkle-proof/:address | Returns error or empty proof with NotEligible in..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-API-02 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-API-02, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-API-02-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_18
  Location: 3.2 Test Cases (Snippet: "| TC-API-03 | Backend API | Backend running with allowlist loaded | GET /api/merkle-root | Returns current merkleRoot | <<MANUAL_TESTRES_..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-API-03 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-API-03, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-API-03-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_19
  Location: 3.2 Test Cases (Snippet: "| TC-API-04 | Backend API | Backend configured with admin key; demo election set | POST /api/join { address } | Address added (if new) an..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-API-04 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-API-04, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-API-04-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_20
  Location: 3.2 Test Cases (Snippet: "| TC-API-05 | Backend API | Backend missing admin key or not demo admin | POST /api/join { address } | Returns error indicating demo join..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-API-05 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-API-05, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-API-05-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_21
  Location: 3.2 Test Cases (Snippet: "| TC-API-06 | Backend API | Demo analytics enabled | GET /api/demo/analytics | Returns aggregated demo counts or empty state | <<MANUAL_T..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-API-06 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-API-06, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-API-06-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_22
  Location: 3.2 Test Cases (Snippet: "| TC-UI-01 | Frontend UI | MetaMask connected to wrong network | Open app and attempt action | User prompted to switch network; actions b..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-UI-01 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-UI-01, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-UI-01-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_23
  Location: 3.2 Test Cases (Snippet: "| TC-UI-02 | Frontend UI | Allowlisted address; phase=Commit | Enter candidate + salt and submit commit | Commit transaction submitted an..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-UI-02 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-UI-02, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-UI-02-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_24
  Location: 3.2 Test Cases (Snippet: "| TC-UI-03 | Frontend UI | Address committed; phase=Reveal | Reveal with wrong salt | UI shows error; reveal rejected | <<MANUAL_TESTRES_..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-UI-03 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-UI-03, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-UI-03-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_25
  Location: 3.2 Test Cases (Snippet: "| TC-UI-04 | Frontend UI | Main election flow and demo election flow available | Open main election and attempt vote without KYC; open de..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-UI-04 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-UI-04, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-UI-04-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_26
  Location: 3.2 Test Cases (Snippet: "| TC-UI-05 | Frontend UI | Public results page opened | Load current tally and all-time scan | Results shown or graceful retry message on..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-UI-05 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-UI-05, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-UI-05-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_27
  Location: 3.2 Test Cases (Snippet: "| TC-UI-06 | Frontend UI | Non-admin wallet connected | Open Admin panel and try phase change | Admin actions disabled or rejected with e..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-UI-06 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-UI-06, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-UI-06-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_28
  Location: 3.2 Test Cases (Snippet: "| TC-SC-16 | Smart Contract (BharatVote) | Phase=Reveal; admin wallet connected | Call startReveal() | Revert with WrongPhase | <<MANUAL_..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-16 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-16, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-16-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_29
  Location: 3.2 Test Cases (Snippet: "| TC-SC-17 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call startReveal() | Phase changes to Reveal; PhaseChan..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-17 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-17, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-17-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_30
  Location: 3.2 Test Cases (Snippet: "| TC-SC-18 | Smart Contract (BharatVote) | Phase=Reveal; admin wallet connected | Call finishElection() | Phase changes to Finished; Tall..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-18 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-18, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-18-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_31
  Location: 3.2 Test Cases (Snippet: "| TC-SC-19 | Smart Contract (BharatVote) | Phase=Finished; admin wallet connected | Call resetElection() | Commits/tallies reset; phase r..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-19 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-19, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-19-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_TESTSTATUS_32
  Location: 3.2 Test Cases (Snippet: "| TC-SC-20 | Smart Contract (BharatVote) | Phase=Commit; admin wallet connected | Call setMerkleRoot(newRoot) | merkleRoot updated on-cha..."); Also in TEST_PLAN_AND_CASES.md (Expanded Test Case Table)
  What to insert: Set PASS/FAIL for TC-SC-20 based on the actual result.
  Steps: Compare the observed result with the expected result for TC-SC-20, then enter PASS or FAIL.
  Evidence file: evidence/tests/TC-SC-20-status.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_COV_01
  Location: 3.3 Results & Analysis (Snippet: "- Coverage summary: <<MANUAL_COV_01: Paste coverage summary %>>")
  What to insert: Insert the coverage summary percentages.
  Steps: Run `npm run test:coverage` and copy the summary line(s) for statements/branches/functions/lines.
  Evidence file: evidence/tests/coverage-summary.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_COV_02
  Location: 3.3 Results & Analysis (Snippet: "- Coverage report screenshot: <<MANUAL_COV_02: Insert screenshot of coverage report>>")
  What to insert: Insert a screenshot of the coverage report.
  Steps: After `npm run test:coverage`, capture the terminal summary or the HTML coverage report screen.
  Evidence file: evidence/tests/coverage-report.png
  Screenshot must show: Coverage summary or HTML report with percentages visible.

## 5) Metrics Pack (confirmation time + /api/join latency + RPC notes)
Raw readings template (fill before averaging):
```text
Commit confirmations (5 tx): txHash | submittedAt | confirmedAt | durationSeconds
Reveal confirmations (5 tx): txHash | submittedAt | confirmedAt | durationSeconds
/api/join latency (10 runs): run # | time_ms | response_code
```
- [ ] ID: MANUAL_METRIC_01
  Location: 3.3 Results & Analysis (Snippet: "| Avg Sepolia confirmation time for commit tx | Record timestamps of 5 commit transactions and compute average | <<MANUAL_METRIC_01: Inse...")
  What to insert: Insert average confirmation time for commit transactions.
  Steps: Perform 5 commit transactions on Sepolia, record submission and confirmation times (MetaMask activity or explorer), compute average in seconds.
  Evidence file: evidence/metrics/commit-confirm-times.csv
  Screenshot must show: MetaMask activity or explorer page showing tx timestamps for commits.
- [ ] ID: MANUAL_METRIC_02
  Location: 3.3 Results & Analysis (Snippet: "| Avg Sepolia confirmation time for reveal tx | Record timestamps of 5 reveal transactions and compute average | <<MANUAL_METRIC_02: Inse...")
  What to insert: Insert average confirmation time for reveal transactions.
  Steps: Perform 5 reveal transactions, record submission and confirmation times, compute average in seconds.
  Evidence file: evidence/metrics/reveal-confirm-times.csv
  Screenshot must show: MetaMask activity or explorer page showing tx timestamps for reveals.
- [ ] ID: MANUAL_METRIC_03
  Location: 3.3 Results & Analysis (Snippet: "| Backend `/api/join` average latency | Send 10 requests and average response time | <<MANUAL_METRIC_03: Insert avg /api/join latency>> |")
  What to insert: Insert average latency for /api/join.
  Steps: Send 10 POST requests to `/api/join` (use curl or Postman) and record time_total in ms; compute average.
  Evidence file: evidence/metrics/api-join-latency.csv
  Screenshot must show: Terminal or Postman showing timing values and response codes.
- [ ] ID: MANUAL_METRIC_04
  Location: 3.3 Results & Analysis (Snippet: "| RPC rate-limit / event-scan reliability notes | Observe scanning behavior under load | <<MANUAL_METRIC_04: Describe observed RPC issues...")
  What to insert: Describe observed RPC rate-limit or event-scan reliability issues.
  Steps: During analytics usage, note any rate-limit errors or delays and summarize them in 1-2 sentences.
  Evidence file: evidence/metrics/rpc-notes.txt
  Screenshot must show: Optional: console/terminal log showing rate-limit messages.

## 6) Weekly Progress + Supervisor Evidence
- [ ] ID: MANUAL_DATE_03
  Location: 5.2 Weekly progress summary (Snippet: "| 1 | <<MANUAL_DATE_03: Week 1 dates>> | Project setup, repo structure, basic Hardhat config | <<MANUAL_LINK_06: Week 1 output/link>> | <...")
  What to insert: Insert the date range for Week 1.
  Steps: Use your calendar or project log to define the 7-day range for that week.
  Evidence file: evidence/weekly/week-dates.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_DATE_04
  Location: 5.2 Weekly progress summary (Snippet: "| 2 | <<MANUAL_DATE_04: Week 2 dates>> | Election contract scaffolding, admin controls | <<MANUAL_LINK_07: Week 2 output/link>> | <<MANUA...")
  What to insert: Insert the date range for Week 2.
  Steps: Use your calendar or project log to define the 7-day range for that week.
  Evidence file: evidence/weekly/week-dates.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_DATE_05
  Location: 5.2 Weekly progress summary (Snippet: "| 3 | <<MANUAL_DATE_05: Week 3 dates>> | Commit-reveal voting logic and tests | <<MANUAL_LINK_08: Week 3 output/link>> | <<MANUAL_NOTE_03...")
  What to insert: Insert the date range for Week 3.
  Steps: Use your calendar or project log to define the 7-day range for that week.
  Evidence file: evidence/weekly/week-dates.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_DATE_06
  Location: 5.2 Weekly progress summary (Snippet: "| 4 | <<MANUAL_DATE_06: Week 4 dates>> | Merkle allowlist integration and proof endpoints | <<MANUAL_LINK_09: Week 4 output/link>> | <<MA...")
  What to insert: Insert the date range for Week 4.
  Steps: Use your calendar or project log to define the 7-day range for that week.
  Evidence file: evidence/weekly/week-dates.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_DATE_07
  Location: 5.2 Weekly progress summary (Snippet: "| 5 | <<MANUAL_DATE_07: Week 5 dates>> | Frontend admin/voter UI and result panels | <<MANUAL_LINK_10: Week 5 output/link>> | <<MANUAL_NO...")
  What to insert: Insert the date range for Week 5.
  Steps: Use your calendar or project log to define the 7-day range for that week.
  Evidence file: evidence/weekly/week-dates.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_DATE_08
  Location: 5.2 Weekly progress summary (Snippet: "| 6 | <<MANUAL_DATE_08: Week 6 dates>> | Demo onboarding flow and backend automation | <<MANUAL_LINK_11: Week 6 output/link>> | <<MANUAL_...")
  What to insert: Insert the date range for Week 6.
  Steps: Use your calendar or project log to define the 7-day range for that week.
  Evidence file: evidence/weekly/week-dates.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_DATE_09
  Location: 5.2 Weekly progress summary (Snippet: "| 7 | <<MANUAL_DATE_09: Week 7 dates>> | Testing and bug fixes | <<MANUAL_LINK_12: Week 7 output/link>> | <<MANUAL_NOTE_07: Week 7 remark...")
  What to insert: Insert the date range for Week 7.
  Steps: Use your calendar or project log to define the 7-day range for that week.
  Evidence file: evidence/weekly/week-dates.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_DATE_10
  Location: 5.2 Weekly progress summary (Snippet: "| 8 | <<MANUAL_DATE_10: Week 8 dates>> | Cloud deployment and documentation polish | <<MANUAL_LINK_13: Week 8 output/link>> | <<MANUAL_NO...")
  What to insert: Insert the date range for Week 8.
  Steps: Use your calendar or project log to define the 7-day range for that week.
  Evidence file: evidence/weekly/week-dates.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_LINK_06
  Location: 5.2 Weekly progress summary (Snippet: "| 1 | <<MANUAL_DATE_03: Week 1 dates>> | Project setup, repo structure, basic Hardhat config | <<MANUAL_LINK_06: Week 1 output/link>> | <...")
  What to insert: Insert a link to the Week 1 output (commit, PR, doc, or screenshot).
  Steps: Open GitHub or your storage, find the artifact for that week, and copy its URL.
  Evidence file: evidence/weekly/week-1-link.txt
  Screenshot must show: Optional: page with the linked artifact visible.
- [ ] ID: MANUAL_LINK_07
  Location: 5.2 Weekly progress summary (Snippet: "| 2 | <<MANUAL_DATE_04: Week 2 dates>> | Election contract scaffolding, admin controls | <<MANUAL_LINK_07: Week 2 output/link>> | <<MANUA...")
  What to insert: Insert a link to the Week 2 output (commit, PR, doc, or screenshot).
  Steps: Open GitHub or your storage, find the artifact for that week, and copy its URL.
  Evidence file: evidence/weekly/week-2-link.txt
  Screenshot must show: Optional: page with the linked artifact visible.
- [ ] ID: MANUAL_LINK_08
  Location: 5.2 Weekly progress summary (Snippet: "| 3 | <<MANUAL_DATE_05: Week 3 dates>> | Commit-reveal voting logic and tests | <<MANUAL_LINK_08: Week 3 output/link>> | <<MANUAL_NOTE_03...")
  What to insert: Insert a link to the Week 3 output (commit, PR, doc, or screenshot).
  Steps: Open GitHub or your storage, find the artifact for that week, and copy its URL.
  Evidence file: evidence/weekly/week-3-link.txt
  Screenshot must show: Optional: page with the linked artifact visible.
- [ ] ID: MANUAL_LINK_09
  Location: 5.2 Weekly progress summary (Snippet: "| 4 | <<MANUAL_DATE_06: Week 4 dates>> | Merkle allowlist integration and proof endpoints | <<MANUAL_LINK_09: Week 4 output/link>> | <<MA...")
  What to insert: Insert a link to the Week 4 output (commit, PR, doc, or screenshot).
  Steps: Open GitHub or your storage, find the artifact for that week, and copy its URL.
  Evidence file: evidence/weekly/week-4-link.txt
  Screenshot must show: Optional: page with the linked artifact visible.
- [ ] ID: MANUAL_LINK_10
  Location: 5.2 Weekly progress summary (Snippet: "| 5 | <<MANUAL_DATE_07: Week 5 dates>> | Frontend admin/voter UI and result panels | <<MANUAL_LINK_10: Week 5 output/link>> | <<MANUAL_NO...")
  What to insert: Insert a link to the Week 5 output (commit, PR, doc, or screenshot).
  Steps: Open GitHub or your storage, find the artifact for that week, and copy its URL.
  Evidence file: evidence/weekly/week-5-link.txt
  Screenshot must show: Optional: page with the linked artifact visible.
- [ ] ID: MANUAL_LINK_11
  Location: 5.2 Weekly progress summary (Snippet: "| 6 | <<MANUAL_DATE_08: Week 6 dates>> | Demo onboarding flow and backend automation | <<MANUAL_LINK_11: Week 6 output/link>> | <<MANUAL_...")
  What to insert: Insert a link to the Week 6 output (commit, PR, doc, or screenshot).
  Steps: Open GitHub or your storage, find the artifact for that week, and copy its URL.
  Evidence file: evidence/weekly/week-6-link.txt
  Screenshot must show: Optional: page with the linked artifact visible.
- [ ] ID: MANUAL_LINK_12
  Location: 5.2 Weekly progress summary (Snippet: "| 7 | <<MANUAL_DATE_09: Week 7 dates>> | Testing and bug fixes | <<MANUAL_LINK_12: Week 7 output/link>> | <<MANUAL_NOTE_07: Week 7 remark...")
  What to insert: Insert a link to the Week 7 output (commit, PR, doc, or screenshot).
  Steps: Open GitHub or your storage, find the artifact for that week, and copy its URL.
  Evidence file: evidence/weekly/week-7-link.txt
  Screenshot must show: Optional: page with the linked artifact visible.
- [ ] ID: MANUAL_LINK_13
  Location: 5.2 Weekly progress summary (Snippet: "| 8 | <<MANUAL_DATE_10: Week 8 dates>> | Cloud deployment and documentation polish | <<MANUAL_LINK_13: Week 8 output/link>> | <<MANUAL_NO...")
  What to insert: Insert a link to the Week 8 output (commit, PR, doc, or screenshot).
  Steps: Open GitHub or your storage, find the artifact for that week, and copy its URL.
  Evidence file: evidence/weekly/week-8-link.txt
  Screenshot must show: Optional: page with the linked artifact visible.
- [ ] ID: MANUAL_NOTE_01
  Location: 5.2 Weekly progress summary (Snippet: "| 1 | <<MANUAL_DATE_03: Week 1 dates>> | Project setup, repo structure, basic Hardhat config | <<MANUAL_LINK_06: Week 1 output/link>> | <...")
  What to insert: Insert Week 1 remarks (1-2 short sentences).
  Steps: Summarize what changed, any blockers, or outcomes for that week.
  Evidence file: evidence/weekly/week-1-remarks.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_NOTE_02
  Location: 5.2 Weekly progress summary (Snippet: "| 2 | <<MANUAL_DATE_04: Week 2 dates>> | Election contract scaffolding, admin controls | <<MANUAL_LINK_07: Week 2 output/link>> | <<MANUA...")
  What to insert: Insert Week 2 remarks (1-2 short sentences).
  Steps: Summarize what changed, any blockers, or outcomes for that week.
  Evidence file: evidence/weekly/week-2-remarks.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_NOTE_03
  Location: 5.2 Weekly progress summary (Snippet: "| 3 | <<MANUAL_DATE_05: Week 3 dates>> | Commit-reveal voting logic and tests | <<MANUAL_LINK_08: Week 3 output/link>> | <<MANUAL_NOTE_03...")
  What to insert: Insert Week 3 remarks (1-2 short sentences).
  Steps: Summarize what changed, any blockers, or outcomes for that week.
  Evidence file: evidence/weekly/week-3-remarks.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_NOTE_04
  Location: 5.2 Weekly progress summary (Snippet: "| 4 | <<MANUAL_DATE_06: Week 4 dates>> | Merkle allowlist integration and proof endpoints | <<MANUAL_LINK_09: Week 4 output/link>> | <<MA...")
  What to insert: Insert Week 4 remarks (1-2 short sentences).
  Steps: Summarize what changed, any blockers, or outcomes for that week.
  Evidence file: evidence/weekly/week-4-remarks.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_NOTE_05
  Location: 5.2 Weekly progress summary (Snippet: "| 5 | <<MANUAL_DATE_07: Week 5 dates>> | Frontend admin/voter UI and result panels | <<MANUAL_LINK_10: Week 5 output/link>> | <<MANUAL_NO...")
  What to insert: Insert Week 5 remarks (1-2 short sentences).
  Steps: Summarize what changed, any blockers, or outcomes for that week.
  Evidence file: evidence/weekly/week-5-remarks.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_NOTE_06
  Location: 5.2 Weekly progress summary (Snippet: "| 6 | <<MANUAL_DATE_08: Week 6 dates>> | Demo onboarding flow and backend automation | <<MANUAL_LINK_11: Week 6 output/link>> | <<MANUAL_...")
  What to insert: Insert Week 6 remarks (1-2 short sentences).
  Steps: Summarize what changed, any blockers, or outcomes for that week.
  Evidence file: evidence/weekly/week-6-remarks.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_NOTE_07
  Location: 5.2 Weekly progress summary (Snippet: "| 7 | <<MANUAL_DATE_09: Week 7 dates>> | Testing and bug fixes | <<MANUAL_LINK_12: Week 7 output/link>> | <<MANUAL_NOTE_07: Week 7 remark...")
  What to insert: Insert Week 7 remarks (1-2 short sentences).
  Steps: Summarize what changed, any blockers, or outcomes for that week.
  Evidence file: evidence/weekly/week-7-remarks.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_NOTE_08
  Location: 5.2 Weekly progress summary (Snippet: "| 8 | <<MANUAL_DATE_10: Week 8 dates>> | Cloud deployment and documentation polish | <<MANUAL_LINK_13: Week 8 output/link>> | <<MANUAL_NO...")
  What to insert: Insert Week 8 remarks (1-2 short sentences).
  Steps: Summarize what changed, any blockers, or outcomes for that week.
  Evidence file: evidence/weekly/week-8-remarks.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_SUP_02
  Location: 5.3 Supervisor interaction summary (Snippet: "Supervisor name: <<MANUAL_SUP_02: Insert supervisor name>>")
  What to insert: Insert supervisor name (same as cover page unless different).
  Steps: Use the official supervisor name from your records; keep consistent with MANUAL_SUP_01.
  Evidence file: evidence/supervisor/supervisor-name.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_DATE_11
  Location: 5.3 Supervisor interaction summary (Snippet: "| 1 | <<MANUAL_DATE_11: Meeting 1 date>> | <<MANUAL_FEEDBACK_01: Feedback summary>> |")
  What to insert: Insert the supervisor meeting date for Meeting 1.
  Steps: Check meeting notes or email calendar invite and copy the exact date.
  Evidence file: evidence/supervisor/meeting-dates.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_DATE_12
  Location: 5.3 Supervisor interaction summary (Snippet: "| 2 | <<MANUAL_DATE_12: Meeting 2 date>> | <<MANUAL_FEEDBACK_02: Feedback summary>> |")
  What to insert: Insert the supervisor meeting date for Meeting 2.
  Steps: Check meeting notes or email calendar invite and copy the exact date.
  Evidence file: evidence/supervisor/meeting-dates.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_DATE_13
  Location: 5.3 Supervisor interaction summary (Snippet: "| 3 | <<MANUAL_DATE_13: Meeting 3 date>> | <<MANUAL_FEEDBACK_03: Feedback summary>> |")
  What to insert: Insert the supervisor meeting date for Meeting 3.
  Steps: Check meeting notes or email calendar invite and copy the exact date.
  Evidence file: evidence/supervisor/meeting-dates.txt (optional)
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_FEEDBACK_01
  Location: 5.3 Supervisor interaction summary (Snippet: "| 1 | <<MANUAL_DATE_11: Meeting 1 date>> | <<MANUAL_FEEDBACK_01: Feedback summary>> |")
  What to insert: Insert a short summary of key feedback from Meeting 1.
  Steps: Use meeting notes or emails to write 1-3 bullet points for that meeting.
  Evidence file: evidence/supervisor/meeting-1-feedback.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_FEEDBACK_02
  Location: 5.3 Supervisor interaction summary (Snippet: "| 2 | <<MANUAL_DATE_12: Meeting 2 date>> | <<MANUAL_FEEDBACK_02: Feedback summary>> |")
  What to insert: Insert a short summary of key feedback from Meeting 2.
  Steps: Use meeting notes or emails to write 1-3 bullet points for that meeting.
  Evidence file: evidence/supervisor/meeting-2-feedback.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_FEEDBACK_03
  Location: 5.3 Supervisor interaction summary (Snippet: "| 3 | <<MANUAL_DATE_13: Meeting 3 date>> | <<MANUAL_FEEDBACK_03: Feedback summary>> |")
  What to insert: Insert a short summary of key feedback from Meeting 3.
  Steps: Use meeting notes or emails to write 1-3 bullet points for that meeting.
  Evidence file: evidence/supervisor/meeting-3-feedback.txt
  Screenshot must show: Not required (text entry).

## 6.5) Abbreviations + Appendices (text-only)
- [ ] ID: MANUAL_ABBR_01
  Location: List of Abbreviations
  What to insert: Fill the abbreviations list (e.g., KYC, RPC, UI, API, DApp, EOA) based on the report content.
  Steps: Scan the report for acronyms and list them alphabetically with short expansions.
  Evidence file: evidence/notes/abbreviations.txt (optional)
  Screenshot must show: Not required (text-only).
- [ ] ID: MANUAL_APP_A
  Location: Appendix A: User Manual
  What to insert: A short user manual covering Admin flow and Voter flow.
  Steps: Write 8-12 bullet steps: open app -> connect wallet -> join demo -> commit -> reveal -> view results.
  Evidence file: evidence/notes/appendix-a-user-manual.txt
  Screenshot must show: Not required (text-only).
- [ ] ID: MANUAL_APP_B
  Location: Appendix B: Installation Guide
  What to insert: Local setup steps (install deps, env vars, run backend/frontend, deploy contracts).
  Steps: Convert Chapter 4 commands into a concise installation checklist.
  Evidence file: evidence/notes/appendix-b-installation.txt
  Screenshot must show: Not required (text-only).
- [ ] ID: MANUAL_APP_C
  Location: Appendix C: Source Code Link
  What to insert: GitHub repository URL (same as MANUAL_LINK_04).
  Steps: Reuse the repo link from the Links Pack and paste here.
  Evidence file: evidence/links/github-repo-url.txt
  Screenshot must show: Not required (text-only).
- [ ] ID: MANUAL_APP_D
  Location: Appendix D: Demo Video Link
  What to insert: Demo video URL (same as MANUAL_LINK_05).
  Steps: Reuse the demo video link from the Links Pack and paste here.
  Evidence file: evidence/links/demo-video-url.txt
  Screenshot must show: Not required (text-only).

## 7) Word Finalization Steps (TOC + List of Figures/Tables + PDF)
- [ ] ID: MANUAL_TOC_01
  Location: Table of Contents (Snippet: "<<MANUAL_TOC_01: Update the Table of Contents after final formatting in Word>>")
  What to insert: Replace the TOC placeholder with Word auto-generated Table of Contents.
  Steps: In Word: place cursor at TOC location -> References tab -> Table of Contents -> Automatic Table. Then update after final edits.
  Evidence file: evidence/word/toc.txt (optional)
  Screenshot must show: Not required (Word formatting step).
- [ ] ID: MANUAL_YEAR_01
  Location: REFERENCES (Snippet: "[1] "Solidity Documentation," Solidity Foundation, <<MANUAL_YEAR_01: Publication year>>. (Accessed: <<MANUAL_REFDATE_01: Access date>>). ...")
  What to insert: Insert the publication year for Reference [1].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-1-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_YEAR_02
  Location: REFERENCES (Snippet: "[2] "OpenZeppelin Contracts Documentation," OpenZeppelin, <<MANUAL_YEAR_02: Publication year>>. (Accessed: <<MANUAL_REFDATE_02: Access da...")
  What to insert: Insert the publication year for Reference [2].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-2-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_YEAR_03
  Location: REFERENCES (Snippet: "[3] "Hardhat Documentation," Nomic Foundation, <<MANUAL_YEAR_03: Publication year>>. (Accessed: <<MANUAL_REFDATE_03: Access date>>). Avai...")
  What to insert: Insert the publication year for Reference [3].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-3-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_YEAR_04
  Location: REFERENCES (Snippet: "[4] "ethers.js Documentation," ethers.org, <<MANUAL_YEAR_04: Publication year>>. (Accessed: <<MANUAL_REFDATE_04: Access date>>). Availabl...")
  What to insert: Insert the publication year for Reference [4].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-4-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_YEAR_05
  Location: REFERENCES (Snippet: "[5] "React Documentation," Meta, <<MANUAL_YEAR_05: Publication year>>. (Accessed: <<MANUAL_REFDATE_05: Access date>>). Available: <<MANUA...")
  What to insert: Insert the publication year for Reference [5].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-5-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_YEAR_06
  Location: REFERENCES (Snippet: "[6] "Vite Documentation," Vite, <<MANUAL_YEAR_06: Publication year>>. (Accessed: <<MANUAL_REFDATE_06: Access date>>). Available: <<MANUAL...")
  What to insert: Insert the publication year for Reference [6].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-6-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_YEAR_07
  Location: REFERENCES (Snippet: "[7] "MetaMask Documentation," ConsenSys, <<MANUAL_YEAR_07: Publication year>>. (Accessed: <<MANUAL_REFDATE_07: Access date>>). Available:...")
  What to insert: Insert the publication year for Reference [7].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-7-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_YEAR_08
  Location: REFERENCES (Snippet: "[8] "Ethereum Sepolia Testnet Documentation," Ethereum Foundation, <<MANUAL_YEAR_08: Publication year>>. (Accessed: <<MANUAL_REFDATE_08: ...")
  What to insert: Insert the publication year for Reference [8].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-8-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_YEAR_09
  Location: REFERENCES (Snippet: "[9] "merkletreejs Documentation," merkletreejs, <<MANUAL_YEAR_09: Publication year>>. (Accessed: <<MANUAL_REFDATE_09: Access date>>). Ava...")
  What to insert: Insert the publication year for Reference [9].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-9-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_YEAR_10
  Location: REFERENCES (Snippet: "[10] "Express Documentation," OpenJS Foundation, <<MANUAL_YEAR_10: Publication year>>. (Accessed: <<MANUAL_REFDATE_10: Access date>>). Av...")
  What to insert: Insert the publication year for Reference [10].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-10-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_YEAR_11
  Location: REFERENCES (Snippet: "[11] "Vercel Documentation," Vercel, <<MANUAL_YEAR_11: Publication year>>. (Accessed: <<MANUAL_REFDATE_11: Access date>>). Available: <<M...")
  What to insert: Insert the publication year for Reference [11].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-11-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_YEAR_12
  Location: REFERENCES (Snippet: "[12] "Render Documentation," Render, <<MANUAL_YEAR_12: Publication year>>. (Accessed: <<MANUAL_REFDATE_12: Access date>>). Available: <<M...")
  What to insert: Insert the publication year for Reference [12].
  Steps: Open the official documentation page for that reference and find the copyright or publication year. If no year is shown, use "n.d." and note in your records.
  Evidence file: evidence/references/ref-12-year.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_01
  Location: REFERENCES (Snippet: "[1] "Solidity Documentation," Solidity Foundation, <<MANUAL_YEAR_01: Publication year>>. (Accessed: <<MANUAL_REFDATE_01: Access date>>). ...")
  What to insert: Insert the access date for Reference [1] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-1-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_02
  Location: REFERENCES (Snippet: "[2] "OpenZeppelin Contracts Documentation," OpenZeppelin, <<MANUAL_YEAR_02: Publication year>>. (Accessed: <<MANUAL_REFDATE_02: Access da...")
  What to insert: Insert the access date for Reference [2] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-2-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_03
  Location: REFERENCES (Snippet: "[3] "Hardhat Documentation," Nomic Foundation, <<MANUAL_YEAR_03: Publication year>>. (Accessed: <<MANUAL_REFDATE_03: Access date>>). Avai...")
  What to insert: Insert the access date for Reference [3] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-3-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_04
  Location: REFERENCES (Snippet: "[4] "ethers.js Documentation," ethers.org, <<MANUAL_YEAR_04: Publication year>>. (Accessed: <<MANUAL_REFDATE_04: Access date>>). Availabl...")
  What to insert: Insert the access date for Reference [4] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-4-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_05
  Location: REFERENCES (Snippet: "[5] "React Documentation," Meta, <<MANUAL_YEAR_05: Publication year>>. (Accessed: <<MANUAL_REFDATE_05: Access date>>). Available: <<MANUA...")
  What to insert: Insert the access date for Reference [5] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-5-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_06
  Location: REFERENCES (Snippet: "[6] "Vite Documentation," Vite, <<MANUAL_YEAR_06: Publication year>>. (Accessed: <<MANUAL_REFDATE_06: Access date>>). Available: <<MANUAL...")
  What to insert: Insert the access date for Reference [6] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-6-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_07
  Location: REFERENCES (Snippet: "[7] "MetaMask Documentation," ConsenSys, <<MANUAL_YEAR_07: Publication year>>. (Accessed: <<MANUAL_REFDATE_07: Access date>>). Available:...")
  What to insert: Insert the access date for Reference [7] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-7-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_08
  Location: REFERENCES (Snippet: "[8] "Ethereum Sepolia Testnet Documentation," Ethereum Foundation, <<MANUAL_YEAR_08: Publication year>>. (Accessed: <<MANUAL_REFDATE_08: ...")
  What to insert: Insert the access date for Reference [8] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-8-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_09
  Location: REFERENCES (Snippet: "[9] "merkletreejs Documentation," merkletreejs, <<MANUAL_YEAR_09: Publication year>>. (Accessed: <<MANUAL_REFDATE_09: Access date>>). Ava...")
  What to insert: Insert the access date for Reference [9] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-9-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_10
  Location: REFERENCES (Snippet: "[10] "Express Documentation," OpenJS Foundation, <<MANUAL_YEAR_10: Publication year>>. (Accessed: <<MANUAL_REFDATE_10: Access date>>). Av...")
  What to insert: Insert the access date for Reference [10] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-10-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_11
  Location: REFERENCES (Snippet: "[11] "Vercel Documentation," Vercel, <<MANUAL_YEAR_11: Publication year>>. (Accessed: <<MANUAL_REFDATE_11: Access date>>). Available: <<M...")
  What to insert: Insert the access date for Reference [11] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-11-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REFDATE_12
  Location: REFERENCES (Snippet: "[12] "Render Documentation," Render, <<MANUAL_YEAR_12: Publication year>>. (Accessed: <<MANUAL_REFDATE_12: Access date>>). Available: <<M...")
  What to insert: Insert the access date for Reference [12] (the date you accessed the page).
  Steps: Use today's date (the day you verify the reference) in a consistent format (e.g., 2026-02-11).
  Evidence file: evidence/references/ref-12-access-date.txt
  Screenshot must show: Not required (text entry).
- [ ] ID: MANUAL_REF_LINK_01
  Location: REFERENCES (Snippet: "[1] "Solidity Documentation," Solidity Foundation, <<MANUAL_YEAR_01: Publication year>>. (Accessed: <<MANUAL_REFDATE_01: Access date>>). ...")
  What to insert: Insert the official documentation URL for Reference [1].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-1-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.
- [ ] ID: MANUAL_REF_LINK_02
  Location: REFERENCES (Snippet: "[2] "OpenZeppelin Contracts Documentation," OpenZeppelin, <<MANUAL_YEAR_02: Publication year>>. (Accessed: <<MANUAL_REFDATE_02: Access da...")
  What to insert: Insert the official documentation URL for Reference [2].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-2-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.
- [ ] ID: MANUAL_REF_LINK_03
  Location: REFERENCES (Snippet: "[3] "Hardhat Documentation," Nomic Foundation, <<MANUAL_YEAR_03: Publication year>>. (Accessed: <<MANUAL_REFDATE_03: Access date>>). Avai...")
  What to insert: Insert the official documentation URL for Reference [3].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-3-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.
- [ ] ID: MANUAL_REF_LINK_04
  Location: REFERENCES (Snippet: "[4] "ethers.js Documentation," ethers.org, <<MANUAL_YEAR_04: Publication year>>. (Accessed: <<MANUAL_REFDATE_04: Access date>>). Availabl...")
  What to insert: Insert the official documentation URL for Reference [4].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-4-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.
- [ ] ID: MANUAL_REF_LINK_05
  Location: REFERENCES (Snippet: "[5] "React Documentation," Meta, <<MANUAL_YEAR_05: Publication year>>. (Accessed: <<MANUAL_REFDATE_05: Access date>>). Available: <<MANUA...")
  What to insert: Insert the official documentation URL for Reference [5].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-5-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.
- [ ] ID: MANUAL_REF_LINK_06
  Location: REFERENCES (Snippet: "[6] "Vite Documentation," Vite, <<MANUAL_YEAR_06: Publication year>>. (Accessed: <<MANUAL_REFDATE_06: Access date>>). Available: <<MANUAL...")
  What to insert: Insert the official documentation URL for Reference [6].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-6-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.
- [ ] ID: MANUAL_REF_LINK_07
  Location: REFERENCES (Snippet: "[7] "MetaMask Documentation," ConsenSys, <<MANUAL_YEAR_07: Publication year>>. (Accessed: <<MANUAL_REFDATE_07: Access date>>). Available:...")
  What to insert: Insert the official documentation URL for Reference [7].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-7-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.
- [ ] ID: MANUAL_REF_LINK_08
  Location: REFERENCES (Snippet: "[8] "Ethereum Sepolia Testnet Documentation," Ethereum Foundation, <<MANUAL_YEAR_08: Publication year>>. (Accessed: <<MANUAL_REFDATE_08: ...")
  What to insert: Insert the official documentation URL for Reference [8].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-8-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.
- [ ] ID: MANUAL_REF_LINK_09
  Location: REFERENCES (Snippet: "[9] "merkletreejs Documentation," merkletreejs, <<MANUAL_YEAR_09: Publication year>>. (Accessed: <<MANUAL_REFDATE_09: Access date>>). Ava...")
  What to insert: Insert the official documentation URL for Reference [9].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-9-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.
- [ ] ID: MANUAL_REF_LINK_10
  Location: REFERENCES (Snippet: "[10] "Express Documentation," OpenJS Foundation, <<MANUAL_YEAR_10: Publication year>>. (Accessed: <<MANUAL_REFDATE_10: Access date>>). Av...")
  What to insert: Insert the official documentation URL for Reference [10].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-10-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.
- [ ] ID: MANUAL_REF_LINK_11
  Location: REFERENCES (Snippet: "[11] "Vercel Documentation," Vercel, <<MANUAL_YEAR_11: Publication year>>. (Accessed: <<MANUAL_REFDATE_11: Access date>>). Available: <<M...")
  What to insert: Insert the official documentation URL for Reference [11].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-11-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.
- [ ] ID: MANUAL_REF_LINK_12
  Location: REFERENCES (Snippet: "[12] "Render Documentation," Render, <<MANUAL_YEAR_12: Publication year>>. (Accessed: <<MANUAL_REFDATE_12: Access date>>). Available: <<M...")
  What to insert: Insert the official documentation URL for Reference [12].
  Steps: Open the official documentation page in a browser and copy the exact URL from the address bar.
  Evidence file: evidence/references/ref-12-url.txt
  Screenshot must show: Browser URL bar with the doc page visible.

Word final checks (no placeholders):
1. Update List of Figures and List of Tables in Word (References -> Update Table).
2. Ensure page numbers are bottom-center (Insert -> Page Number -> Bottom of Page -> Plain Number 2).
3. Export to PDF (File -> Save As -> PDF).
4. Use Word Find to search for `<<MANUAL_` and confirm zero remaining placeholders.
