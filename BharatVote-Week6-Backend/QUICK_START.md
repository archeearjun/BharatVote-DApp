# 🚀 Week 6 Quick Start Guide

## Complete Setup Instructions

Follow these steps **in order** to run the full Week 6 system:

---

## Step 1: Start Hardhat Node (Terminal 1)

Open **Terminal 1** and run:

```bash
cd BharatVote-Week6-Backend
npm run node
```

**Wait for this message:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

**Keep this terminal running!** Don't close it.

---

## Step 2: Deploy Contract (Terminal 2)

Open **Terminal 2** (new terminal) and run:

```bash
cd BharatVote-Week6-Backend
npm run deploy
```

**OR for quick demo:**
```bash
npm run demo
```

**You should see:**
```
✅ Contract deployed at: 0x...
✅ DEPLOYMENT COMPLETE (WEEK 6)
```

**Copy the contract address** - you'll need it!

---

## Step 3: Start Backend Server (Terminal 3)

Open **Terminal 3** (new terminal) and run:

```bash
cd BharatVote-Week6-Backend/mock-kyc-server
npm start
```

**You should see:**
```
🚀 BharatVote Backend Server running at http://localhost:3001
```

**Keep this terminal running!**

---

## Step 4: Start Frontend (Terminal 4)

Open **Terminal 4** (new terminal) and run:

```bash
cd BharatVote-Week6-Frontend
npm run dev
```

**You should see:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

**Open your browser** and go to: `http://localhost:5173`

---

## Step 5: Setup MetaMask

1. **Open MetaMask** browser extension
2. **Add Localhost Network** (if not already added):
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `31337`
   - Currency Symbol: `ETH`
3. **Import Test Account**:
   - Copy private key from Terminal 1 (Account #0)
   - In MetaMask: Import Account → Paste private key
   - You'll have 10,000 ETH!

---

## Step 6: Use the System

### As Admin:

1. **Connect Wallet** in frontend
2. **Go to Admin Dashboard**
3. **Add Candidates**:
   - Enter candidate name
   - Click "Add"
   - Repeat for all candidates
4. **Start Reveal Phase** when ready
5. **Finish Election** after reveal phase

### As Voter:

1. **Connect Wallet** (different account)
2. **Complete KYC**:
   - Enter Voter ID (e.g., "VOTER1")
   - Enter OTP: `123456`
   - Complete face recognition
3. **Vote**:
   - Select candidate
   - Enter password/salt
   - Commit vote
4. **Reveal Vote** (after reveal phase starts):
   - Select same candidate
   - Enter same password
   - Reveal vote

---

## 📋 Quick Command Reference

### Backend Commands:

```bash
# Start blockchain
npm run node

# Deploy contract (standard)
npm run deploy

# Deploy contract (demo - quick)
npm run demo

# Verify deployment
npm run verify

# Test voting flow
npm run test-vote
```

### Backend Server:

```bash
cd mock-kyc-server
npm start
```

### Frontend:

```bash
npm run dev
```

---

## 🐛 Troubleshooting

### "Cannot connect to network"

**Solution:** Make sure Terminal 1 (Hardhat node) is running!

### "Contract not found"

**Solution:** 
1. Make sure you deployed the contract (Step 2)
2. Check `BharatVote-Week6-Frontend/src/contracts/BharatVote.json` exists
3. Restart frontend if needed

### "Backend server not responding"

**Solution:**
1. Make sure Terminal 3 (backend server) is running
2. Check it's on port 3001
3. Try: `curl http://localhost:3001/api/kyc?voter_id=VOTER1`

### "MetaMask not connecting"

**Solution:**
1. Make sure localhost network is added
2. Check Chain ID is 31337
3. Refresh the page
4. Try disconnecting and reconnecting

---

## ✅ Verification Checklist

- [ ] Terminal 1: Hardhat node running (port 8545)
- [ ] Terminal 2: Contract deployed successfully
- [ ] Terminal 3: Backend server running (port 3001)
- [ ] Terminal 4: Frontend running (port 5173)
- [ ] MetaMask: Localhost network added
- [ ] MetaMask: Test account imported
- [ ] Browser: Frontend loads at localhost:5173

---

## 🎯 What's Running?

After setup, you should have:

1. **Hardhat Node** (Terminal 1) - Local blockchain
2. **Contract Deployed** (Terminal 2) - Smart contract on blockchain
3. **Backend Server** (Terminal 3) - KYC & Merkle proof API
4. **Frontend** (Terminal 4) - Web application

**All 4 terminals must be running for the system to work!**

---

## 📝 Next Steps

1. **Add Candidates** via admin dashboard
2. **Test Voting** with multiple accounts
3. **Check Deployment History**: `deployments/localhost/`
4. **Check Logs**: `logs/deployment-YYYY-MM-DD.log`

---

**Need help? Check the main README.md for detailed documentation!**
