# BharatVote - Week 3 Frontend: Voter Interface & Commit Phase

## 📋 Purpose

This is the **Week 3 frontend implementation** of the BharatVote voting system. It builds upon Week 1's wallet connection and Week 2's contract integration by adding the **voter interface for the commit phase** - allowing users to view candidates and submit encrypted vote commitments.

### What Week 3 Achieves

- **Candidate Display**: Shows list of active candidates from smart contract
- **Commit Vote UI**: Form for voters to select a candidate and commit their vote
- **Hash Generation**: Client-side generation of cryptographic commitment (hash)
- **Salt Management**: Generates and stores random salt for reveal phase
- **Transaction Handling**: Submits `commitVote()` transaction to blockchain
- **Voter Status**: Shows if user has already committed a vote
- **Phase-Aware UI**: Displays correct interface based on current election phase

---

## 🗂️ Project Structure

```
BharatVote-Week3-Frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # App header with phase badge
│   │   ├── MainContainer.tsx          # Layout wrapper
│   │   ├── PrimaryButton.tsx          # Reusable button
│   │   ├── Toast.tsx                  # Notification system
│   │   ├── CandidateCard.tsx          # NEW: Individual candidate display
│   │   └── CommitVote.tsx             # NEW: Commit vote form
│   │
│   ├── types/
│   │   ├── wallet.ts                  # Wallet state types
│   │   └── contracts.ts               # Contract interface types
│   │
│   ├── contracts/
│   │   └── BharatVote.json            # Contract ABI + address
│   │
│   ├── App.tsx                        # Main app with voter interface
│   ├── main.tsx                       # React entry point
│   ├── useWallet.ts                   # Wallet connection hook
│   ├── constants.ts                   # App constants (updated for voting)
│   ├── abi.ts                         # Clean ABI exports
│   ├── polyfills.ts                   # Browser polyfills
│   ├── index.css                      # Global styles
│   └── vite-env.d.ts                  # Vite type declarations
│
├── index.html                          # HTML entry point
├── vite.config.ts                      # Vite configuration
├── tailwind.config.js                  # Tailwind CSS config
├── tsconfig.json                       # TypeScript config
├── package.json                        # Dependencies
└── README.md                           # This file
```

---

## 🆕 What's New in Week 3?

### 1. Candidate Display

**Purpose**: Fetch and display active candidates from smart contract

**Implementation**:
```typescript
// In App.tsx
const [candidates, setCandidates] = useState<Candidate[]>([]);

useEffect(() => {
  const fetchCandidates = async () => {
    if (!contract) return;
    try {
      const candidateList = await contract.getCandidates();
      const formatted = candidateList.map((c) => ({
        id: Number(c.id),
        name: c.name,
        isActive: c.isActive,
      }));
      setCandidates(formatted.filter(c => c.isActive));
    } catch (err) {
      console.error('Failed to fetch candidates:', err);
    }
  };
  fetchCandidates();
}, [contract]);
```

---

### 2. CommitVote Component

**Purpose**: Allow voters to select candidate and commit encrypted vote

**Key Features**:
- Candidate selection UI (radio buttons or cards)
- Generate random 32-byte salt
- Compute commitment hash: `keccak256(candidateId + salt)`
- Store salt in localStorage for reveal phase
- Submit `commitVote(hash, [])` transaction

**Hash Generation**:
```typescript
import { ethers } from 'ethers';

// Generate random salt
const salt = ethers.randomBytes(32);

// Compute commitment hash
const commitment = ethers.keccak256(
  ethers.solidityPacked(
    ["uint256", "bytes32"],
    [candidateId, salt]
  )
);

// Store for reveal phase
localStorage.setItem('bharatvote_salt', ethers.hexlify(salt));
localStorage.setItem('bharatvote_choice', candidateId.toString());
localStorage.setItem('bharatvote_commitment', commitment);

// Submit to contract
await contract.commitVote(commitment, []);
```

---

### 3. Voter Status Check

**Purpose**: Prevent double-voting by checking if user already committed

**Implementation**:
```typescript
const [hasCommitted, setHasCommitted] = useState(false);

useEffect(() => {
  const checkVoterStatus = async () => {
    if (!contract || !account) return;
    try {
      const committed = await contract.hasCommitted(account);
      setHasCommitted(committed);
    } catch (err) {
      console.error('Failed to check voter status:', err);
    }
  };
  checkVoterStatus();
}, [contract, account]);

// In UI:
{hasCommitted ? (
  <div>✅ You have already committed your vote</div>
) : (
  <CommitVote candidates={candidates} />
)}
```

