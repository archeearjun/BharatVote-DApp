# BharatVote - Week 6 Backend: Deployment Automation Scripts

## 📋 Purpose

This is the **Week 6 backend implementation** of the BharatVote blockchain voting system. Week 6 focuses on **advanced deployment automation** with state management, logging, and enhanced error handling. All features are **free and localhost-only** - perfect for college projects.

### What Week 6 Achieves

- **Enhanced Deployment Scripts**: Production-ready deployment automation
- **Deployment State Management**: Track all deployments with history
- **Comprehensive Logging**: File-based logs for debugging
- **Network Verification**: Pre-deployment checks and validation
- **Demo Deployment Script**: One-command demo setup
- **No Automatic Candidates**: Admin adds candidates via frontend (as requested)
- **100% Free**: All features work on localhost, no paid services

---

## 🗂️ Project Structure

```
BharatVote-Week6-Backend/
├── contracts/
│   └── BharatVote.sol              # Smart contract (from Weeks 1-5)
│
├── scripts/
│   ├── deploy.ts                   # ⭐ Enhanced deployment script
│   ├── deploy-demo.ts             # ⭐ Demo deployment script
│   ├── verify-deployment.ts       # Deployment verification
│   ├── test-voting.ts             # Voting flow testing
│   └── utils/
│       └── deployment-helpers.ts  # ⭐ Deployment utilities
│
├── deployments/
│   └── localhost/
│       ├── deployment-state.json  # ⭐ Deployment history
│       └── deployment-*.json      # Individual deployment records
│
├── logs/
│   └── deployment-YYYY-MM-DD.log  # ⭐ Deployment logs
│
├── mock-kyc-server/               # Express backend (Week 5)
├── hardhat.config.ts              # Hardhat configuration
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

---

## 🆕 What's New in Week 6

### 1. Enhanced Deployment Script (`deploy.ts`)

**Location:** `scripts/deploy.ts`

**Key Features:**
- ✅ Deployment state tracking
- ✅ Comprehensive logging (file + console)
- ✅ Network verification
- ✅ Balance checking
- ✅ Gas usage tracking
- ✅ Merkle root setup (if eligibleVoters.json exists)
- ✅ **No automatic candidate addition** (admin adds via frontend)
- ✅ Frontend ABI export

**Usage:**
```bash
npm run deploy
# or
npx hardhat run scripts/deploy.ts --network localhost
```

### 2. Demo Deployment Script (`deploy-demo.ts`)

**Location:** `scripts/deploy-demo.ts`

**Key Features:**
- ✅ Quick one-command demo setup
- ✅ Optimized for presentations
- ✅ Automatic Merkle root setup
- ✅ Clean output for demos

**Usage:**
```bash
npm run deploy:demo
# or
npx hardhat run scripts/deploy-demo.ts --network localhost
```

### 3. Deployment State Management

**Location:** `deployments/localhost/deployment-state.json`

**Features:**
- ✅ Tracks all deployments
- ✅ Stores deployment metadata
- ✅ Latest deployment reference
- ✅ Individual deployment files

**Example:**
```json
{
  "deployments": [
    {
      "contractAddress": "0x...",
      "deployerAddress": "0x...",
      "networkName": "localhost",
      "chainId": "31337",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "merkleRoot": "0x...",
      "transactionHash": "0x..."
    }
  ],
  "latest": { ... }
}
```

### 4. Comprehensive Logging

**Location:** `logs/deployment-YYYY-MM-DD.log`

**Features:**
- ✅ File-based logging
- ✅ Timestamped entries
- ✅ Error tracking
- ✅ Deployment history

### 5. Deployment Utilities

**Location:** `scripts/utils/deployment-helpers.ts`

**Functions:**
- `loadDeploymentState()` - Load deployment history
- `saveDeploymentState()` - Save deployment info
- `verifyNetwork()` - Verify network connection
- `verifyDeployerBalance()` - Check deployer balance
- `exportContractToFrontend()` - Export ABI to frontend
- `getContractABI()` - Extract ABI from artifacts
- `logToFile()` - Log to file

---

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- Hardhat node running (Terminal 1)
- MetaMask configured for localhost

### Step 1: Start Hardhat Node

```bash
npm run node
```

Wait for "Started HTTP and WebSocket JSON-RPC server"

### Step 2: Deploy Contract

**Option A: Standard Deployment**
```bash
npm run deploy
```

**Option B: Demo Deployment**
```bash
npm run deploy:demo
```

### Step 3: Verify Deployment

```bash
npm run verify
```

### Step 4: Check Deployment History

```bash
# View deployment state
cat deployments/localhost/deployment-state.json

