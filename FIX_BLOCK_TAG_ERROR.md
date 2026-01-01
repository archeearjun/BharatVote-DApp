# Fix "Invalid Block Tag" Error

## Problem
The error `Received invalid block tag 8. Latest block number is 2` occurs when:
- The Hardhat node was restarted, resetting the blockchain
- The frontend or deployment script is trying to query a block that no longer exists
- There's a cached block number from a previous session

## Solution

### Step 1: Restart Everything Fresh

1. **Stop all running processes:**
   - Stop the Hardhat node (Ctrl+C)
   - Stop the backend server (Ctrl+C)
   - Stop the frontend dev server (Ctrl+C)

2. **Clear Hardhat cache (optional but recommended):**
   ```bash
   cd BharatVote-Week9-Backend
   Remove-Item -Recurse -Force cache
   Remove-Item -Recurse -Force artifacts
   ```

3. **Start services in this order:**

   **Terminal 1 - Hardhat Node:**
   ```bash
   cd BharatVote-Week9-Backend
   npm run node
   ```
   Wait until you see: `Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/`

   **Terminal 2 - Deploy Contract:**
   ```bash
   cd BharatVote-Week9-Backend
   npm run deploy
   ```

   **Terminal 3 - Backend Server:**
   ```bash
   cd BharatVote-Week9-Backend\backend
   node server.js
   ```

   **Terminal 4 - Frontend:**
   ```bash
   cd BharatVote-Week9-Frontend
   npm run dev
   ```

### Step 2: Clear Browser Cache

1. Open your browser (Chrome/Edge)
2. Press `Ctrl+Shift+Delete` to open Clear Browsing Data
3. Select "Cached images and files"
4. Click "Clear data"
5. Hard refresh the page: `Ctrl+Shift+R` or `Ctrl+F5`

### Step 3: Reset MetaMask

1. Open MetaMask
2. Go to Settings → Advanced
3. Click "Reset Account" (this clears transaction history, not your keys)
4. Or simply disconnect and reconnect to the Hardhat network

### Step 4: Verify It's Working

After restarting everything, check:
- Hardhat node shows block number increasing
- Deployment completes without "invalid block tag" errors
- Frontend loads without errors
- Browser console shows: `DEBUG: Current Block Number: [number]`

## Why This Happens

When Hardhat node restarts, it creates a fresh blockchain starting from block 0. If the frontend or any script was caching block number 8 from a previous session, it will fail because that block doesn't exist in the new chain.

## Prevention

- Always restart the Hardhat node before deploying
- Don't keep old browser tabs open when restarting the node
- Clear browser cache if you see block number mismatches

## Quick Fix Command

If you just need to restart everything quickly:

```powershell
# Stop all node processes (run in PowerShell)
Get-Process node | Stop-Process -Force

# Then restart in order:
# 1. npm run node (in BharatVote-Week9-Backend)
# 2. npm run deploy (in BharatVote-Week9-Backend)
# 3. node server.js (in BharatVote-Week9-Backend/backend)
# 4. npm run dev (in BharatVote-Week9-Frontend)
```
