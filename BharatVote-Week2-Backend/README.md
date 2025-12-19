# BharatVote - Week 2 Backend: Admin Controls & Candidate Management

## 📋 Purpose

This is the **Week 2 backend implementation** of the BharatVote blockchain voting system. It extends the Week 1 foundation with **admin control functions** that manage the election lifecycle. The smart contract implements a three-phase state machine (Commit → Reveal → Finished) with access control, enabling administrators to manage candidates and control election progression before voting begins in Week 3.

### What Week 2 Achieves

- **Admin governance layer**: Secure admin-only functions for election management
- **Candidate management**: Add and remove candidates during the Commit phase
- **Phase transitions**: Controlled progression through election phases
- **Foundation for voting**: Prepares the contract structure for Week 3's commit-reveal voting mechanism

---

## 🗂️ Project Structure

```
BharatVote-Week2-Backend/
├── contracts/
│   └── BharatVote.sol              # Main smart contract (144 lines)
│                                    # Contains Week 1 foundation + Week 2 admin functions
│
├── scripts/
│   ├── deploy.ts                   # Deployment script
│   │                               # - Deploys contract to local Hardhat node
│   │                               # - Sets Merkle root from eligibleVoters.json
│   │                               # - Exports ABI + address to frontend JSON files
│   │
│   └── verify-deployment.ts        # Verification script
│                                   # - Checks if contract is deployed
│                                   # - Reads contract state (admin, phase, candidates)
│                                   # - Validates contract accessibility
│
├── hardhat.config.ts               # Hardhat configuration (TypeScript, localhost network)
├── package.json                    # Dependencies and npm scripts
├── tsconfig.json                   # TypeScript configuration
│
├── artifacts/                      # Generated after compilation
│   └── contracts/BharatVote.sol/
│       └── BharatVote.json         # Contract ABI and bytecode
│
├── cache/                          # Hardhat build cache
│
└── typechain-types/                # Generated TypeScript types from contract
    └── BharatVote.ts               # Type-safe contract interface
```

---

## 📄 Code Files Explained

### 1. `contracts/BharatVote.sol` (Main Smart Contract)

**Purpose**: The core smart contract implementing the voting system's state management and admin controls.

**Key Components**:

#### State Variables
- `admin` (immutable): Contract administrator address, set during deployment
- `phase` (uint8): Current election phase (0=Commit, 1=Reveal, 2=Finished)
- `candidates[]`: Array of candidate structs with id, name, and isActive flag
- `merkleRoot` (bytes32): Root hash for voter eligibility verification
- `commits` (mapping): Stores vote commitment hashes per voter
- `hasCommitted` / `hasRevealed` (mappings): Tracks voter participation status
- `tally` (mapping): Vote counts per candidate (populated in Week 3)

#### Custom Errors (Gas-Efficient)
```solidity
error NotAdmin();
error WrongPhase();
error InvalidCandidateId();
error InactiveCandidate();
error InvalidNameLength();
// ... and more for Week 3+
```

#### Modifiers
- `onlyAdmin`: Restricts functions to contract admin
- `onlyPhase(uint8 p)`: Ensures function only executes in specific phase
- `validCandidateId(uint256 _id)`: Validates candidate exists and is active

#### Week 2 Admin Functions (Lines 78-112)

**`setMerkleRoot(bytes32 _root)`**
- Sets the Merkle tree root for voter eligibility
- Only admin can call
- No phase restriction (can be set at any time)

**`addCandidate(string calldata _name)`**
- Adds a new candidate to the election
- Validates name length (1-100 characters)
- Only works in Commit phase (phase 0)
- Emits `CandidateAdded` event

**`removeCandidate(uint256 _id)`**
- Soft-deletes a candidate (sets `isActive = false`)
- Preserves candidate ID and audit trail
- Only works in Commit phase
- Emits `CandidateRemoved` event

**`startReveal()`**
- Transitions election from Commit (0) to Reveal (1) phase
- Freezes candidate list (no more add/remove)
- Emits `PhaseChanged` event

**`finishElection()`**
- Transitions election from Reveal (1) to Finished (2) phase
- Finalizes vote tally
- Emits `PhaseChanged` and `TallyFinalized` events

#### View Functions (Lines 116-135)

**`candidateCount()`**: Returns total number of candidates

**`getCandidates()`**: Returns array of all candidate structs

**`getTally()`**: Returns vote counts array (empty until Week 3)

**`getVoterStatus(address _voter)`**: Returns voter's commit/reveal status

#### Events (Lines 45-53)
- `CandidateAdded`, `CandidateRemoved`: Candidate management
- `VoteCommitted`, `VoteRevealed`: Voting actions (Week 3+)
- `PhaseChanged`: Phase transitions
- `TallyFinalized`: Election completion