---

### 4. Phase-Aware Rendering

**Purpose**: Show correct UI based on election phase

**Implementation**:
```typescript
// In App.tsx
return (
  <>
    <Header phase={phase} account={account} />
    
    {phase === COMMIT_PHASE && (
      <div>
        <h2>Cast Your Vote</h2>
        {hasCommitted ? (
          <div>Vote committed. Wait for reveal phase.</div>
        ) : (
          <CommitVote candidates={candidates} contract={contract} />
        )}
      </div>
    )}
    
    {phase === REVEAL_PHASE && (
      <div>
        <h2>Reveal Phase</h2>
        <p>Reveal functionality coming in Week 4</p>
      </div>
    )}
    
    {phase === FINISH_PHASE && (
      <div>
        <h2>Election Complete</h2>
        <p>Results display coming in Week 5</p>
      </div>
    )}
  </>
);
```

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+ installed
- MetaMask extension installed
- Backend Hardhat node running with deployed contract
- Contract has candidates added by admin

### Step-by-Step Setup

1. **Navigate to Week 3 frontend directory**
   ```bash
   cd BharatVote-Week3-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Ensure backend is running**
   ```bash
   # In backend terminal
   cd ../BharatVote-Week3-Backend
   npm run node                        # Terminal 1 - Hardhat node

   cd mock-kyc-server                  # Terminal 2 - Mock KYC API (Week 3 folder)
   npm install                         # first time only
   npm start

   cd ..                               # Back to Week 3 backend root
   npm run deploy                      # Terminal 3 - deploy contract + add candidates
   ```

4. **Copy contract artifacts**
   The backend deployment script should copy `BharatVote.json` to:
   ```
   src/contracts/BharatVote.json
   ```
   
   If not, manually copy:
   ```bash
   cp ../BharatVote-Week3-Backend/artifacts/contracts/BharatVote.sol/BharatVote.json src/contracts/
   ```

5. **Start dev server**
   ```bash
   npm run dev
   ```
   
   Open browser to `http://localhost:5175`

6. **Connect MetaMask**
   - Ensure MetaMask is on localhost network (Chain ID 31337)
   - Connect with a non-admin account (not the deployer)
   - Admin account (0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266) sees admin interface
   - Other accounts see voter interface

---

## 🎯 Key Implementation Details

### 1. Cryptographic Commitment (Commit-Reveal)

**What is it?**
A two-phase voting process where votes are hidden until reveal phase.

**Phase 1: Commit (Week 3)**
1. Voter selects candidate (e.g., candidate 2)
2. Generate random salt: `0xabc123...` (32 bytes)
3. Compute hash: `keccak256(2 + 0xabc123...) = 0xdef456...`
4. Submit hash to blockchain: `commitVote(0xdef456...)`

**What's stored on-chain**: Only the hash `0xdef456...`
**What's NOT visible**: Which candidate, how voter voted

**Phase 2: Reveal (Week 4)**
1. Voter retrieves salt from localStorage
2. Submits original values: `revealVote(2, 0xabc123...)`
3. Contract recomputes hash and verifies match
4. Vote counted if hash matches commitment

---

### 2. Hash Generation with Ethers.js

**Code**:
```typescript
import { ethers } from 'ethers';

// User's choice
const candidateId = 2; // Selected candidate

// Generate random salt (32 bytes)
const salt = ethers.randomBytes(32);
console.log('Salt:', ethers.hexlify(salt));
// Example: 0x1234567890abcdef...

// Pack parameters using Solidity encoding
const encoded = ethers.solidityPacked(
  ["uint256", "bytes32"],
  [candidateId, salt]
);

// Hash the packed data
const commitment = ethers.keccak256(encoded);
console.log('Commitment:', commitment);
// Example: 0x9876543210fedcba...

// Store salt for later reveal
localStorage.setItem('bharatvote_salt', ethers.hexlify(salt));
localStorage.setItem('bharatvote_choice', candidateId.toString());
```

**Why `solidityPacked`?**
- Matches Solidity's `abi.encodePacked()`
- Contract uses same encoding during reveal verification
- Ensures hash matches during reveal phase

---

### 3. Transaction Flow

**User commits vote**:
```
1. User selects candidate on UI
2. Click "Commit Vote" button
3. Generate salt (random 32 bytes)
4. Compute hash = keccak256(candidateId + salt)
5. Call contract.commitVote(hash, [])
6. MetaMask popup appears
7. User approves transaction (~60,000 gas ≈ ₹450)
8. Wait for transaction confirmation
9. Store salt in localStorage
10. Show success message
```

