# Fix "Contract call failed" Error

## Problem
The error "Contract call failed - check if the contract is properly deployed and the network is correct" occurs when:
1. The contract is not deployed at the expected address
2. The ABI doesn't match the deployed contract
3. The Hardhat node is not running

## Solution Steps

### Step 1: Verify Hardhat Node is Running
Make sure you have a terminal running:
```bash
cd BharatVote-Week9-Backend
npm run node
```
This should show "Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/"

### Step 2: Re-deploy the Contract
In a **new terminal** (keep the Hardhat node running), run:
```bash
cd BharatVote-Week9-Backend
npm run deploy
```

This will:
- Deploy the contract to the local Hardhat network
- Set the Merkle root automatically
- Update the frontend contract JSON file with the correct address and ABI

### Step 3: Verify Contract Address
After deployment, check the terminal output. It should show:
```
✅ Contract deployed at: 0x...
```

Make sure this address matches what's in:
`BharatVote-Week9-Frontend/src/contracts/BharatVote.json`

### Step 4: Refresh the Frontend
1. Hard refresh your browser (Ctrl+Shift+R or Ctrl+F5)
2. Disconnect and reconnect your MetaMask wallet
3. Make sure MetaMask is connected to "Hardhat Localhost" (Chain ID: 31337)

### Step 5: Check Browser Console
Open browser DevTools (F12) and check the console for:
- `DEBUG: Contract code length:` (should be > 0)
- `DEBUG: Contract exists: true`
- Any error messages

## Common Issues

### Issue: "No contract code at address"
**Solution:** The contract isn't deployed. Run `npm run deploy` in the backend directory.

### Issue: "unrecognized-selector" errors
**Solution:** ABI mismatch. The ABI has been updated automatically. If it persists:
1. Stop the Hardhat node
2. Delete `BharatVote-Week9-Backend/cache` and `BharatVote-Week9-Backend/artifacts`
3. Run `npm run compile` in the backend
4. Run `npm run deploy` again

### Issue: Wrong Network
**Solution:** Make sure MetaMask is connected to:
- Network: Hardhat Localhost
- Chain ID: 31337
- RPC URL: http://127.0.0.1:8545

## Quick Fix Command
If everything else fails, run this sequence:
```bash
# Terminal 1: Start Hardhat node
cd BharatVote-Week9-Backend
npm run node

# Terminal 2: Deploy contract
cd BharatVote-Week9-Backend
npm run deploy

# Terminal 3: Start backend server
cd BharatVote-Week9-Backend/backend
node server.js

# Terminal 4: Start frontend
cd BharatVote-Week9-Frontend
npm run dev
```

Then refresh your browser and reconnect MetaMask.
