---
name: sync-week9-with-original
overview: Compare BharatVote main vs Week8 vs Week9 and align Week9 frontend/backend to original working code.
todos:
  - id: compare-frontend
    content: Diff frontend files main vs Week9 (and Week8)
    status: completed
  - id: compare-backend
    content: Diff backend files main vs Week9 (and Week8)
    status: completed
  - id: summarize-diffs
    content: Summarize deviations and needed fixes
    status: completed
  - id: apply-fixes
    content: Align Week9 code to original + Week9 features
    status: completed
  - id: redeploy-verify
    content: Redeploy, restart services, and verify UI/contract calls
    status: completed
---

## Plan

- Identify key app files to compare across versions: App.tsx, Admin.tsx, useWallet.ts, Tally.tsx, KycPage.tsx, Voter.tsx, constants, contracts/BharatVote.json, vite config, and backend server/deploy scripts.
- Diff main project `frontend/` against `BharatVote-Week9-Frontend/` (and Week8 if present) to list all deviations by file.
- Diff backend: compare `BharatVote-Week9-Backend/` (hardhat, deploy, backend/server) against main/backend equivalents (and Week8) to spot differences.
- Summarize functional differences (ABI, contract address, network configs, env vars, endpoints) and flag regressions.
- Propose minimal corrections: align Week9 files to the working originals and reapply only Week9-specific additions (statistics, events, merkle UX) where needed.