**Gas Cost**: ~60,000 gas ≈ ₹450 (at 30 gwei, ETH ₹200,000)

---

### 4. LocalStorage Management

**Why store salt?**
- Voter needs salt during reveal phase (Week 4)
- Without salt, voter cannot reveal vote
- Salt is secret - never share or lose it

**Storage**:
```typescript
// After successful commit
localStorage.setItem('bharatvote_salt', ethers.hexlify(salt));
localStorage.setItem('bharatvote_choice', candidateId.toString());
localStorage.setItem('bharatvote_commitment', commitment);

// During reveal (Week 4)
const storedSalt = localStorage.getItem('bharatvote_salt');
const storedChoice = localStorage.getItem('bharatvote_choice');

if (!storedSalt || !storedChoice) {
  // Error: Cannot reveal without salt
}
```

**Security Note**: LocalStorage is accessible by JavaScript on same domain. For production, consider:
- Encrypted localStorage
- Browser's Indexed DB
- Hardware wallet signing

---

## 💰 Gas Costs (Week 3)

| Operation | Gas Cost | USD (30 gwei, $2000 ETH) | INR (₹80/$) |
|-----------|----------|---------------------------|-------------|
| Connect Wallet | 0 | $0 | ₹0 (Free) |
| Read Candidates | 0 | $0 | ₹0 (Free) |
| Check Voter Status | 0 | $0 | ₹0 (Free) |
| **`commitVote`** | **~60,000** | **~$3.60** | **~₹290** |

**Per voter in Week 3**: ~₹290 (commit only)
**Full cost (commit + reveal)**: ~₹500 (Week 4 adds reveal at ~₹210)

---

## 🔐 Security Features

### 1. Vote Privacy During Commit
- Only hash submitted to blockchain
- Impossible to determine vote from hash (one-way function)
- Admin cannot see who voted for whom

### 2. Double-Vote Prevention
- Contract tracks `hasCommitted[address]`
- Frontend checks before showing commit UI
- Transaction reverts if user tries to commit twice

### 3. Phase Enforcement
- Can only commit during phase 0
- Frontend hides commit UI in other phases
- Contract enforces phase restriction

### 4. Salt Storage Security
- Salt stored in browser localStorage
- Voter responsible for salt security
- Lost salt = cannot reveal vote

---

## 🧪 Testing the Commit Flow

### Prerequisites
- Backend node running
- Contract deployed with candidates
- MetaMask connected to localhost

### Test Steps

**Test 1: View Candidates**
1. Open app in browser
2. Connect with non-admin account
3. Should see list of 4 candidates (Archee Arjun, Shivangi Priya, Mohd Sultan, Keshav Gupta)
4. ✅ Verify candidates display correctly

**Test 2: Commit Vote**
1. Select a candidate (radio button or card)
2. Click "Commit Vote"
3. MetaMask popup appears
4. Approve transaction
5. Wait for confirmation (~2 seconds on localhost)
6. Should see success message
7. ✅ Verify vote committed

**Test 3: Check Voter Status**
1. After committing, refresh page
2. Should see "You have already committed your vote"
3. Commit UI should be hidden
4. ✅ Verify double-vote prevention

**Test 4: Check LocalStorage**
1. Open browser DevTools → Application → LocalStorage
2. Should see three entries:
   - `bharatvote_salt`: 0x1234...
   - `bharatvote_choice`: "2"
   - `bharatvote_commitment`: 0x9876...
3. ✅ Verify salt is stored

**Test 5: Try Double-Commit**
1. Clear localStorage (simulate new session)
2. Try to commit again
3. Should fail with "AlreadyCommitted" error
4. ✅ Verify blockchain prevents double-vote

---

## 📊 What's Included vs. What's Not

### ✅ Included in Week 3

- **Wallet Connection** (from Week 1)
- **Contract Integration** (from Week 2)
- **Candidate Display**: Fetch and show candidates
- **Commit Vote Form**: Select candidate + commit
- **Hash Generation**: Client-side cryptography
- **Salt Management**: Generate and store
- **Transaction Handling**: Submit to blockchain
- **Voter Status Check**: Prevent double-voting
- **Phase-Aware UI**: Show correct interface

### ❌ Not Included (Coming Later)

