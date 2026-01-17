# 🚀 Quick Start Guide - Local Demo

## Prerequisites
- ✅ Node.js v18+ installed
- ✅ npm or pnpm installed
- ✅ MetaMask browser extension installed

---

## 🎯 One-Time Setup

### 1. Install All Dependencies
```bash
npm run install:all
```
This installs dependencies for the root project, backend, and frontend.

### 2. Configure MetaMask
1. Open MetaMask extension
2. Click network dropdown
3. Click "Add Network" → "Add a network manually"
4. Enter these details:
   - **Network Name**: Hardhat Local
   - **RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
5. Click "Save"

---

## 🏃 Running the Demo (Every Time)

### Method 1: Quick Start (4 Commands)

Open **4 separate terminal windows** and run these commands:

**Terminal 1 - Blockchain:**
```bash
npm run node
```
Wait for "Started HTTP and WebSocket JSON-RPC server"

**Terminal 2 - Deploy Contract:**
```bash
# Wait for Terminal 1 to finish starting
npm run deploy
```
✅ Copy the contract address that appears (you'll see: "BharatVote deployed to: 0x...")

**Terminal 3 - Backend Server:**
```bash
npm run backend:dev
```
✅ Backend runs on http://localhost:3001

**Terminal 4 - Frontend:**
```bash
npm run frontend:dev
```
✅ Frontend runs on http://localhost:5173

---

### Method 2: Alternative Commands

If the npm scripts don't work, use these:

**Terminal 1:**
```bash
npx hardhat node
```

**Terminal 2:**
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

**Terminal 3:**
```bash
cd backend
npm start
```

**Terminal 4:**
```bash
cd frontend
npm run dev
```

---

## 🎮 Using the Demo

### Step 1: Import Test Account to MetaMask

When you run `npm run node`, Hardhat will show you 20 test accounts like:
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Import Account to MetaMask:**
1. Click MetaMask → Click account icon → "Import Account"
2. Paste the private key (e.g., `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`)
3. Click "Import"
4. Make sure you're on "Hardhat Local" network

### Step 2: Access the Application

Open your browser to: **http://localhost:5173**

### Step 3: Complete KYC Verification

#### Enter Voter ID:
Use one of these test voter IDs:
- `VOTER1` (mapped to account 0x90F79bf6EB2c4f870365E785982E1f101E93b906)
- `VOTER2`
- `VOTER3`
- `VOTER4`

**Note:** If you're using Account #0 (0xf39Fd6...), use `VOTER1` and you'll need to update the KYC mapping (see Troubleshooting below).

#### Enter OTP:
The OTP is **hardcoded** for demo purposes:
```
VOTER1 → 123456
VOTER2 → 234567
VOTER3 → 345678
VOTER4 → 456789
```

#### Face Verification:
- Grant camera permissions when prompted
- Look at your webcam
- The system will detect your face automatically
- Wait for 5 consecutive detections (about 2-3 seconds)

### Step 4: Connect Wallet

After KYC verification:
1. Click "Connect Wallet"
2. MetaMask will pop up
3. Click "Connect"
4. Approve the connection

### Step 5: Vote (Admin Flow First)

**If you imported Account #0** (the first account), you are the **Admin**. You'll see the Admin panel.

**Add Candidates:**
1. In the Admin panel, find "Add Candidate"
2. Enter candidate names (e.g., "Alice", "Bob", "Charlie")
3. Click "Add Candidate" for each
4. You should see the candidates list update

**Advance to Commit Phase:**
1. Click "Next Phase" to move from Setup → Commit
2. Wait for transaction to confirm

**Switch to Voter Account:**
1. Import a different account (Account #1 or #2)
2. Make sure the address matches one in `backend/kyc-data.json`
3. Refresh the page
4. Complete KYC again as that voter

**Vote as Voter:**
1. You'll see the Voter interface
2. Select a candidate from the dropdown
3. Enter a password (salt) - e.g., "mysecretpassword123"
4. Click "Commit Vote"
5. Confirm transaction in MetaMask
6. Wait for confirmation

**Advance to Reveal Phase (Switch Back to Admin):**
1. Import Admin account again (Account #0)
2. Refresh the page
3. Click "Next Phase" to move to Reveal phase

**Reveal Vote (Switch Back to Voter):**
1. Import the voter account again
2. Refresh the page
3. Select the SAME candidate you voted for
4. Enter the SAME password (salt)
5. Click "Reveal Vote"
6. Confirm transaction

**Finish Election (Admin):**
1. Switch to Admin account
2. Click "Next Phase" to finish election
3. View results in Tally page

---

## 🔧 Troubleshooting

### Issue 1: "Voter ID not found in KYC records"

**Solution:** The voter ID must match an address in `backend/kyc-data.json`.

Edit `backend/kyc-data.json`:
```json
[
  { "voterId": "VOTER1", "address": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" },
  { "voterId": "VOTER2", "address": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" },
  { "voterId": "VOTER3", "address": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" },
  { "voterId": "VOTER4", "address": "0x90F79bf6EB2c4f870365E785982E1f101E93b906" }
]
```

**Important:** Use the EXACT addresses from your Hardhat node output. They should match the accounts you imported to MetaMask.

After editing, restart the backend:
```bash
cd backend
npm start
```

### Issue 2: "Cannot reach backend"

**Check:**
1. Is Terminal 3 (backend) running?
2. Visit http://localhost:3001/api/kyc?voter_id=VOTER1 in your browser
3. You should see: `{"eligible":true,"address":"0x..."}`

**If not working:**
```bash
# Stop backend (Ctrl+C)
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Start backend again
cd backend
npm start
```

### Issue 3: "Camera not working"

**Grant Permissions:**
1. Browser should prompt for camera access
2. Click "Allow"
3. If you blocked it, click the camera icon in address bar
4. Change to "Allow"
5. Refresh the page

**If still not working:**
- Check browser console (F12) for errors
- The system will fall back to demo mode (auto-verify)

### Issue 4: "Wrong Network" in MetaMask

**Solution:**
1. Open MetaMask
2. Click network dropdown
3. Select "Hardhat Local" (Chain ID: 31337)
4. If it's not there, add it again (see Configuration step above)

### Issue 5: "Transaction Failed" or "Insufficient Funds"

**Solution:**
1. Make sure you're on Hardhat Local network
2. Your imported account should have 10000 ETH
3. If not, re-import the account
4. Try again

### Issue 6: "Nonce too high" Error

This happens when you restart the Hardhat node but MetaMask remembers old transactions.

**Solution:**
1. MetaMask → Settings → Advanced
2. Scroll to "Clear activity tab data"
3. Click "Clear"
4. Refresh the page

### Issue 7: Frontend Won't Load

**Check:**
1. Is Terminal 4 running?
2. Visit http://localhost:5173
3. Check console for errors (F12)

**Try:**
```bash
cd frontend
rm -rf node_modules
npm install
npm run dev
```

---

## 🎬 Demo Script (For Presentations)

Use this script for a smooth demo:

**Part 1: Intro (30 seconds)**
> "I'll show you BharatVote, a blockchain-based voting system with secure KYC verification. The system has three security layers: Voter ID verification, OTP authentication, and face recognition."

**Part 2: KYC Flow (1 minute)**
1. Enter voter ID: `VOTER1`
2. Click "Verify"
3. Enter OTP: `123456`
4. Show face to camera
5. "Notice the multi-factor authentication - this ensures only eligible voters can participate."

**Part 3: Admin Setup (1 minute)**
1. Connect MetaMask (Admin account)
2. Add candidates: Alice, Bob, Charlie
3. Click "Next Phase" to start commit phase
4. "The admin controls the election phases through the smart contract."

**Part 4: Voting (1 minute)**
1. Switch to voter account
2. Complete KYC again
3. Select candidate
4. Enter password
5. Click "Commit Vote"
6. "The vote is encrypted and stored on the blockchain. No one can see what I voted for yet."

**Part 5: Reveal (1 minute)**
1. Switch back to admin, advance to reveal phase
2. Switch back to voter
3. Enter same candidate and password
4. Click "Reveal Vote"
5. "Now I prove my vote by revealing the password. The smart contract verifies it matches my earlier commitment."

**Part 6: Results (30 seconds)**
1. Switch to admin, finish election
2. Show tally page
3. "All votes are now counted and verified on the blockchain. The results are transparent and tamper-proof."

**Total: ~5 minutes**

---

## 📊 Verification Commands

### Check if Backend is Running:
```bash
curl http://localhost:3001/api/kyc?voter_id=VOTER1
```
Expected output:
```json
{"eligible":true,"address":"0x90F79bf6EB2c4f870365E785982E1f101E93b906"}
```

### Check if Frontend is Running:
Open browser to: http://localhost:5173

### Check if Blockchain is Running:
```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  http://localhost:8545
```

### Check Contract Deployment:
Look for this output in Terminal 2:
```
BharatVote deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Merkle Root: 0x...
```

---

## 🎯 Success Checklist

Before starting your demo, verify:
- [ ] Terminal 1: Hardhat node running
- [ ] Terminal 2: Contract deployed successfully
- [ ] Terminal 3: Backend server running on port 3001
- [ ] Terminal 4: Frontend running on port 5173
- [ ] MetaMask connected to "Hardhat Local" network
- [ ] Test account imported to MetaMask
- [ ] Browser open to http://localhost:5173
- [ ] Camera permissions granted

---

## 💡 Tips for a Great Demo

1. **Pre-add candidates** before the demo to save time
2. **Test the full flow** once before presenting
3. **Keep the console open** (F12) to show transaction logs
4. **Use Hardhat Local** - it's instant, no waiting for confirmations
5. **Prepare multiple accounts** for voting as different voters
6. **Explain commit-reveal** - it's the key security feature

---

## 🔄 Restarting the Demo

If you need to start fresh:

**Stop everything:**
- Press `Ctrl+C` in all 4 terminals

**Clear MetaMask:**
1. Settings → Advanced → Clear activity tab data

**Restart:**
1. Start Terminal 1 (blockchain)
2. Start Terminal 2 (deploy) - **NEW CONTRACT ADDRESS**
3. Start Terminal 3 (backend)
4. Start Terminal 4 (frontend)
5. Refresh browser

---

## 📱 Mobile App

The React Native mobile app has been removed from this repository to keep the project focused on the web demo.

---

## ✅ You're Ready!

Everything is configured for a smooth local demo. The system includes:
- ✅ Voter ID verification microservice
- ✅ Mock OTP authentication
- ✅ Webcam-based face recognition
- ✅ Blockchain voting with commit-reveal
- ✅ Real-time results

**Enjoy your demo!** 🎉

