# BharatVote - Week 5 Frontend: Voter Interface (Reveal Phase)

## 📋 Purpose

This is the **Week 5 frontend implementation** of the BharatVote voting system. Week 5 focuses on the **Reveal Phase** of the voting interface, where voters reveal their committed votes. This week completes the full commit-reveal voting cycle with proper transaction handling, proof generation, and user feedback.

### What Week 5 Achieves

- **Reveal Phase UI**: Complete interface for voters to reveal their committed votes
- **Transaction Handling**: Proper handling of reveal transactions with error recovery
- **Hash Verification**: Client-side verification before submitting to blockchain
- **User Feedback**: Clear success/error messages and loading states
- **Backend Integration**: Full integration with Week 5 Express backend server
- **Production-Ready**: Complete voting flow ready for real-world use

---

## 🗂️ Project Structure

```
BharatVote-Week5-Frontend/
├── src/
│   ├── components/
│   │   ├── Header.tsx                 # App header with phase badge
│   │   ├── KycPage.tsx                # KYC verification
│   │   └── FaceRecognition.tsx        # Face verification
│   │
│   ├── types/
│   │   ├── wallet.ts                  # Wallet state types
│   │   └── contracts.ts               # Contract interface types
│   │
│   ├── contracts/
│   │   └── BharatVote.json            # Contract ABI + address
│   │
│   ├── App.tsx                        # Main app component
│   ├── Voter.tsx                      # ⭐ WEEK 5 FOCUS: Voter interface with reveal phase
│   ├── Admin.tsx                      # Admin interface
│   ├── main.tsx                       # React entry point
│   ├── useWallet.ts                   # Wallet connection hook
│   ├── constants.ts                   # App constants
│   └── ...
│
├── index.html                          # HTML entry point
├── vite.config.ts                      # Vite configuration
├── package.json                        # Dependencies
└── README.md                           # This file
```

---

## 🆕 What's New in Week 5

### 1. Reveal Phase Implementation (Main Focus)

**Location:** `src/Voter.tsx` (Lines 258-298)

**Key Features:**
- **Reveal Vote Function**: `handleRevealVote()` - Complete reveal transaction flow
- **Hash Verification**: Client-side verification before blockchain submission
- **Error Handling**: Comprehensive error messages for common failures
- **Loading States**: Visual feedback during transaction processing
- **Success Feedback**: Confirmation messages and state updates

**Reveal Flow:**
1. User selects candidate (same as commit phase)
2. User enters salt/password (same as commit phase)
3. Client verifies hash matches committed hash
4. Transaction submitted to blockchain
5. Contract verifies hash and counts vote
6. UI updates to show revealed status

### 2. Transaction Handling

**Hash Verification:**
```typescript
const { commitHash: expectedCommitHash } = await hashVote(selectedCandidateId, salt.trim());
if (expectedCommitHash.toLowerCase() !== storedHash.toLowerCase()) {
  throw new Error('Hash mismatch! Use the same candidate and password.');
}
```

**Transaction Submission:**
```typescript
const candidateId = BigInt(selectedCandidateId);
const bytes32Salt = ethers.keccak256(ethers.toUtf8Bytes(salt.trim()));
const tx = await contract.revealVote(candidateId, bytes32Salt);
await tx.wait();
```

**Error Handling:**
- Hash mismatch → Clear error message
- Transaction rejection → User-friendly message
- Network errors → Retry guidance
- Contract errors → Specific error messages

### 3. User Experience Enhancements

**Loading States:**
- `isRevealing` state shows spinner during transaction
- Disabled buttons prevent double-submission
- Clear visual feedback throughout process

**Success Feedback:**
- Success message after reveal
- State updates (hasRevealed = true)
- Callback to parent component for UI updates

**Error Messages:**
- Hash mismatch: "Use the same candidate and password"
- Already revealed: "You have already revealed your vote"
- No commit: "You must commit a vote first"
- Network errors: "Network error: Please try again"

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+ installed
- Week 5 Backend server running (Express server on port 3001)
- Week 5 Backend contract deployed
- MetaMask installed and configured

### Step-by-Step Setup

1. **Navigate to Week 5 frontend directory**
   ```bash
   cd BharatVote-Week5-Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Update contract address** (if needed)
   - After deploying Week 5 backend, copy the contract address
   - Update `src/contracts/BharatVote.json` with the new address

4. **Start the backend server** (from Week 5 Backend)
   ```bash
   cd ../BharatVote-Week5-Backend/mock-kyc-server
   npm install
   npm start
   ```
   Server should run on `http://localhost:3001`

5. **Start the frontend dev server**
   ```bash
   cd ../../BharatVote-Week5-Frontend
   npm run dev
   ```
   Frontend should run on `http://localhost:5173` (or configured port)

6. **Test the reveal flow**
   - Connect MetaMask with a non-admin account
   - Complete KYC verification
   - Commit a vote during Commit phase
   - Wait for admin to start Reveal phase
   - Reveal your vote using the same candidate and password

---

## 🎯 Key Implementation Details

### 1. Reveal Vote Function