### 2. `scripts/deploy.ts` (Deployment Script)

**Purpose**: Automated contract deployment and initialization.

**What It Does**:
1. **Connects to Hardhat node** (validates network is running)
2. **Loads deployer account** (first Hardhat account)
3. **Deploys contract** using `BharatVoteFactory.deploy()`
4. **Verifies admin** (checks admin address matches deployer)
5. **Optionally sets Merkle root** (if `eligibleVoters.json` exists in parent directory)
6. **Exports contract info** to frontend JSON files:
   - `../frontend/src/contracts/BharatVote.json`
   - `../BharatVote-Week2-Frontend/src/contracts/BharatVote.json`

**Key Features**:
- Handles missing `merkletreejs` gracefully (optional dependency)
- Creates frontend directories if they don't exist
- Provides detailed deployment summary with contract address and admin

### 3. `scripts/verify-deployment.ts` (Verification Script)

**Purpose**: Validates contract deployment status and retrieves current state.

**What It Does**:
1. **Checks Hardhat node connection**
2. **Reads contract addresses** from frontend JSON files
3. **Verifies bytecode exists** at each address
4. **Reads contract state**: admin, phase, candidate count
5. **Provides deployment status** (deployed or not deployed)

**Usage**: Run after deployment to confirm everything worked correctly.

### 4. `hardhat.config.ts`

**Purpose**: Hardhat development environment configuration.

**Key Settings**:
- Solidity compiler version: `^0.8.20`
- Network: `localhost` (Chain ID 31337)
- TypeScript support enabled
- TypeChain integration for type generation

### 5. `package.json`

**Scripts**:
- `npm run compile`: Compiles Solidity contracts
- `npm run node`: Starts local Hardhat blockchain
- `npm run deploy`: Deploys contract to localhost
- `npm run verify`: Checks deployment status

**Key Dependencies**:
- `hardhat`: Ethereum development environment
- `ethers`: Ethereum library (v6)
- `@typechain/hardhat`: TypeScript type generation
- `merkletreejs`: Merkle tree implementation (optional, for Merkle root generation)

---

## 🚀 Setup & Installation

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Basic understanding of Solidity and Hardhat

### Step-by-Step Setup

1. **Navigate to backend directory**
   ```bash
   cd BharatVote-Week2-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This installs Hardhat, Ethers.js, TypeScript, and development tools.

3. **Compile the contract**
   ```bash
   npm run compile
   ```
   Expected output:
   ```
   Compiled 1 Solidity file successfully
   Generating typings for: 1 artifacts in dir: typechain-types
   ```

4. **Start local blockchain** (in a separate terminal)
   ```bash
   npm run node
   ```
   This starts Hardhat node at `http://127.0.0.1:8545` with 20 test accounts.
   **Keep this terminal running** - you need it for deployment and testing.

5. **Deploy the contract** (in another terminal)
   ```bash
   npm run deploy
   ```
   This will:
   - Deploy the contract
   - Set Merkle root (if `eligibleVoters.json` exists)
   - Save contract info to frontend JSON files

6. **Verify deployment**
   ```bash
   npm run verify
   ```
   Should show: `✅ RESULT: Contract is DEPLOYED and accessible`

---

## 🎯 Key Implementation Details

### 1. Access Control Pattern

**Immutable Admin**: The `admin` address is set once in the constructor and cannot be changed. This prevents admin takeover attacks.

```solidity
address public immutable admin;

constructor() {
    admin = msg.sender;  // Set during deployment
}

modifier onlyAdmin() {
    if (msg.sender != admin) revert NotAdmin();
    _;
}
```

**Why immutable?**
- Gas efficient: ~100 gas per read vs ~2,100 gas for normal storage
- Security: Cannot be modified after deployment
- Clear ownership: Single source of truth

### 2. Phase-Based State Machine

The contract uses a one-way state machine to ensure proper election flow:

```
Phase 0 (Commit)  →  Phase 1 (Reveal)  →  Phase 2 (Finished)
     ↓                    ↓                     ↓
  Add/Remove         Lock candidates        Election
  Candidates         Begin reveals           Complete
```

**Phase Restrictions**:
- Add/Remove candidates: Only in Phase 0
- Commit votes: Phase 0 (Week 3)
- Reveal votes: Phase 1 (Week 3)
- Finish election: Only from Phase 1

**Security Benefit**: Prevents election manipulation (e.g., adding candidates after voting starts)

### 3. Soft Delete Pattern

Instead of removing candidates from the array, we mark them as inactive:

```solidity
function removeCandidate(uint256 _id) external onlyAdmin onlyPhase(0) {
    candidates[_id].isActive = false;  // Soft delete
    emit CandidateRemoved(_id);
}
```

