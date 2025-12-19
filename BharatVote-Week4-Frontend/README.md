# BharatVote - Week 4 Frontend: Merkle Tree Eligibility Verification

## 📋 Purpose

This is the **Week 4 frontend implementation** of the BharatVote voting system. It builds upon Week 3's commit-reveal voting by integrating **backend API-based Merkle proof fetching** for voter eligibility verification. This week replaces client-side Merkle tree generation with server-side proof generation, enabling production-ready scalability and security.

### What Week 4 Achieves

- **Backend API Integration**: Fetches Merkle proofs from mock KYC server instead of building trees client-side
- **Production-Ready**: Scalable to millions of voters without client-side computation
- **Secure Proof Generation**: Proofs generated server-side with proper Merkle tree structure
- **KYC Integration**: Uses voter ID from KYC verification to fetch eligibility proofs
- **Full Commit-Reveal**: Complete voting flow with Merkle proof verification on-chain

---

## 🗂️ Project Structure

```
BharatVote-Week4-Frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # App header with phase badge
│   │   ├── KycPage.tsx                # KYC verification (stores voterId)
│   │   └── FaceRecognition.tsx        # Face verification component
│   │
│   ├── types/
│   │   ├── wallet.ts                  # Wallet state types
│   │   └── contracts.ts               # Contract interface types
│   │
│   ├── contracts/
│   │   └── BharatVote.json            # Contract ABI + address
│   │
│   ├── App.tsx                        # Main app (passes voterIdKyc to Voter)
│   ├── Voter.tsx                      # Voter component (fetches Merkle proofs)
│   ├── Admin.tsx                      # Admin interface
│   ├── main.tsx                       # React entry point
│   ├── useWallet.ts                   # Wallet connection hook
│   ├── constants.ts                   # App constants
│   ├── i18n.tsx                       # Internationalization
│   ├── polyfills.ts                   # Browser polyfills
│   ├── index.css                      # Global styles
│   └── vite-env.d.ts                  # Vite type declarations
│
├── index.html                          # HTML entry point
├── vite.config.ts                      # Vite configuration (port 5176)
├── tailwind.config.js                  # Tailwind CSS config
├── tsconfig.json                       # TypeScript config
├── package.json                        # Dependencies
└── README.md                           # This file
```

---

## 🆕 What's New in Week 4?

### 1. Backend API Merkle Proof Fetching

**Week 3 Approach:**
- Built Merkle tree client-side from hardcoded voter list
- Generated proofs locally using `merkletreejs`
- Limited scalability (all voters loaded in browser)

**Week 4 Approach:**
- Fetches Merkle proofs from backend API endpoint
- Server generates proofs from eligible voter list
- Scalable to millions of voters

**Implementation:**
```typescript
// In Voter.tsx
useEffect(() => {
  const fetchMerkleProof = async () => {
    if (!voterIdKyc || !contract) return;
    
    setIsLoadingProof(true);
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/merkle-proof?voter_id=${encodeURIComponent(voterIdKyc)}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch Merkle proof');
      }
      
      const proof = await response.json();
      setMerkleProof(proof);
      setIsEligible(true);
    } catch (error) {
      console.error('Error fetching Merkle proof:', error);
      setIsEligible(false);
    } finally {
      setIsLoadingProof(false);
    }
  };
  
  fetchMerkleProof();
}, [contract, voterIdKyc]);
```

### 2. KYC Integration with Voter ID Storage

**Week 3:**
- Used Ethereum address directly for eligibility
- No connection to KYC system

**Week 4:**
- Stores voter ID from KYC verification
- Uses voter ID to fetch Merkle proof from backend
- Links KYC data to blockchain voting

**Implementation:**
```typescript
// In App.tsx
const [voterIdKyc, setVoterIdKyc] = useState<string | undefined>(undefined);

// After KYC verification
onVerified={(voterId: string) => {
  setIsKycVerified(true);
  setVoterIdKyc(voterId);
  localStorage.setItem(`bv_voter_id_${account.toLowerCase()}`, voterId);
}}

// Pass to Voter component
<Voter
  contract={contract}
  voterId={account}
  voterIdKyc={voterIdKyc}  // ← NEW: Pass voter ID from KYC
  ...
/>
```