**Complete Implementation:**
```typescript
const handleRevealVote = async () => {
  if (selectedCandidateId === null || !salt.trim()) return;

  setIsRevealing(true);
  setError(null);

  try {
    // Validation checks
    if (!hasVoted) throw new Error('You must commit a vote before revealing.');
    if (hasRevealed) throw new Error('You have already revealed your vote.');

    // Fetch latest commit hash from blockchain
    let storedHash = voteHash;
    try {
      const onchainCommit: string = await contract.commits(voterId);
      if (onchainCommit) storedHash = onchainCommit;
    } catch (readErr) {
      console.warn('Failed to read on-chain commit hash:', readErr);
    }

    // Verify hash matches
    const { commitHash: expectedCommitHash } = await hashVote(selectedCandidateId, salt.trim());
    if (!storedHash || expectedCommitHash.toLowerCase() !== storedHash.toLowerCase()) {
      throw new Error('Hash mismatch! Use the same candidate and password you used during commit.');
    }

    // Submit reveal transaction
    const candidateId = BigInt(selectedCandidateId);
    const bytes32Salt = ethers.keccak256(ethers.toUtf8Bytes(salt.trim()));
    const tx = await contract.revealVote(candidateId, bytes32Salt);
    await tx.wait();

    // Success handling
    setSuccess('Vote revealed successfully! Your vote has been counted.');
    onRevealSuccess();
    await checkVoteStatus();
    setTimeout(() => setSuccess(null), 5000);
  } catch (err: any) {
    console.error('Vote reveal error:', err);
    const msg = err?.reason || err?.message || 'Failed to reveal vote';
    setError(msg);
  } finally {
    setIsRevealing(false);
  }
};
```

### 2. Hash Verification

**Why Verify Client-Side?**
- Prevents unnecessary gas costs for invalid reveals
- Provides immediate feedback to user
- Reduces blockchain load

**Verification Process:**
1. Hash the selected candidate + salt
2. Compare with stored commit hash
3. If mismatch, show error immediately
4. If match, proceed with transaction

### 3. State Management

**Reveal-Specific State:**
```typescript
const [hasRevealed, setHasRevealed] = useState(false);
const [isRevealing, setIsRevealing] = useState(false);
const [voteHash, setVoteHash] = useState<string | null>(null);
```

**State Updates:**
- `hasRevealed`: Set to true after successful reveal
- `isRevealing`: Set to true during transaction
- `voteHash`: Updated from blockchain before verification

---

## 📊 What's Included vs. What's Not

### ✅ Included in Week 5

- **Reveal Phase UI**: Complete interface for vote revelation
- **Transaction Handling**: Full reveal transaction flow
- **Hash Verification**: Client-side verification before submission
- **Error Handling**: Comprehensive error messages
- **Loading States**: Visual feedback during transactions
- **Success Feedback**: Confirmation messages and state updates
- **Backend Integration**: Full integration with Express backend

### ⚠️ Simplified in Week 5 (Full Version in Week 6+)

- **Transaction Retry**: Basic retry, Week 6+ adds exponential backoff
- **Gas Estimation**: Basic estimation, Week 6+ adds dynamic gas pricing
- **Transaction History**: No history tracking, Week 6+ adds transaction log

### ❌ Not Included (Coming Later)

- **Transaction History**: View past transactions - Week 6+
- **Gas Optimization**: Dynamic gas pricing - Week 6+
- **Offline Support**: Service worker for offline - Week 7+
- **Analytics**: User behavior tracking - Week 7+

---

## 🔄 Differences from Week 4

| Feature | Week 4 | Week 5 |
|---------|--------|--------|
| **Reveal Phase** | Basic implementation | Complete with verification |
| **Error Handling** | Basic | Comprehensive |
| **Hash Verification** | On-chain only | Client-side + on-chain |
| **User Feedback** | Basic messages | Detailed feedback |
| **Transaction Handling** | Basic | Production-ready |
| **Backend Integration** | Partial | Complete |

---

## 🐛 Troubleshooting

### Error: "Hash mismatch"
**Cause**: Candidate or password doesn't match commit phase.
**Solution**: 
- Use the exact same candidate selected during commit
- Use the exact same password/salt from commit phase
- Check for extra spaces or typos

### Error: "You must commit a vote before revealing"
**Cause**: No vote was committed during commit phase.
**Solution**:
- Ensure you committed a vote during phase 0
- Check that `hasVoted` state is true
- Verify commit transaction was successful

### Error: "You have already revealed your vote"
**Cause**: Vote was already revealed.
**Solution**:
- Check `hasRevealed` state
- Verify on-chain status: `await contract.hasRevealed(address)`
- You can only reveal once per election

### Transaction Stuck
**Cause**: Network congestion or low gas.
**Solution**:
- Check MetaMask for pending transactions
- Increase gas price in MetaMask
- Wait for network to process
- Check transaction on blockchain explorer

---

## 📚 Key Concepts

### **Commit-Reveal Scheme**
Week 5 completes the commit-reveal voting cycle:
1. **Commit Phase**: Voters submit encrypted vote (hash)
2. **Reveal Phase**: Voters reveal actual vote (candidate + salt)
3. **Verification**: Contract verifies hash matches
4. **Counting**: Vote is counted in tally

### **Hash Verification**
Before submitting reveal transaction:
- Client hashes candidate + salt
- Compares with stored commit hash
- Only submits if match
- Saves gas and provides immediate feedback

### **Transaction Lifecycle**
1. User clicks "Reveal Vote"
2. Client verifies hash
3. Transaction created
4. MetaMask prompts for approval
5. Transaction submitted
6. Waiting for confirmation
7. Transaction confirmed
8. UI updates

---

## 🎓 Learning Outcomes

By completing Week 5, you understand:

1. **Reveal Phase**: How commit-reveal voting works end-to-end
2. **Transaction Handling**: Submitting and monitoring blockchain transactions
3. **Hash Verification**: Client-side verification before submission
4. **Error Handling**: Comprehensive error messages and recovery
5. **User Experience**: Loading states, feedback, and state management
6. **Backend Integration**: Full integration with Express backend APIs

---

## 📝 Next Steps

### Week 6 Preview
- Admin Dashboard: Complete admin interface
- Advanced deployment scripts
- Multi-network support
- Transaction history

---

**Week 5 Complete! Ready for Week 6: Admin Dashboard & Advanced Features! 🎉**