**Why soft delete?**
- **Gas efficient**: ~5,000 gas vs ~50,000 gas for array deletion
- **Preserves IDs**: No re-indexing needed
- **Audit trail**: Full history maintained
- **Simplicity**: Frontend can filter `isActive = false`

### 4. Gas Optimization Techniques

**Custom Errors** (Solidity 0.8.4+):
- 80% cheaper than `require()` with strings
- No string storage needed
- Example: `revert NotAdmin()` vs `require(msg.sender == admin, "Not admin")`

**Calldata Parameters**:
```solidity
function addCandidate(string calldata _name)  // calldata, not memory
```
- Saves ~1,000 gas by reading directly from transaction input
- No memory copy needed for read-only parameters

**Immutable Variables**:
- Stored in bytecode, not storage
- ~20x cheaper to read than regular storage variables

### 5. Input Validation

**Candidate Name Validation**:
```solidity
if (bytes(_name).length == 0 || bytes(_name).length > 100) 
    revert InvalidNameLength();
```

**Prevents**:
- Empty names (meaningless entries)
- Extremely long names (gas griefing attacks)
- Caps gas cost at ~₹290 per candidate add

---

## 💰 Gas Cost Analysis

| Function | Gas Cost | USD (30 gwei, $2000 ETH) | INR (₹80/USD) |
|----------|----------|---------------------------|----------------|
| `setMerkleRoot` | ~20,000 | ~$1.20 | ~₹100 |
| `addCandidate` | ~60,000 | ~$3.60 | ~₹290 |
| `removeCandidate` | ~5,000 | ~$0.30 | ~₹25 |
| `startReveal` | ~5,375 | ~$0.32 | ~₹26 |
| `finishElection` | ~20,000 | ~$1.20 | ~₹100 |

**Total admin cost for 4-candidate election**: ~₹540

*Note: Gas costs are estimates and vary based on network conditions.*

---

## 🔐 Security Features

### 1. Access Control
- All admin functions protected by `onlyAdmin` modifier
- Immutable admin (cannot be transferred or hijacked)
- No backdoor functions

### 2. Phase Enforcement
- Functions restricted to appropriate phases
- One-way transitions (cannot reverse phases)
- Prevents election manipulation

### 3. Input Validation
- Candidate names: 1-100 characters
- Candidate IDs validated before operations
- Prevents gas griefing attacks

### 4. Event Emissions
- Every state change logged to blockchain
- Transparent and auditable
- Frontend can listen for real-time updates

### 5. Soft Delete Pattern
- Preserves array structure
- Maintains audit trail
- Gas-efficient alternative to deletion

---

## 🧪 Testing with Hardhat Console

**Prerequisites**:
1. Hardhat node running (`npm run node`)
2. Contract deployed (`npm run deploy`)

**Open Hardhat Console**:
```bash
npx hardhat console --network localhost
```

**Example Test Script**:
```javascript
// Get deployed contract
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const contract = await ethers.getContractAt("BharatVote", contractAddress);

// Check initial state
console.log("Phase:", await contract.phase()); // 0 (Commit)
console.log("Admin:", await contract.admin());

// Add candidates
await contract.addCandidate("Alice Johnson");
await contract.addCandidate("Bob Smith");
await contract.addCandidate("Charlie Davis");

// View candidates
const candidates = await contract.getCandidates();
console.log("Candidates:", candidates);
console.log("Count:", await contract.candidateCount()); // 3

// Remove a candidate
await contract.removeCandidate(1); // Remove Bob

// Check candidates again (Bob's isActive = false)
const updated = await contract.getCandidates();
console.log("Updated candidates:", updated);

// Transition to reveal phase
await contract.startReveal();
console.log("Phase:", await contract.phase()); // 1 (Reveal)

// Try to add candidate (should fail with WrongPhase error)
try {
    await contract.addCandidate("David Lee"); // Will fail
} catch (error) {
    console.log("Expected error:", error.message);
}

// Finish election
await contract.finishElection();
console.log("Phase:", await contract.phase()); // 2 (Finished)
```

---

## 📊 What's Included vs. What's Not

### ✅ Included in Week 2

- **5 Admin Control Functions**: `setMerkleRoot`, `addCandidate`, `removeCandidate`, `startReveal`, `finishElection`
- **4 View Functions**: `candidateCount`, `getCandidates`, `getTally`, `getVoterStatus`
- **Access Control**: `onlyAdmin` modifier and immutable admin pattern
- **Phase-Based State Machine**: Three-phase system with one-way transitions
- **Input Validation**: Candidate name length checks, ID validation
- **Event Emissions**: All state changes logged
- **Deployment Scripts**: Automated deployment and verification
- **Type Safety**: TypeChain-generated TypeScript interfaces