### 3. Updated Commit Vote Flow

**Week 3:**
```typescript
// Client-side proof generation
const tree = new MerkleTree(leaves, keccak256Hasher, {...});
const proof = tree.getProof(hashedBuffer).map(x => '0x' + x.data.toString('hex'));
await contract.commitVote(commitHash, proof);
```

**Week 4:**
```typescript
// Use proof from backend API
if (!merkleProof || merkleProof.length === 0) {
  setError('Unable to verify eligibility. Please complete KYC verification.');
  return;
}

await contract.commitVote(commitHash, merkleProof);
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+ installed
- Week 4 Backend deployed (contract + mock KYC server)
- MetaMask installed and configured

### Step-by-Step Setup

1. **Navigate to Week 4 frontend directory**
   ```bash
   cd BharatVote-Week4-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update contract address** (if needed)
   - After deploying Week 4 backend, copy the contract address
   - Update `src/contracts/BharatVote.json` with the new address

4. **Start the mock KYC server** (from Week 4 Backend)
   ```bash
   cd ../BharatVote-Week4-Backend/mock-kyc-server
   npm install
   npm start
   ```
   Server should run on `http://localhost:3001`

5. **Start the frontend dev server**
   ```bash
   cd ../../BharatVote-Week4-Frontend
   npm run dev
   ```
   Frontend should run on `http://localhost:5176`

6. **Connect MetaMask**
   - Ensure MetaMask is on localhost network (Chain ID 31337)
   - Connect with a non-admin account
   - Complete KYC verification with a valid voter ID (e.g., "VOTER1", "VOTER2")
   - Vote using the commit-reveal interface

---

## 🎯 Key Implementation Details

### 1. Merkle Proof API Integration

**Endpoint:** `GET /api/merkle-proof?voter_id={VOTER_ID}`

**Request:**
```typescript
const response = await fetch(
  `${BACKEND_URL}/api/merkle-proof?voter_id=${encodeURIComponent(voterIdKyc)}`
);
```

**Response:**
```json
[
  "0x2d8cf8e8e7e9dd8b0e9e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e",
  "0x1b7c8e9e8e7e9dd8b0e9e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e",
  "0x9f2c8e8e7e9dd8b0e9e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e"
]
```

**Error Handling:**
- `400 Bad Request`: Missing voter_id parameter
- `403 Forbidden`: Voter not found or ineligible
- `500 Internal Server Error`: Server-side error

### 2. Voter Eligibility Flow

1. **KYC Verification** → User enters voter ID (e.g., "VOTER1")
2. **Backend Validation** → Backend checks KYC data and returns wallet address
3. **Address Match** → Frontend verifies connected wallet matches KYC address
4. **Merkle Proof Fetch** → Frontend requests proof using voter ID
5. **Proof Storage** → Proof stored in component state
6. **Vote Commit** → Proof used in `commitVote()` transaction

### 3. State Management

**New State Variables:**
```typescript
const [merkleProof, setMerkleProof] = useState<string[] | null>(null);
const [isEligible, setIsEligible] = useState(false);
const [isLoadingProof, setIsLoadingProof] = useState(false);
const [voterIdKyc, setVoterIdKyc] = useState<string | undefined>(undefined);
```

**State Flow:**
1. `voterIdKyc` set after KYC verification
2. `isLoadingProof` true while fetching proof
3. `merkleProof` set when proof received
4. `isEligible` true when proof is valid

---

## 🔄 Differences from Week 3

