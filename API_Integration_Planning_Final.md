## 2.5 API and Integration Planning

BharatVote's prototype separates KYC services (via a Node.js/Express API) from on-chain voting (direct smart-contract calls). This section documents the two existing endpoints, outlines planned server APIs, describes external touchpoints, and summarizes our security controls.

---

### 2.5.1 API Design

#### Base Configuration

* **Protocol**: HTTPS (production) / HTTP (local)
* **Dev URL**: `http://localhost:3001`
* **Prod URL** (Phase 3): `https://api.bharatvote.com`
* **Headers**:
  * `Content-Type: application/json`
  * CORS enabled for `localhost:3000`, `localhost:5173`

#### Current Endpoints (Phase 2 – Implemented)

| Method | Path | Description | Request | Success Response | Errors |
|--------|------|-------------|---------|------------------|--------|
| GET | `/api/kyc?voter_id={id}` | KYC eligibility check | Query: `voter_id` (string) | `200 OK`<br/>`{ eligible: true, address: "0x..." }`<br/>or `{ eligible: false }` | `400` (missing/invalid id)<br/>`500` |
| GET | `/api/merkle-proof?voter_id={id}` | Merkle proof generation | Query: `voter_id` (string) | `200 OK`<br/>`["0xabc...", "..."]` (proof array) | `400`, `403` (not eligible), `500` |

#### Planned Endpoints (Phase 3 – Roadmap)

| Method | Path | Description | Request Payload | Success Response | Errors |
|--------|------|-------------|-----------------|------------------|--------|
| POST | `/api/vote/commit` | Vote commitment via API | `{ voterId, electionId, commitHash, proof: string[] }` | `200 OK`<br/>`{ txHash: "0x..." }` | `400`, `403`, `500` |
| POST | `/api/vote/reveal` | Vote reveal via API | `{ voterId, electionId, candidateId, salt }` | `200 OK`<br/>`{ txHash: "0x..." }` | `400`, `403`, `500` |
| GET | `/api/elections/:id` | Fetch election metadata | Path param: `id` (UUID) | `200 OK`<br/>`{ electionId, title, phase, ... }` | `404`, `500` |
| POST | `/api/admin/elections` *(admin only)* | Create new election | `{ title, startCommit, endCommit, startReveal, endReveal }` | `201 Created`<br/>`{ electionId: "..." }` | `400`, `403`, `500` |
| PUT | `/api/admin/elections/:id/phase` | Advance or rollback phase | `{ phase: "commit" \| "reveal" \| "finished" }` | `200 OK`<br/>`{ phase: "reveal" }` | `400`, `403`, `500` |

> **Example Usage**
>
> ```bash
> curl -X GET "http://localhost:3001/api/kyc?voter_id=VOTER1" \
>      -H "Content-Type: application/json"
> ```

---

### 2.5.2 Integration Points

#### Current Architecture (Phase 2)

| Layer | Component | Role | Status |
|-------|-----------|------|--------|
| **Backend API** | Node.js / Express | KYC & Merkle‐proof services | ✅ Implemented |
| **Blockchain** | Ethereum contracts | Commit-reveal voting (direct calls) | ✅ Implemented |
| **Web Wallet** | MetaMask / ethers.js | Account & transaction management | ✅ Implemented |
| **Mobile Wallet** | MetaMask deep links | Wallet connection via `metamask://` | ✅ Implemented |
| **State Management** | React hooks / Context | Wallet & voting state on Web & Mobile | ✅ Implemented |

#### Voting Flow (Current Implementation)

1. **KYC Verification**: Web/Mobile → `GET /api/kyc` → eligibility confirmation
2. **Proof Generation**: Web/Mobile → `GET /api/merkle-proof` → Merkle proof array
3. **Vote Commitment**: Direct `contract.commitVote(...)` via MetaMask
4. **Vote Reveal**: Direct `contract.revealVote(...)` via MetaMask
5. **Results Fetching**: Direct `contract.tally(...)` or blockchain event listening

#### Future Architecture (Phase 3)

*All voting interactions will route through the backend API → backend will relay transactions on-chain for enhanced control and monitoring.*

---

### 2.5.3 Security Measures

#### 1. Wallet-Based Authentication
* No usernames/passwords or JWTs required
* Users connect & sign challenges with MetaMask
* Admin privileges confirmed via on-chain `contract.admin()` verification

#### 2. Commit-Reveal Privacy
* Votes hashed with `keccak256(candidateId, salt)` on-chain
* Salt stored client-side only until reveal phase
* Prevents vote disclosure during commit phase

#### 3. API Security Controls
* **CORS**: Restricted to trusted origins only
* **Rate Limiting**:
  * KYC endpoint: 100 requests / 15 minutes / IP
  * Merkle-proof endpoint: 50 requests / 5 minutes / IP
* **Input Validation**: Regex validation on `voter_id` (`/^[A-Za-z0-9]{3,20}$/`)

#### 4. Smart Contract Safeguards
* **Access Modifiers**: `onlyAdmin`, `onlyPhase`, `hasNotCommitted`, `hasNotRevealed`
* **Testing Coverage**: Hardhat test suite with ≥90% coverage
* **Gas Optimization**: Gas estimation with 20% buffer for transaction reliability
* **Security Analysis**: Static analysis with Slither

---

### 2.5.4 Implementation Status Summary

| Feature | Phase 2 (Current) | Phase 3 (Planned) |
|---------|-------------------|-------------------|
| KYC & Merkle-proof APIs | ✅ Implemented | ✅ Maintained |
| Direct smart-contract voting | ✅ Implemented | 🔄 Migrate to API-mediated |
| Vote commit/reveal endpoints | ❌ Not implemented | 🚧 Planned |
| Election lifecycle management APIs | ❌ Not implemented | 🚧 Planned |
| Multi-election support | ❌ Single election only | 🚧 Planned |
| Vote analytics & reporting | ❌ Basic tallying only | 🚧 Enhanced analytics planned |

---

### 2.5.5 Deliverables

✅ **API Documentation**:
* Complete specifications for existing endpoints with examples and error codes
* Phase 3 roadmap with planned API extensions

✅ **Integration Plan**:
* Current system architecture with component interactions
* Clear separation between KYC services and on-chain voting
* Migration path to fully API-driven voting pipeline

✅ **Security Framework**:
* Wallet-based authentication mechanisms
* Commit-reveal privacy implementation
* API security controls (CORS, rate limiting, input validation)
* Smart contract security measures and testing protocols

This documentation accurately reflects our current implementation while providing a clear roadmap for the evolution to a fully API-driven voting system in Phase 3. 