### ❌ Not Included (Coming Later)

- **Voting Functions**: `commitVote()`, `revealVote()` - Week 3
- **Merkle Verification**: Full Merkle proof verification - Week 4
- **Backend Express Server**: API for Merkle proof generation - Week 5
- **Comprehensive Tests**: Full test suite - Week 7
- **Reset Functions**: Election reset functionality - Week 8

---

## 🐛 Troubleshooting

### Error: "Failed to connect to Hardhat node"
**Solution**: Make sure `npm run node` is running in another terminal. The Hardhat node must be started before deployment.

### Error: "No accounts found"
**Solution**: Restart the Hardhat node (`Ctrl+C` then `npm run node` again). This resets the blockchain state.

### Warning: "No frontend folders found"
**Solution**: This is OK for Week 2. The contract is still deployed, but JSON files weren't saved. You can manually copy the contract address to your frontend later, or create the directories.

### Address mismatch in frontend
**Solution**: 
1. Redeploy: `npm run deploy`
2. Or manually update `BharatVote.json` in frontend with the new address

### Contract deployment fails silently
**Solution**: 
1. Check Hardhat node is running: `npm run verify`
2. Check you're using the correct network: `hardhat.config.ts` should have `localhost` configured
3. Check deployer account has balance (should have 10000 ETH by default)

### "merkletreejs not installed" warning
**Solution**: This is optional. Install it with `npm install merkletreejs` if you want automatic Merkle root generation from `eligibleVoters.json`.

---

## 📚 Key Concepts Explained

### **Immutable Variables**
Variables declared as `immutable` are set once in the constructor and compiled into bytecode. They cannot be changed after deployment, providing security and gas efficiency.

### **Custom Errors**
Introduced in Solidity 0.8.4, custom errors are much cheaper than string-based `require()` statements. They use less gas and provide better error handling.

### **Modifiers**
Reusable validation logic that can be applied to functions. Modifiers execute before the function body, allowing DRY (Don't Repeat Yourself) principles.

### **Events**
Logs stored in blockchain logs (not storage). Much cheaper than storage (~375 gas vs ~20,000 gas). Frontends can listen for events for real-time updates.

### **Calldata**
A data location for function parameters. `calldata` is read-only and cheaper than `memory` for external function parameters because it reads directly from transaction input.

### **Soft Delete**
Instead of removing an item from an array, mark it as inactive. This preserves the array structure, maintains IDs, and is much more gas-efficient than array deletion.

### **State Machine**
A system with distinct phases and allowed transitions between them. Prevents operations in wrong phases and ensures system integrity.

---

## 🔄 Differences from Week 1

| Aspect | Week 1 | Week 2 |
|--------|--------|--------|
| **Contract Lines** | 78 | ~144 |
| **Functions** | 0 (constructor only) | 9 (5 admin + 4 view) |
| **Can Deploy** | ✅ Yes | ✅ Yes |
| **Can Interact** | ❌ No functions | ✅ Yes, admin can manage election |
| **Can Vote** | ❌ No | ❌ Not yet (Week 3) |
| **Deployment Scripts** | ❌ Manual | ✅ Automated |
| **Verification** | ❌ Manual checks | ✅ Automated script |

---

## 🚀 Next Steps (Week 3 Preview)

**Coming in Week 3**:
- `commitVote()` - Voters submit encrypted vote commitments (hashes)
- `revealVote()` - Voters reveal their actual votes
- Commit-reveal cryptographic scheme for vote privacy
- Double-voting prevention
- Integration with Merkle tree verification (Week 4)

---

## 📖 Further Reading

- [Solidity Access Control Patterns](https://docs.openzeppelin.com/contracts/access-control)
- [State Machine Design Pattern](https://fravoll.github.io/solidity-patterns/state_machine.html)
- [Gas Optimization Techniques](https://github.com/wolflo/evm-opcodes)
- [Event-Driven Architecture](https://docs.soliditylang.org/en/latest/contracts.html#events)
- [Hardhat Documentation](https://hardhat.org/docs)

---

## 📝 Deployment Checklist

Before presenting or testing:

- [ ] Hardhat node is running (`npm run node`)
- [ ] Contract is compiled (`npm run compile`)
- [ ] Contract is deployed (`npm run deploy`)
- [ ] Deployment verified (`npm run verify` shows ✅)
- [ ] Frontend JSON files updated (check `src/contracts/BharatVote.json` in frontend folder)

---

## 👨‍💻 Author

**BharatVote Development Team**  
Week 2 Progress - Admin Controls & Candidate Management

---

**This is Week 2: Admin Controls & Candidate Management. Voting implementation comes in Week 3.**
