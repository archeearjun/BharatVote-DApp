# BharatVote - Week 1: Foundation Setup

## 📅 Week 1 Deliverables

This folder contains the **Week 1 backend and Solidity foundation** for the BharatVote blockchain voting system.

### What's Included

✅ **Hardhat Development Environment**
- Professional Ethereum development framework
- Solidity compiler 0.8.20 with optimizer (200 runs)
- TypeScript integration with TypeChain
- Local blockchain simulation ready

✅ **BharatVote.sol Contract Foundation** (74 lines)
- Custom errors for gas optimization
- State variables (admin, phase, candidates, merkleRoot, mappings)
- Events for frontend integration
- Modifiers for access control
- Constructor establishing admin

✅ **Configuration Files**
- `hardhat.config.ts` - Network configs, compiler settings
- `tsconfig.json` - TypeScript strict mode enabled
- `package.json` - Dependencies and scripts

### What's NOT Included (Coming in Later Weeks)

- ❌ Admin functions (Week 2)
- ❌ Voting functions (Week 3)
- ❌ Merkle tree verification (Week 4)
- ❌ Backend Express server (Week 5)
- ❌ Deployment scripts (Week 6)
- ❌ Tests (Week 7)

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ installed
- VS Code or Cursor editor

### Installation

1. **Open this folder in VS Code/Cursor**
   ```bash
   cd BharatVote-Week1-Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```
   This will take 2-3 minutes. It installs Hardhat, Ethers.js, TypeChain, and TypeScript.

3. **Compile the contract**
   ```bash
   npm run compile
   ```
   Expected output:
   ```
   Compiled 1 Solidity file successfully
   Generating typings for: 1 artifacts in dir: typechain-types
   ```

4. **Start local blockchain (optional)**
   ```bash
   npm run node
   ```
   This starts a Hardhat node on `http://127.0.0.1:8545`

---

## 📂 Folder Structure

```
BharatVote-Week1-Backend/
├── contracts/
│   └── BharatVote.sol      (Foundation: 74 lines)
├── hardhat.config.ts       (Compiler & network config)
├── package.json            (Dependencies)
├── tsconfig.json           (TypeScript config)
├── .gitignore
└── README.md               (This file)
```

After compilation, you'll see:
```
├── artifacts/              (Generated)
├── cache/                  (Generated)
└── typechain-types/        (Generated)
```

---

## 🎯 Key Technical Decisions

### 1. **Solidity 0.8.20**
- Built-in overflow protection (no SafeMath needed)
- Custom errors (80% cheaper gas than require strings)
- Latest stable version

### 2. **Optimizer: 200 Runs**
- Balanced for moderate usage
- Optimizes execution cost vs deployment cost
- ~50% gas savings on function calls

### 3. **Immutable Admin**
- Set once in constructor
- 20x cheaper to read than normal state variables
- Cannot be changed (security feature)

### 4. **uint8 for Phase**
- Instead of enum or uint256
- Enables storage packing
- Saves ~20,000 gas per slot

### 5. **TypeChain Integration**
- Auto-generates TypeScript types from contract
- Frontend gets compile-time type checking
- Prevents integration bugs

---

## 📊 Gas Optimization Highlights

| Pattern | Gas Savings | Implementation |
|---------|-------------|----------------|
| `immutable admin` | ~2,000 gas/read | Line 23 |
| `uint8 phase` | ~15,000 gas | Line 26 |
| Custom errors | 80% cheaper | Lines 10-21 |

---

## 📝 Contract Structure Explanation

### Custom Errors (Lines 10-21)
Gas-efficient error handling. Each error costs ~500 gas vs ~2,400 gas for string-based `require`.

### State Variables (Lines 23-43)
- `admin` - Contract deployer (immutable)
- `phase` - Election lifecycle (0=Commit, 1=Reveal, 2=Finished)
- `Candidate` struct - Holds id, name, isActive
- `merkleRoot` - For voter eligibility (Week 4)
- Mappings - O(1) lookup for commits, votes, tallies

### Events (Lines 46-53)
Logs for frontend to listen to. Much cheaper than storage (~375 gas vs ~20,000 gas).

### Modifiers (Lines 56-70)
Reusable validation logic:
- `onlyAdmin()` - Access control
- `onlyPhase(uint8 p)` - Phase restrictions
- `validCandidateId()` - Candidate validation

### Constructor (Lines 72-74)
Runs once at deployment. Sets `msg.sender` as admin.

---

## 🎤 Week 1 Presentation Points

**Opening:** "This week I established a production-grade Hardhat environment with gas optimization built into the foundation."

**Key highlights:**
1. ✅ Professional tooling (not Remix toy setup)
2. ✅ Gas optimization from day 1 (immutable, uint8, custom errors)
3. ✅ TypeScript integration for type safety
4. ✅ Contract foundation with 0 functions (structure only)

**Closing:** "Next week, I'll implement admin controls (add candidates, phase transitions) on this solid foundation."

---

## 📚 Further Reading

- [Hardhat Documentation](https://hardhat.org/docs)
- [Solidity 0.8.x Features](https://docs.soliditylang.org/)
- [Gas Optimization Patterns](https://github.com/wolflo/evm-opcodes)
- [TypeChain Documentation](https://github.com/dethcrypto/TypeChain)

---

## 👨‍💻 Author

**Your Name**  
Week 1 Progress - BharatVote Blockchain Voting System

---

*This is Week 1 foundation. Full implementation comes in Weeks 2-8.*

