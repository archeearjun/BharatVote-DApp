# 2.5 API and Integration Planning

BharatVote's architecture bridges a traditional web/mobile frontend with Ethereum smart contracts, backed by a Node.js/Express API for KYC services. This section defines our REST endpoints, external touchpoints, and security controls.

## 2.5.1 API Design

### Base Configuration
- **Protocol**: HTTPS in production (HTTP allowed in local dev)
- **Base URLs**:
  - Dev: `http://localhost:3001`
  - Prod: `https://api.bharatvote.com` (planned)
- **Headers**:
  - `Content-Type: application/json`
  - CORS enabled for web origins

### Current Endpoints (Phase 2 - Implemented)

| Method | Path | Description | Request | Success Response | Errors |
|--------|------|-------------|---------|------------------|---------|
| GET | `/api/kyc?voter_id={id}` | Check KYC eligibility | Query: `voter_id` (string, required) | `200 OK`<br/>`{ eligible: true, address: "0x..." }` or `{ eligible: false }` | `400` (missing/invalid id)<br/>`500` |
| GET | `/api/merkle-proof?voter_id={id}` | Generate Merkle proof | Query: `voter_id` (string, required) | `200 OK`<br/>`["0xabc...", "..."]` (proof array) | `400`, `403` (not eligible), `500` |

### Planned Endpoints (Phase 3 - Future Implementation)

| Method | Path | Description | Request | Success Response | Errors |
|--------|------|-------------|---------|------------------|---------|
| POST | `/api/vote/commit` | Submit vote commitment | `{ voterId, electionId, commitHash, proof: string[] }` | `200 OK`<br/>`{ txHash: "0x..." }` | `400`, `403`, `500` |
| POST | `/api/vote/reveal` | Reveal vote | `{ voterId, electionId, candidateId, salt }` | `200 OK`<br/>`{ txHash: "0x..." }` | `400`, `403`, `500` |
| GET | `/api/elections/:id` | Fetch election metadata | Path: `:id` (UUID) | `200 OK`<br/>`{ electionId, title, phase, ... }` | `404`, `500` |
| POST | `/api/admin/elections` | Create new election (admin only) | `{ title, startCommit, endCommit, startReveal, endReveal }` | `201 Created`<br/>`{ electionId: "..." }` | `400`, `403`, `500` |
| PUT | `/api/admin/elections/:id/phase` | Advance election phase (admin) | `{ phase: "commit" \| "reveal" \| "finished" }` | `200 OK`<br/>`{ phase: "reveal" }` | `400`, `403`, `500` |

### Example Usage:
```bash
curl -X GET "http://localhost:3001/api/kyc?voter_id=VOTER1" \
     -H "Content-Type: application/json"
```

## 2.5.2 Integration Points

### Current Architecture (Phase 2)

| Layer | Component | Description | Implementation Status |
|-------|-----------|-------------|----------------------|
| **Backend API** | Node.js/Express | KYC verification, Merkle proof generation | ✅ Implemented |
| **Blockchain** | Smart contracts | Direct frontend interaction for voting | ✅ Implemented |
| **Web Wallet** | MetaMask via ethers.js | Account connection, transaction signing | ✅ Implemented |
| **Mobile Wallet** | Deep links to MetaMask | `metamask://` universal links | ✅ Implemented |
| **State Management** | React hooks / Context | Wallet & vote state management | ✅ Implemented |

### Voting Flow (Current Implementation)
```
1. Frontend → Backend API → KYC Verification
2. Frontend → Backend API → Merkle Proof Generation  
3. Frontend → Smart Contract → Vote Commitment (Direct)
4. Frontend → Smart Contract → Vote Reveal (Direct)
5. Frontend → Smart Contract → Results Fetching (Direct)
```

### Planned Architecture (Phase 3)
```
All operations: Frontend → Backend API → Smart Contract
```

## 2.5.3 Security Measures

### Wallet-Based Authentication
- Users authenticate by connecting MetaMask (no passwords or JWTs)
- Admin role verified on-chain via `contract.admin()` 
- Message signing for additional security (optional)

### Commit-Reveal Privacy
- Votes committed as `keccak256(candidateId, salt)` on-chain
- Salt revealed only in Reveal phase to preserve ballot secrecy
- Local encrypted backup of vote commitments

### API Protections
- **CORS**: Restricted to known origins (`localhost:3000`, `localhost:5173`)
- **Rate Limiting**: 
  - KYC endpoint: 100 requests/15 minutes per IP
  - Merkle proof: 50 requests/5 minutes per IP
- **Input Validation**: Regex checks for voter IDs (`/^[A-Za-z0-9]{3,20}$/`)

### Smart Contract Safeguards
- **Access Modifiers**: `onlyAdmin`, `onlyPhase`, `hasNotCommitted`, `hasNotRevealed`
- **Security Testing**: Unit test coverage via Hardhat
- **Gas Optimization**: Estimated gas with 20% buffer

## 2.5.4 Current vs Planned Features

### ✅ **Phase 2 (Current Implementation)**
- KYC verification API
- Merkle proof generation API
- Direct blockchain voting interface
- MetaMask wallet integration
- Admin panel for election management

### 🚧 **Phase 3 (Planned Enhancements)**  
- Centralized vote processing API
- Election lifecycle management API
- Enhanced admin controls API
- Vote analytics and reporting
- Multi-election support

## 2.5.5 Deliverables

✅ **API Documentation**: Complete specifications for implemented endpoints with examples  
✅ **Integration Plan**: Current architecture with planned evolution path  
✅ **Security Framework**: Wallet-based auth, commit-reveal privacy, API protections  
🚧 **Future Roadmap**: Phase 3 API expansion plan

This structured approach ensures current functionality is properly documented while providing a clear path for future API enhancements. 