# View logs
cat logs/deployment-$(date +%Y-%m-%d).log
```

---

## 📊 Deployment Flow

```
1. Network Verification
   ↓
2. Deployer Balance Check
   ↓
3. Contract Deployment
   ↓
4. Admin Verification
   ↓
5. Merkle Root Setup (if eligibleVoters.json exists)
   ↓
6. Export to Frontend
   ↓
7. Save Deployment State
   ↓
8. Log Deployment
```

**Note:** Candidates are NOT automatically added. Admin must add them via the frontend admin panel.

---

## 🔧 Configuration

### Deployment Configuration

No configuration file needed - everything works out of the box for localhost.

### Frontend Export Paths

The deployment script automatically exports to:
- `BharatVote-Week6-Frontend/src/contracts/BharatVote.json`

### Merkle Root Setup

If `eligibleVoters.json` exists in the project root, the deployment script will:
1. Read eligible voters
2. Build Merkle tree
3. Set Merkle root on contract

**Example `eligibleVoters.json`:**
```json
[
  "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
  "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
]
```

---

## 📝 Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| **deploy** | `npm run deploy` | Enhanced deployment with state management |
| **deploy:demo** | `npm run deploy:demo` | Quick demo deployment |
| **verify** | `npm run verify` | Verify deployment status |
| **test-vote** | `npm run test-vote` | Test voting flow |
| **check-phase** | `npm run check-phase` | Check current phase |
| **node** | `npm run node` | Start Hardhat node |

---

## 🆚 Week 5 vs Week 6

| Feature | Week 5 | Week 6 |
|---------|--------|--------|
| **Deployment Script** | Basic | Enhanced with state management |
| **Logging** | Console only | File + console |
| **State Tracking** | ❌ | ✅ |
| **Demo Script** | ❌ | ✅ |
| **Auto Candidates** | ✅ (4 candidates) | ❌ (admin adds) |
| **Deployment History** | ❌ | ✅ |
| **Error Handling** | Basic | Comprehensive |

---

## 🐛 Troubleshooting

### Error: "Network mismatch"

**Cause:** Hardhat node not running or wrong network.

**Solution:**
1. Start Hardhat node: `npm run node`
2. Wait for "Started HTTP and WebSocket JSON-RPC server"
3. Run deployment again

### Error: "Low balance"

**Cause:** Deployer account has insufficient balance.

**Solution:**
- Hardhat node provides 10,000 ETH by default
- Check deployer address in Hardhat node output
- Use the first account (Account #0)

### Error: "Could not write to frontend"

**Cause:** Frontend folder doesn't exist or path is wrong.

**Solution:**
- Ensure `BharatVote-Week6-Frontend/` exists
- Check folder permissions
- Verify path in `deploy.ts`

### Deployment State Not Saving

**Cause:** Permissions issue or disk space.

**Solution:**
- Check `deployments/` folder permissions
- Ensure disk space available
- Check logs for specific errors

---

## 📚 Key Concepts

### Deployment State Management

Week 6 introduces deployment state tracking:
- Every deployment is recorded
- Deployment history is maintained
- Latest deployment is tracked
- Individual deployment files are saved

### Logging System

- Logs are saved to `logs/` folder
- Daily log files (one per day)
- Timestamped entries
- Error stack traces included

### No Automatic Candidates

Unlike Week 5, Week 6 does NOT automatically add candidates:
- Admin must add candidates via frontend
- Full admin control over candidate management
- More realistic deployment flow

---

## 🎓 Learning Outcomes

By completing Week 6, you understand:

1. **Deployment Automation**: Advanced deployment scripts with state management
2. **Logging**: File-based logging for production debugging
3. **State Management**: Tracking deployment history
4. **Error Handling**: Comprehensive error handling and validation
5. **Script Organization**: Modular utilities and helpers
6. **Production Practices**: Professional deployment workflows

---

## 📝 Next Steps

### Week 7 Preview
- Hardhat tests
- Local deployment testing
- Integration testing

---

**Week 6 Complete! Ready for Week 7: Testing & Local Deployment! 🎉**