| Feature | Week 3 | Week 4 |
|---------|--------|--------|
| **Merkle Proof Source** | Client-side generation | Backend API |
| **Voter List** | Hardcoded in frontend | Server-managed |
| **Scalability** | Limited (all voters in browser) | Unlimited (server-side) |
| **KYC Integration** | Basic (address only) | Full (voter ID + address) |
| **Proof Generation** | `merkletreejs` in browser | Backend Merkle tree |
| **Dependencies** | Requires `merkletreejs` | No client-side tree library needed |
| **Network Calls** | None (local computation) | API call per voter |

---

## 🐛 Troubleshooting

### Error: "Unable to verify eligibility"
**Cause**: Merkle proof not fetched or invalid voter ID.
**Solution**: 
- Ensure KYC verification completed successfully
- Check that voter ID exists in backend KYC data
- Verify mock KYC server is running on port 3001
- Check browser console for API errors

### Error: "Failed to fetch Merkle proof"
**Cause**: Backend API not accessible or voter not found.
**Solution**:
- Verify mock KYC server is running: `http://localhost:3001`
- Check backend logs for errors
- Ensure voter ID matches KYC data (e.g., "VOTER1", "VOTER2")
- Check CORS settings if accessing from different origin

### Error: "Voter ID not found in KYC records"
**Cause**: Voter ID doesn't exist in backend KYC data.
**Solution**:
- Use valid voter IDs from `mock-kyc-server/kyc-data.json`
- Common test IDs: "VOTER1", "VOTER2", "VOTER3", "VOTER4"
- Ensure wallet address matches the voter's registered address

### Proof Not Loading
**Cause**: `voterIdKyc` not set or API call failing.
**Solution**:
- Complete KYC verification first
- Check that `voterIdKyc` is passed to Voter component
- Verify `BACKEND_URL` constant is correct (`http://localhost:3001`)
- Check browser network tab for failed requests

---

## 📚 Key Concepts

### **Merkle Proofs from Backend**
Instead of building the entire Merkle tree in the browser, the frontend requests a proof from the backend API. The backend:
1. Maintains the full eligible voter list
2. Builds the Merkle tree server-side
3. Generates proofs for specific voters
4. Returns only the proof path (small data)

### **KYC to Blockchain Bridge**
Week 4 connects the KYC system to blockchain voting:
- KYC provides voter identity (voter ID)
- Backend maps voter ID to Ethereum address
- Merkle proof verifies address is in eligible list
- Smart contract verifies proof on-chain

### **Production Scalability**
Client-side Merkle trees don't scale:
- 1M voters = 1M addresses in browser memory
- Slow proof generation
- Large bundle size

Backend API approach:
- No voter data in browser
- Fast server-side proof generation
- Small proof size (10-15 hashes)
- Scales to millions of voters

---

## 🔗 Integration with Week 4 Backend

### Required Backend Services

1. **Mock KYC Server** (`mock-kyc-server/server.js`)
   - Endpoint: `GET /api/kyc?voter_id={ID}`
   - Endpoint: `GET /api/merkle-proof?voter_id={ID}`
   - Port: 3001

2. **Smart Contract** (deployed via `scripts/deploy.ts`)
   - Contract address in `src/contracts/BharatVote.json`
   - Merkle root set from `eligibleVoters.json`

### Environment Variables

Create `.env` file (optional):
```env
VITE_BACKEND_URL=http://localhost:3001
VITE_RPC_URL=http://127.0.0.1:8545
VITE_CHAIN_ID=31337
```

---

## 🎓 Learning Outcomes

By completing Week 4, you understand:

1. **API Integration**: How to fetch Merkle proofs from backend services
2. **Production Architecture**: Why server-side proof generation is better
3. **KYC Integration**: Connecting identity verification to blockchain voting
4. **State Management**: Managing async API calls and proof state
5. **Error Handling**: Handling API failures and invalid proofs
6. **Scalability**: Why client-side Merkle trees don't scale

---

## 📝 Next Steps

### Week 5 Preview
- Full Express.js backend server
- Database integration for voter data
- Advanced proof caching
- Rate limiting and security

---

**Week 4 Complete! Ready for Week 5: Full Backend Server Integration! 🎉**