- **Reveal Vote**: Week 4 (revealVote function)
- **Results Display**: Week 5 (tally and winner)
- **Admin Dashboard**: Week 6 (candidate management)
- **Real-Time Updates**: Week 7 (event listeners)
- **Production Polish**: Week 8 (error handling, responsive design)

---

## 🔧 Available Commands

| Command | What It Does |
|---------|--------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start dev server (port 5175) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## 🐛 Troubleshooting

### Error: "Contract not found"
**Solution**: 
1. Ensure backend Hardhat node is running
2. Run `npm run deploy` in backend
3. Check `src/contracts/BharatVote.json` exists

### Error: "AlreadyCommitted"
**Solution**: This is expected. Each voter can only commit once. Try with different MetaMask account.

### Error: "WrongPhase"
**Cause**: Trying to commit in reveal or finished phase.
**Solution**: Admin must ensure election is in commit phase (phase 0).

### Hash Mismatch in Reveal (Week 4)
**Cause**: Salt or choice stored incorrectly.
**Solution**: 
- Check localStorage has all three values
- Ensure salt is hex string (0x...)
- Don't manually edit stored values

### Transaction Fails
**Solution**:
- Check MetaMask is on correct network (localhost, Chain ID 31337)
- Ensure you have enough ETH (Hardhat gives 10,000 ETH)
- Check browser console for error details

---

## 📚 Key Concepts Explained

### **Commit-Reveal Scheme**
Cryptographic protocol that keeps votes hidden until all commits are in. Prevents manipulation.

### **Keccak256 Hash Function**
Ethereum's one-way hash function. Cannot reverse hash to get original data.

### **Salt**
Random data added before hashing. Makes each voter's hash unique even for same candidate.

### **solidityPacked**
Encodes data using Solidity's packing rules. Ensures frontend and contract compute same hash.

### **LocalStorage**
Browser storage for key-value pairs. Persists across page refreshes. Used to store salt.

### **Gas**
Computational cost on Ethereum. Committing vote costs ~60,000 gas ≈ ₹290.

---

## 🔗 Next Steps

### Week 4 Preview

**Reveal Phase Implementation**:
- Retrieve salt from localStorage
- `revealVote(choice, salt)` function
- Hash verification on contract
- Vote tallying
- Error handling for missing salt

**Code Preview**:
```typescript
// Week 4: RevealVote.tsx
const handleReveal = async () => {
  const salt = localStorage.getItem('bharatvote_salt');
  const choice = localStorage.getItem('bharatvote_choice');
  
  if (!salt || !choice) {
    alert('Cannot find your commitment. Did you commit?');
    return;
  }
  
  try {
    const tx = await contract.revealVote(
      Number(choice),
      salt
    );
    await tx.wait();
    alert('Vote revealed successfully!');
  } catch (err) {
    console.error('Reveal failed:', err);
  }
};
```

---

## 🎓 For Your Presentation

### Key Points to Explain

1. **What Commit-Reveal Is**:
   - Two-phase voting for privacy
   - Commit: Submit hash (encrypted vote)
   - Reveal: Submit original + salt for verification

2. **How Hash Generation Works**:
   ```
   User choice: Candidate 2
   Random salt: 0xabc123...
   Hash: keccak256(2 + 0xabc123...) = 0xdef456...
   Blockchain stores: 0xdef456... only
   ```

3. **Why Salt Matters**:
   - Without salt: Hash of "vote for 2" is always same
   - Attacker could pre-compute hashes for all candidates
   - With salt: Each voter's hash is unique

4. **Gas Costs**:
   - Commit: ~₹290 per voter
   - Reveal: ~₹210 per voter (Week 4)
   - Total: ~₹500 per voter

5. **Security**:
   - Vote hidden during commit phase
   - Cannot change vote after committing (cryptographic binding)
   - Contract prevents double-voting

### Demo Script

```
1. Open app, connect wallet
2. Show candidate list
3. Select a candidate
4. Click "Commit Vote"
5. Approve in MetaMask
6. Wait for confirmation
7. Show success + localStorage salt
8. Refresh page - show "already committed"
9. Open browser console - show stored salt
```

---

## 📖 Further Reading

- [Commit-Reveal Schemes Explained](https://medium.com/@sinanqd/commit-reveal-scheme-in-solidity-8c9e9f6f2e8c)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Keccak256 Hash Function](https://en.wikipedia.org/wiki/SHA-3)
- [Browser LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

## 👨‍💻 Author

**BharatVote Development Team**  
Week 3 Progress - Voter Interface & Commit Phase

---

**This is Week 3: Commit Phase Voting. Reveal phase comes in Week 4.**

